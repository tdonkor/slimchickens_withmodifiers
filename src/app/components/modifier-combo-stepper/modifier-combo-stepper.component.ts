import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { BasketService } from '../../services/basket.service';
import { SessionService } from '../../services/session.service';
import { ApplicationSettingsService } from '../../services/app-settings.service';
import { Animations } from '../../animation/animation';
import { ComboModifierLabelTranslationPipe } from '../../pipes/translate-combo-modifier-label.pipe';
import { AbstractDynamicComponent } from '../../services/dynamic-content/models/abstract-dynamic.component';
import { DotCdkTranslateCaptionPipe } from '../../pipes/dot-translate-caption.pipe';
import { DynamicContentParams } from '../../services/dynamic-content/models/dynamic-content.params';
import { DynamicContentRef } from '../../services/dynamic-content/models/dynamic-content.ref';
import { DynamicContentService } from '../../services/dynamic-content/dynamic-content.service';
import { DotCdkTranslatePipe } from '../../pipes/dot-translate.pipe';
import { DotButton, DotModifier, DotSuggestionSalesService, generateUUID } from 'dotsdk';
import { TranslateCatalogModifierLabel } from '../../pipes/translate-catalog-modifier-label.pipe';
import { ButtonDetailsService } from '../button-details/button-details.service';
import { BasketComponent } from '../basket/basket.component';
import { log } from '../../helpers/log.helper';
import { isAdaEnabled } from '../../helpers/ada.helper';
import { Suggestion } from '../../models/interfaces/suggestion.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Subscription } from 'rxjs';
import { isAutoPopFeatVisible } from '../../helpers/auto-pop-feat.helper';

@Component({
  selector: 'acr-modifier-combo-stepper',
  templateUrl: './modifier-combo-stepper.component.html',
  providers: [DotCdkTranslateCaptionPipe],
  encapsulation: ViewEncapsulation.None,
  animations: [Animations.popupIn, Animations.popupOut],
})
export class ModifierComboStepperComponent
  extends AbstractDynamicComponent
  implements OnInit, OnDestroy {
  public button: DotButton;
  public _modifiers: DotModifier[] = [];
  public catalogModifierLabelText?: string;
  public currentModifierStepIndex = 0;
  public lastIndex = 0;
  public isAdaEnabled = isAdaEnabled;
  public subscriptions: Subscription[] = [];
  @ViewChild('modifierMessagesTpl') public modifierMessagesTpl: ElementRef;
  constructor(
    protected dataParams: DynamicContentParams,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected dynamicContentRef: DynamicContentRef,
    protected sessionService: SessionService,
    protected dotTranslateCaption: DotCdkTranslateCaptionPipe,
    protected appSettings: ApplicationSettingsService,
    protected basketService: BasketService,
    protected dynamicContentService: DynamicContentService,
    protected translatePipe: DotCdkTranslatePipe,
    protected translateComboModifierLabelPipe: ComboModifierLabelTranslationPipe,
    protected cdRef: ChangeDetectorRef,
    private translateCatalogModifierLabel: TranslateCatalogModifierLabel,
    private buttonDetailsService: ButtonDetailsService,
    @Inject('SUGGESTION_COMPONENT') protected suggestionComponent: Type<AbstractDynamicComponent>
  ) {
    super();
  }
  public get mofifierStepButtons(): DotModifier {
    return this.modifiers[this.currentModifierStepIndex];
  }
  public get getQuantityButtons() {
    let totalQty = 0;
    if(this.mofifierStepButtons) {
      totalQty += this.mofifierStepButtons.Buttons.reduce((totalQuantity: number, button: DotButton) => totalQuantity + button.quantity, 0);
    }
    return totalQty;
  }
  public get disableConfirmButton(): boolean {
    return this.modifiers.length > 0 && this.getQuantityButtons < this.modifiers[this.currentModifierStepIndex].PageInfo.MinQuantity;
  }

  public isLastStep(): number {
    // return this.currentModifierStepIndex === this.lastIndex;
    return this.lastIndex = this.modifiers.length;
  }
  public get activeIndex() {
    return this.currentModifierStepIndex;
  }
  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s?.unsubscribe());
  }
  public get modifiers(): DotModifier[] {
    let result = this._modifiers.filter((modifier) => isAutoPopFeatVisible(modifier, !this.button.isChanged, true));
    return result;
  }

  public ngOnInit() {
    this.button = _.cloneDeep(this.dataParams.btn);
    this._modifiers = this.button.ModifiersPage.Modifiers;
    this.lastIndex = this.modifiers.length;
    this.catalogModifierLabelText = this.translateCatalogModifierLabel.transform(this.button);
    this.buttonDetailsService.init(this.button);
    if (!this.button.uuid) {
      this.buttonDetailsService.setModifiersIncludedQuantity();
    }
  }

  public confirmClick() {
    if (this.currentModifierStepIndex >= this.lastIndex - 1) {
      this.button['$$suggestionChanged'] = true;
      this.button.Selected = true;
      this.button.quantity = this.button.quantity ? this.button.quantity : 1;
      this.buttonDetailsService.addAutoCompleteModifiers();
      if (this.button['JumpToPage']) {
        this.router.navigate(['menu', this.button['JumpToPage']]);
      }
      const suggestions = DotSuggestionSalesService.getInstance().getButtonSuggestionByLink(this.button.Link);
      if (suggestions && suggestions.length > 0 && !this.dataParams.fromSuggestions) {
        this.button['parentLinkUUID'] = this.button['parentLinkUUID'] || generateUUID();
        this.dynamicContentService.openContent(this.suggestionComponent, { suggestion: new Suggestion(suggestions, this.button['parentLinkUUID']) });
      }
      if (!this.dataParams.disableAddButtonToBasket) {
        this.basketService.addButtonToBasket(this.button);
      }
      setTimeout(() => {
        this.dynamicContentRef.close(this.button);
        if (this.appSettings.viewBasketAfterProductSelection === true && !suggestions && !this.dataParams.fromSuggestions) {
          this.basketService.openBasket(BasketComponent);
        }
      }, 350);
      log('button added:', this.button);
    } else {
      this.currentModifierStepIndex++;
    }
  }
  public backClick() {
    if (this.currentModifierStepIndex > 0) {
      this.currentModifierStepIndex--;
    }
  }

  public cancelClick(): void {
    const contentRef = this.dynamicContentService.openContent(ConfirmDialogComponent, {
      title: this.translatePipe.transform('20210201001'),
      leftButtonText: this.translatePipe.transform('32'),
      rightButtonText: this.translatePipe.transform('33'),
    });

    this.subscriptions.push(
      contentRef.afterClosed.subscribe((response) => {
        if (response === 'Yes') {
          this.button.Selected = false;
          setTimeout(() => {
            this.dynamicContentRef.close(this.button);
            if (
              this.appSettings.viewBasketAfterProductSelection === true &&
              !this.dataParams.fromSuggestions &&
              this.basketService.buttons &&
              this.basketService.buttons.length > 0
            ) {
              this.basketService.openBasket(BasketComponent);
            }
          }, 350);
        }
      })
    );
  }
}
