import { AfterContentChecked, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, Type, ViewChild } from '@angular/core';
import { ApplicationSettingsService } from '../../services/app-settings.service';
import { SessionService } from '../../services/session.service';
import { BasketService } from '../../services/basket.service';
import { DotButton, DotModifier, calculateButtonPrice, DotSuggestionSalesService, DotButtonType } from 'dotsdk';
import { log } from '../../helpers/log.helper';
import * as _ from 'lodash';
import { BasketComponent } from '../basket/basket.component';
import { Animations } from '../../animation/animation';
import { ButtonDetailsService } from './button-details.service';
import { TranslateCatalogModifierLabel } from '../../pipes/translate-catalog-modifier-label.pipe';
import { isAutoPopFeatVisible } from '../../helpers/auto-pop-feat.helper';
import { AbstractDynamicComponent } from '../../services/dynamic-content/models/abstract-dynamic.component';
import { DynamicContentParams } from '../../services/dynamic-content/models/dynamic-content.params';
import { DynamicContentRef } from '../../services/dynamic-content/models/dynamic-content.ref';
import { DynamicContentService } from '../../services/dynamic-content/dynamic-content.service';
import { DotCdkTitleTranslatePipe } from '../../pipes/dot-title-translate.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { Suggestion } from '../../models/suggestion.model';
import { generateUUID } from '../../helpers/uuid.helper';
import { enabledTouchlessMode } from '../../helpers/ada.helper';
import {IngredientsService} from '../../services/ingredients.service';

@Component({
  selector: 'acr-button-details',
  templateUrl: './button-details.component.html',
  animations: [Animations.popupIn, Animations.popupOut]
})
export class ButtonDetailsComponent extends AbstractDynamicComponent implements OnInit, AfterViewInit, AfterContentChecked, AfterViewChecked {
  @ViewChild('scrollRef') public scrollRef: ElementRef;
  public enabledTouchlessMode = enabledTouchlessMode;
  public button: DotButton;
  public exitAnimation = false;
  public catalogModifierLabelText ?: string;
  private _scrollIncrement;

  public get unitPrice(): string {
    return this.button.Price;
  }
  public get modifiers(): DotModifier[] {
    return this.button.hasModifiers ? this.button.ModifiersPage.Modifiers : [];
  }
  public get buttonPrice(): number {
    return calculateButtonPrice(this.button, this.sessionService.serviceType);
  }

  public get displayModifierButtons(): boolean {
    // if modifier group MinQty not reached and there is no AutoComplete on any modifier, force AutoPopFeat = 1 so the modifiers are visible and the appropriate quantities can be selected
    for (const modifier of this.modifiers) {
      const autoCompleteButton = modifier.Buttons.find(mod => mod.AutoComplete === 1);
      const qtyButtons = modifier.Buttons.reduce((totalQuantity: number, button: DotButton) => totalQuantity + button.quantity, 0);
      if (modifier.PageInfo.MinQuantity && modifier.PageInfo.MinQuantity > qtyButtons && !autoCompleteButton) {
       modifier.PageInfo.AutoPopFeat = '1';
      }
    }
    return this.modifiers.filter(modifier => isAutoPopFeatVisible(modifier, !this.button.isChanged, true)).length > 0;
  }

  public get isButtonChanged() {
    return this.button.isChanged;
  }
  // Added by TD
  public get calories(): string {
    return this.resolveCalories();
  }

  public get price(): number {
    return this.buttonPrice * this.button.quantity;
  }

  // Added by TD
  private _calories: string | undefined;

  // removed by TD  as it doesn't work
  // public get calories(): string {
  //   const calories = this.button?.AllergensAndNutritionalValues?.NutritionalValues?.find(val => val.Name === 'CAL');
  //   return calories ? calories.Value : '';
  // }

  // Added by TD
  private resolveCalories(): string {
    if (this._calories == null) {
      this._calories = this.ingredientsService.resolveCalories(this.button);
    }
    return this._calories;
  }
  public get getQuantityButtons() {
    let totalQty = 0;
    this.modifiers.some(y => y.Buttons.filter(btn => btn.ButtonType === DotButtonType.ITEM_PACK_BUTTON).forEach(x => {
     totalQty += x.Page.Buttons.reduce((totalQuantity: number, button: DotButton) => totalQuantity + button.quantity, 0);
    }));
    this.modifiers.forEach(x => totalQty += x.Buttons.reduce((totalQuantity: number, button: DotButton) => totalQuantity + button.quantity, 0));
    return totalQty;
  }

