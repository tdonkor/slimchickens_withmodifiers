import { Component, OnInit, Injector } from '@angular/core';
import { PosElogHandler, PosInjectorService, AtpPrinterService } from 'dotsdk';
import { CheckoutService } from '../../../services/checkout.service';
import { ApplicationSettingsService } from '../../../services/app-settings.service';
import { Router } from '@angular/router';
import { log } from '../../../helpers/log.helper';
import { PrinterService } from '../../../services/printer/printer.service';
import { PaymentModelService } from '../../../services/payment-model.service';
import { InactivityService } from '../../../services/inactivity.service';

@Component({
  selector: 'acr-complete-order',
  templateUrl: 'complete-order.component.html',
})
export class CompleteOrderComponent implements OnInit {

constructor(
    protected injector: Injector,
    protected appSettingsService: ApplicationSettingsService,
    protected checkoutService: CheckoutService,
    protected router: Router,
    protected printerService: PrinterService,
    protected paymentModelService: PaymentModelService
  ) {
  }

  public get dynamicContentService() {
    // Injecting this into constructors breaks the injecting pipeline of ....RuleService
    // Until we find out why leave it as it is
    return this.injector.get(InactivityService);
  }

  public async ngOnInit() {
    await this.getCompleteOrderResponse();
  }

  public async getCompleteOrderResponse() {
    PosElogHandler.getInstance().posConfig.posHeader.isPreOrder = false;
    log('complete order sent: ', PosElogHandler.getInstance().posConfig);
    const completeOrderResponse = await PosInjectorService.getInstance()
      .sendCompleteOrderToPos(this.appSettingsService.posInjectorPath, PosElogHandler.getInstance().posConfig)
      .catch(e => null);
    log('complete order response: ', completeOrderResponse);
    await this.navigateFromCompleteOrder(completeOrderResponse);
  }

  protected async navigateFromCompleteOrder(completeOrderResponse) {
    // tslint:disable-next-line: triple-equals
    if (!completeOrderResponse || completeOrderResponse.ReturnCode != 0 || !completeOrderResponse.OrderPOSNumber) {
      this.checkoutService.orderPOSNumber = 0;
      this.checkoutService.receiptContent = '';
      await this.printerService.printReceipt(true);
      if (PosElogHandler.getInstance().posConfig.posHeader?.cvars?.TS_No) {
        this.router.navigate(['ts-unavailable']);
      } else {
        this.router.navigate(['checkout-error']);
      }
      return;
    }
    this.checkoutService.orderPOSNumber = completeOrderResponse.OrderPOSNumber;
    this.checkoutService.receiptContent = completeOrderResponse.Receipt;
    if (this.paymentModelService.getTotalAmountPaidWithCash() <= this.paymentModelService.initialAmountThatCanBePaidWithCash) {
      this.printerService.printReceipt(false);
    } else {
      this.checkoutService.receiptContent = this.printerService.buildErrorsCashMachineReceipt(true);
      await AtpPrinterService.getInstance()
        .print(this.checkoutService.receiptContent)
        .catch(e => null);
    }
    if (PosElogHandler.getInstance().posConfig.posHeader?.cvars?.TS_No) {
      this.router.navigate(['ts-confirmation']);
    } else {
      this.router.navigate(['order-number']);
    }
  }
}

