import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { DotButton, DotButtonType, DotCatalogLoader, DotCombosCatalogLoader, DotMeal } from 'dotsdk';
import { ComboStepperComponent } from '../combo-stepper/combo-stepper.component';
import { Animations } from '../../animation/animation';
import { log } from '../../helpers/log.helper';
import { AbstractDynamicComponent } from '../../services/dynamic-content/models/abstract-dynamic.component';
import { DynamicContentParams } from '../../services/dynamic-content/models/dynamic-content.params';
import { DynamicContentRef } from '../../services/dynamic-content/models/dynamic-content.ref';
import { DynamicContentService } from '../../services/dynamic-content/dynamic-content.service';
import { ContentService } from '../../services/content.service';
import { ButtonDetailsComponent } from '../button-details/button-details.component';

@Component({
  selector: 'acr-make-it-a-meal',
  templateUrl: './make-it-a-meal.component.html',
  animations: [Animations.popupIn, Animations.popupOut]
})
export class MakeItAMealComponent extends AbstractDynamicComponent implements OnInit {
  public exitAnimation = false;
  public buttons: DotMeal[];

  constructor(
    protected dataParams: DynamicContentParams,
    protected dynamicContentRef: DynamicContentRef,
    protected dynamicContentService: DynamicContentService,
    protected contentService: ContentService) {
    super();
  }

  public ngOnInit(): void {
    // this.buttons = _.cloneDeep(this.dataParams.btn);
    this.buttons = this.dataParams.btn.filter(button => button.ButtonType === DotButtonType.MENU_BUTTON || button.ButtonType === DotButtonType.ITEM_BUTTON);
    log('makeItAMeal: ', this.buttons);
  }

  public closeModal(buttonText?: string) {
    this.exitAnimation = true;
    setTimeout( () => this.dynamicContentRef.close(buttonText), 500);
  }

  public selectedMeal(mealButton: DotMeal) {
    let button: DotButton;
    switch (mealButton.ButtonType) {
      case DotButtonType.MENU_BUTTON:
        const comboCatalog = DotCombosCatalogLoader.getInstance().loadedModel;
        button = comboCatalog.Buttons.find(b => b.Link === mealButton.Id);
        if (button && button.hasCombos) {
          this.closeModal();
          this.dynamicContentService.openContent(ComboStepperComponent, {btn: button});
        }
        break;
      case DotButtonType.ITEM_BUTTON:
        const catalog = DotCatalogLoader.getInstance().loadedModel;
        button = catalog.Buttons.find(b => b.Link === mealButton.Id);
        if (button) {
          this.closeModal();
          this.dynamicContentService.openContent(ButtonDetailsComponent, {btn: button});
        }
        break;
      default:
        this.closeModal();
    }
  }
}

