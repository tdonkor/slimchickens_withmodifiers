import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BannersComponent } from './pages/banners/banners.component';
import { CalculateTotalsComponent } from './pages/checkout/calculate-totals/calculate-totals.component';
import { CheckoutErrorComponent } from './pages/checkout/checkout-error/checkout-error.component';
import { CodViewComponent } from './pages/checkout/cod-view/cod-view.component';
import { CompleteOrderComponent } from './pages/checkout/complete-order/complete-order.component';
import { GloryCashInfoComponent } from './pages/checkout/glory/cash-info/glory-cash-info.component';
import { GloryLegalRequirementsComponent } from './pages/checkout/glory/legal-requirements/glory-legal-requirements.component';
import { GloryPaymentProgressComponent } from './pages/checkout/glory/payment-progress/glory-payment-progress.component';
import { OpenOrderComponent } from './pages/checkout/open-order/open-order.component';
import { OrderNumberComponent } from './pages/checkout/order-number/order-number.component';
import { PaymentProgressComponent } from './pages/checkout/payment-progress/payment-progress.component';
import { PaymentSelectionComponent } from './pages/checkout/payment-selection/payment-selection.component';
import { PreorderComponent } from './pages/checkout/preorder/preorder.component';
import { TenderOrderComponent } from './pages/checkout/tender-order/tender-order.component';
import { MenuComponent } from './pages/menu/menu.component';
import { PromosComponent } from './pages/promotions/promos.component';
import { ServiceTypeComponent } from './pages/service-type/service-type.component';
import { TableServiceConfirmationComponent } from './pages/table-service/confirmation/confirmation.component';
import { TableServiceEntryComponent } from './pages/table-service/entry/entry.component';
import { TableServiceSelectionComponent } from './pages/table-service/selection/selection.component';
import { TableServiceUnavailableComponent } from './pages/table-service/unavailable/unavailable.component';

const routes: Routes = [
  {
    path: 'banners',
    component: BannersComponent,
  },
  {
    path: 'service-type',
    component: ServiceTypeComponent,
  },
  {
    path: 'menu/:pageId',
    component: MenuComponent,
  },
  {
    path: 'payment-selection',
    component: PaymentSelectionComponent,
  },
  {
    path: 'payment-progress',
    component: PaymentProgressComponent,
  },
  {
    path: 'checkout-error',
    component: CheckoutErrorComponent,
  },
  {
    path: 'open-order',
    component: OpenOrderComponent,
  },
  {
    path: 'calculate-totals',
    component: CalculateTotalsComponent,
  },
  {
    path: 'complete-order',
    component: CompleteOrderComponent,
  },
  {
    path: 'tender-order',
    component: TenderOrderComponent,
  },
  {
    path: 'order-number',
    component: OrderNumberComponent,
  },
  {
    path: 'cod-view',
    component: CodViewComponent,
  },
  {
    path: 'promos',
    component: PromosComponent,
  },
  {
    path: 'ts-selection',
    component: TableServiceSelectionComponent,
  },
  {
    path: 'ts-confirmation',
    component: TableServiceConfirmationComponent,
  },
  {
    path: 'ts-unavailable',
    component: TableServiceUnavailableComponent,
  },
  {
    path: 'ts-entry',
    component: TableServiceEntryComponent,
  },
  {
    path: 'preorder',
    component: PreorderComponent,
  },
  {
    path: 'glory-legal-requirements',
    component: GloryLegalRequirementsComponent,
  },
  {
    path: 'glory-payment-progress',
    component: GloryPaymentProgressComponent,
  },
  {
    path: 'glory-cash-info/:action',
    component: GloryCashInfoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
