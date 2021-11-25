import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonsCounterEditComponent } from './buttons-counter-edit/buttons-counter-edit.component';
import { PipesModule } from '../pipes/pipes.modules';
import { ButtonComponent } from './button/button.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ButtonModifierComponent } from './button-modifier/button-modifier.component';
import { BasketComponent } from './basket/basket.component';
import { FooterActionsComponent } from './footer-actions/footer-actions.component';
import { VoucherInfoComponent } from './voucher-info/voucher-info.component';
import { OrderButtonComponent } from './basket/order-button/order-button.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { StatusComponent } from './status/status.component';
import { ComboStepperComponent } from './combo-stepper/combo-stepper.component';
import { CollapsibleComponent } from './collapsible/collapsible.component';
import { NavSliderComponent } from './nav-slider/nav-slider.component';
import { ButtonModifierListComponent } from './button-modifier-list/button-modifier-list.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { ButtonDetailsComponent } from './button-details/button-details.component';
import { CaloriesComponent } from './calories/calories.component';
import { AllergenSelectionComponent } from './allergen-selection/allergen-selection.component';
import { SuggestionSalesComponent } from './suggestion-sales/suggestion-sales.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { ScanComponent } from './scan/scan.component';
import { TableServiceSelectionComponent } from '../pages/table-service/selection/selection.component';
import { TableServiceConfirmationComponent } from '../pages/table-service/confirmation/confirmation.component';
import { TableServiceUnavailableComponent } from '../pages/table-service/unavailable/unavailable.component';
import { TableServiceEntryComponent } from '../pages/table-service/entry/entry.component';
import { PreorderComponent } from '../pages/checkout/preorder/preorder.component';
import { PaymentRetryComponent } from './payment-retry/payment-retry.component';
import { MakeItAMealComponent } from './make-it-a-meal/make-it-a-meal.component';
import { AdaBannersComponent } from './ada-banners/ada-banners.component';
import { PaymentLogosComponent } from './payment-logos/payment-logos.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { PromoStepperComponent } from './promo-stepper/promo-stepper.component';
import { StepsComponent } from './combo-stepper/stepper/steps.component';
import { ButtonModifierSubgroupComponent } from './button-modifier-subgroup/button-modifier-subgroup.component';
import { VerticalScrollButtonsComponent } from './vertical-scroll-buttons/vertical-scroll-buttons.component';
import { ModifierComboStepperComponent } from './modifier-combo-stepper/modifier-combo-stepper.component';
import { ModifierMessagesComponent } from './modifier-messages/modifier-messages.component';
@NgModule({
  imports: [ CommonModule, PipesModule],
  declarations: [
                 ConfirmDialogComponent,
                 ButtonComponent,
                 ButtonsCounterEditComponent,
                 ButtonModifierComponent,
                 BasketComponent,
                 FooterActionsComponent,
                 VoucherInfoComponent,
                 OrderButtonComponent,
                 ProductCardComponent,
                 DropdownComponent,
                 StatusComponent,
                 ComboStepperComponent,
                 CollapsibleComponent,
                 NavSliderComponent,
                 ButtonModifierListComponent,
                 SpinnerComponent,
                 KeyboardComponent,
                 ScanComponent,
                 ButtonDetailsComponent,
                 CaloriesComponent,
                 AllergenSelectionComponent,
                 SuggestionSalesComponent,
                 TableServiceSelectionComponent,
                 TableServiceConfirmationComponent,
                 TableServiceUnavailableComponent,
                 TableServiceEntryComponent,
                 PreorderComponent,
                 PaymentRetryComponent,
                 MakeItAMealComponent,
                 AdaBannersComponent,
                 PaymentLogosComponent,
                 InfoDialogComponent,
                 PromoStepperComponent,
                 StepsComponent,
                 ButtonModifierSubgroupComponent,
                 VerticalScrollButtonsComponent,
                 ButtonModifierSubgroupComponent,
                 ModifierComboStepperComponent,
                 ModifierMessagesComponent
                ],

  entryComponents: [
    ConfirmDialogComponent,
    BasketComponent,
    ComboStepperComponent,
    ButtonDetailsComponent,
    CaloriesComponent,
    AllergenSelectionComponent,
    SuggestionSalesComponent,
    PaymentRetryComponent,
    MakeItAMealComponent,
    AdaBannersComponent,
    InfoDialogComponent,
    PromoStepperComponent,
    ButtonModifierSubgroupComponent,
    ModifierComboStepperComponent,
    ModifierMessagesComponent
  ],

  exports: [
            ConfirmDialogComponent,
            ButtonComponent,
            ButtonsCounterEditComponent,
            ButtonModifierComponent,
            BasketComponent,
            FooterActionsComponent,
            VoucherInfoComponent,
            OrderButtonComponent,
            DropdownComponent,
            StatusComponent,
            ComboStepperComponent,
            NavSliderComponent,
            ProductCardComponent,
            ButtonModifierListComponent,
            SpinnerComponent,
            KeyboardComponent,
            ScanComponent,
            CaloriesComponent,
            AllergenSelectionComponent,
            TableServiceSelectionComponent,
            TableServiceConfirmationComponent,
            TableServiceUnavailableComponent,
            TableServiceEntryComponent,
            PreorderComponent,
            PaymentRetryComponent,
            AdaBannersComponent,
            PaymentLogosComponent,
            InfoDialogComponent,
            PromoStepperComponent,
            VerticalScrollButtonsComponent
          ]
})
export class ComponentsModules {}
