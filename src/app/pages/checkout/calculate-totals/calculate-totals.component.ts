import { Component, OnInit } from '@angular/core';
import { PosElogHandler, PosInjectorService } from 'dotsdk';
import { ApplicationSettingsService } from '../../../services/app-settings.service';
import { CheckoutService } from '../../../services/checkout.service';
import { Router } from '@angular/router';
import { log } from '../../../helpers/log.helper';
import { CalculateTotalMode } from '../../../enums/calculate-total-mode.enum';
import { PaymentModelService } from '../../../services/payment-model.service';
import { InactivityService } from '../../../services/inactivity.service';

@Component({
  selector: 'acr-calculate-totals',
  templateUrl: 'calculate-totals.component.html',
})
export class CalculateTotalsComponent implements OnInit  {
  constructor(
    protected inactivityService: InactivityService,
    protected appSettingsService: ApplicationSettingsService,
    protected checkoutService: CheckoutService,
    protected router: Router,
    protected paymentModelService: PaymentModelService) {
  }

  public async ngOnInit() {
    this.getCalculateTotalsResponse();
  }

  public async getCalculateTotalsResponse() {
    PosElogHandler.getInstance().posConfig.posHeader.posStartTime = new Date();
    log('calculate totals sent: ', PosElogHandler.getInstance().posConfig);
    const calculateTotalsResponse = await PosInjectorService.getInstance()
      .calculateTransactionTotals(this.appSettingsService.posInjectorPath, PosElogHandler.getInstance().posConfig)
      .catch((e) => null);
    // this.populateElogAfterPOS(calculateTotalsResponse);
    log('calculate totals response: ', calculateTotalsResponse);
    this.navigateFromCalculateTotals(calculateTotalsResponse);
  }

  protected navigateFromCalculateTotals(calculateTotalsResponse) {
    const orderPosNumberMandatory = this.appSettingsService.calculateTotalMode === CalculateTotalMode.VOID_ON_RETURN ? true : false;
    // tslint:disable-next-line: triple-equals
    if (!calculateTotalsResponse || calculateTotalsResponse.ReturnCode != 0 || (orderPosNumberMandatory && !calculateTotalsResponse.OrderPOSNumber)) {
      this.router.navigate(['checkout-error'])  ;
      return;
    }
    if (orderPosNumberMandatory) {
      this.checkoutService.orderPOSNumber = calculateTotalsResponse.OrderPOSNumber;
      PosElogHandler.getInstance().posConfig.posHeader.orderPosNumber = this.checkoutService.orderPOSNumber.toString();
    } else {
      this.checkoutService.orderPOSNumber = null;
    }
    this.checkoutService.subtotalCents = (Number(calculateTotalsResponse.SubtotalCents) || 0);
    this.checkoutService.taxCents = (Number(calculateTotalsResponse.TaxCents) || 0);
    this.updateTenders();
    this.paymentModelService.resetPaymentModel();
    this.router.navigate(['cod-view']);
  }

  protected updateTenders() {
    if (!PosElogHandler.getInstance().posConfig.posHeader.amounts.services) {
      PosElogHandler.getInstance().posConfig.posHeader.amounts.services = [];
    }

    PosElogHandler.getInstance().posConfig.posHeader.amounts.subtotalAmount = (this.appSettingsService.SubtotalIncludesVAT === 1)  ?
      this.checkoutService.subtotalCents + this.checkoutService.taxCents :
      this.checkoutService.subtotalCents;
    PosElogHandler.getInstance().posConfig.posHeader.amounts.taxAmount = this.checkoutService.taxCents;
    PosElogHandler.getInstance().posConfig.posHeader.amounts.amountsTotalPaid = this.checkoutService.subtotalCents + this.checkoutService.taxCents;
  }

}
