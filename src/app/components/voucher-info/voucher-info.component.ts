import { Component } from '@angular/core';
import { DynamicContentService } from '../../services/dynamic-content/dynamic-content.service';
import { NutritionalInformationDisplayType, PromoInputOption } from '../../enums/general.enum';
import { PromosComponent } from '../../pages/promotions/promos.component';
import { ApplicationSettingsService } from '../../services/app-settings.service';
import { StatusService } from '../../services/status.service';
import { AllergenSelectionComponent } from '../allergen-selection/allergen-selection.component';
import { CaloriesComponent } from '../calories/calories.component';
@Component({
  selector: 'acr-voucher-info',
  templateUrl: './voucher-info.component.html'
})
export class VoucherInfoComponent {

  public get displayCaloriesButton(): boolean {
    return this.appSettings.nutritionalInformationDisplayType === NutritionalInformationDisplayType.ONLY_CALORIES ||
            this.appSettings.nutritionalInformationDisplayType === NutritionalInformationDisplayType.ALL;
  }

  public get displayAllergensButton(): boolean {
    return this.appSettings.nutritionalInformationDisplayType === NutritionalInformationDisplayType.ONLY_ALLERGENS ||
    this.appSettings.nutritionalInformationDisplayType === NutritionalInformationDisplayType.ALL;
  }

  public get displayPromoButton(): boolean {
    return this.appSettings.promoInputOption === PromoInputOption.BOTH ||
      this.appSettings.promoInputOption === PromoInputOption.KEYBOARD ||
      (this.appSettings.promoInputOption === PromoInputOption.SCANNER && this.statusService.scannerActive);
  }

  constructor(
    protected dynamicContentService: DynamicContentService,
    protected appSettings: ApplicationSettingsService,
    protected statusService: StatusService) {}
  public useVoucher() {
    this.dynamicContentService.openContent(PromosComponent, {});
  }

  public toCalories(): void {
    this.dynamicContentService.openContent(CaloriesComponent, {});
  }
  public allergensClick() {
    this.dynamicContentService.openContent(AllergenSelectionComponent, {});
  }
}