  public get disableConfirmButton(): boolean {
    return this.modifiers.length === 0 ? this.button.quantity < this.button.MinQuantity : this.modifiers.filter(modif => isAutoPopFeatVisible(modif, (!this.button.isChanged), true)).some(modifier => {
      return (this.getQuantityButtons < modifier.PageInfo.MinQuantity) && !this.modifiers.some(x => x.Buttons.find( y => y.AutoComplete === 1));
    });
  }

  public get scrollIncrement(): number {
    return this._scrollIncrement;
  }

  constructor(
    protected dataParams: DynamicContentParams,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected dynamicContentRef: DynamicContentRef,
    protected dynamicContentService: DynamicContentService,
    protected titleTranslatePipe: DotCdkTitleTranslatePipe,
    protected appSettings: ApplicationSettingsService,
    protected basketService: BasketService,
    protected sessionService: SessionService,
    protected ingredientsService: IngredientsService,
    private componentService: ButtonDetailsService,
    private ref: ChangeDetectorRef,
    @Inject('SUGGESTION_COMPONENT') protected suggestionComponent: Type<AbstractDynamicComponent>,
    private translateCatalogModifierLabel: TranslateCatalogModifierLabel) {
    super();
  }

  public ngOnInit(): void {
    this.button = _.cloneDeep(this.dataParams.btn);
    this.button.quantity = this.button.quantity ? this.button.quantity : 1;
    this.componentService.init(this.button);
    if (!this.button.uuid) {
      this.componentService.setModifiersIncludedQuantity();
    }
    this.catalogModifierLabelText = this.translateCatalogModifierLabel.transform(this.button);
    log('button: ', this.button);
  }

  public ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  public ngAfterViewChecked() {
    this.ref.detectChanges();
  }

  public ngAfterViewInit() {
    this.verticalScrollIncrement();
  }

  public onQuantityUpdate(count: 1 | -1): void {
    if (count > 0) {
      this.button.Selected = true;
      this.button.quantity ++;
    } else {
     if (this.button.quantity > 1) {
       this.button.quantity --;
      }
    }
  }

  public quantity(): number {
    return this.button.quantity = this.button.quantity === 0 ?  1 : this.button.quantity;
  }

  public confirmClick(): void {
    this.button['$$suggestionChanged'] = true;
    this.componentService.addAutoCompleteModifiers();
    if (this.button['JumpToPage']) {
      this.router.navigate(['menu', this.button['JumpToPage']]);
    }
    const suggestions = DotSuggestionSalesService.getInstance().getButtonSuggestionByLink(this.button.Link);

    if (suggestions && suggestions.length > 0 && !this.dataParams.fromSuggestions) {
      this.button['parentLinkUUID'] = this.button['parentLinkUUID'] || generateUUID();
      this.dynamicContentService.openContent(this.suggestionComponent, {suggestion: new Suggestion(suggestions, this.button['parentLinkUUID'])});
    }

    if (!this.dataParams.disableAddButtonToBasket) {
      this.basketService.addButtonToBasket(this.button);
    }
    this.exitAnimation = true;
    setTimeout(() => {
      this.dynamicContentRef.close(this.button);
      if (this.appSettings.viewBasketAfterProductSelection === true && !suggestions && !this.dataParams.fromSuggestions) {
        this.basketService.openBasket(BasketComponent);
      }
    } , 350);
    log('button added:', this.button);
  }

  public cancelClick(): void {
    this.button['$$suggestionChanged'] = false;
    this.exitAnimation = true;
    setTimeout(() => {
      this.dynamicContentRef.close(this.button);
      if (this.appSettings.viewBasketAfterProductSelection === true && !this.dataParams.fromSuggestions && this.basketService.buttons && this.basketService.buttons.length > 0) {
        this.basketService.openBasket(BasketComponent);
      }
    }, 350);
  }

  private verticalScrollIncrement() {
    this._scrollIncrement = this.scrollRef ? this.scrollRef?.nativeElement?.clientHeight / 1.2 : 0;
  }
}
