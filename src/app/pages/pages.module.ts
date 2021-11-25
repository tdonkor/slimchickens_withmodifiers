import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannersComponent } from './banners/banners.component';
import { ServiceTypeComponent } from './service-type/service-type.component';
import { MenuComponent } from './menu/menu.component';
import { ComponentsModules } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.modules';
import { PaymentSelectionComponent } from './checkout/payment-selection/payment-selection.component';
import { CheckoutErrorComponent } from './checkout/checkout-error/checkout-error.component';
import { PaymentProgressComponent } from './checkout/payment-progress/payment-progress.component';
import { OpenOrderComponent } from './checkout/open-order/open-order.component';
import { LoadingComponent } from './checkout/loading/loading.component';
import { CompleteOrderComponent } from './checkout/complete-order/complete-order.component';
import { CalculateTotalsComponent } from './checkout/calculate-totals/calculate-totals.component';
import { TenderOrderComponent } from './checkout/tender-order/tender-order.component';
import { OrderNumberComponent } from './checkout/order-number/order-number.component';
import { CodViewComponent } from './checkout/cod-view/cod-view.component';
import { PromosComponent } from './promotions/promos.component';
import { GloryLegalRequirementsComponent } from './checkout/glory/legal-requirements/glory-legal-requirements.component';
import { GloryPaymentProgressComponent } from './checkout/glory/payment-progress/glory-payment-progress.component';
import { GloryCashInfoComponent } from './checkout/glory/cash-info/glory-cash-info.component';


@NgModule({
  imports: [
    CommonModule,
    ComponentsModules,
    PipesModule
  ],
  declarations: [
    BannersComponent,
    ServiceTypeComponent,
    MenuComponent,
    PaymentSelectionComponent,
    PaymentProgressComponent,
    CheckoutErrorComponent,
    OpenOrderComponent,
    LoadingComponent,
    CalculateTotalsComponent,
    CompleteOrderComponent,
    TenderOrderComponent,
    OrderNumberComponent,
    CodViewComponent,
    PromosComponent,
    GloryLegalRequirementsComponent,
    GloryPaymentProgressComponent,
    GloryCashInfoComponent
  ],
  exports: [
    BannersComponent,
    ServiceTypeComponent,
    MenuComponent,
    PaymentSelectionComponent,
    PaymentProgressComponent,
    CheckoutErrorComponent,
    OpenOrderComponent,
    LoadingComponent,
    CalculateTotalsComponent,
    CompleteOrderComponent,
    TenderOrderComponent,
    OrderNumberComponent,
    CodViewComponent,
    PromosComponent,
    GloryLegalRequirementsComponent,
    GloryPaymentProgressComponent,
    GloryCashInfoComponent
  ],
  providers: []
})
export class PagesModule { }
