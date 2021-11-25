import { Component, OnInit, Injector } from '@angular/core';
import { PosElogHandler, PosInjectorService, AtpPrinterService } from 'dotsdk';
import { CheckoutService } from '../../../services/checkout.service';
import { ApplicationSettingsService } from '../../../services/app-settings.service';
import { Router } from '@angular/router';
import { log } from '../../../helpers/log.helper';
import { PrinterService } from '../../../services/printer/printer.service';
import { PosOperationsService } from '../../../services/pos-operations.service';
import { CalculateTotalMode } from '../../../enums/calculate-total-mode.enum';
import { PaymentModelService } from '../../../services/payment-model.service';
import { InactivityService } from '../../../services/inactivity.service';

@Component({
  selector: 'acr-tender-order',
  templateUrl: 'tender-order.component.html',
})
export class TenderOrderComponent implements OnInit {

constructor(
    protected injector: Injector,
    protected appSettingsService: ApplicationSettingsService,
    protected checkoutService: CheckoutService,
    protected router: Router,
    protected printerService: PrinterService,
    protected posOperationService: PosOperationsService,
    protected paymentModelService: PaymentModelService
  ) {
  }

  public get dynamicContentService() {
    // Injecting this into constructors breaks the injecting pipeline of ....RuleService
    // Until we find out why leave it as it is
    return this.injector.get(InactivityService);
  }

  public async ngOnInit() {
    await this.getTenderOrderResponse();
  }

  public async getTenderOrderResponse() {
    PosElogHandler.getInstance().posConfig.posHeader.isPreOrder = false;
    log('tender order sent: ', PosElogHandler.getInstance().posConfig);
    const tenderOrderResponse = await PosInjectorService.getInstance()
      .tenderOrderOnPos(this.appSettingsService.posInjectorPath, PosElogHandler.getInstance().posConfig)
      .catch(e => null);
    log('tender order response: ', tenderOrderResponse);
    this.navigateFromTenderOrder(tenderOrderResponse);
  }

  protected async navigateFromTenderOrder(tenderOrderResponse) {
    // tslint:disable-next-line: triple-equals
    if (!tenderOrderResponse || tenderOrderResponse.ReturnCode != 0 || !tenderOrderResponse.OrderPOSNumber) {
      this.checkoutService.receiptContent = '';
      if (PosElogHandler.getInstance().posConfig.posHeader?.cvars?.TS_No) {
        if (this.appSettingsService.unlockOrder) {
          await this.posOperationService.sendUnlockOrderToPOS();
        }
        this.router.navigate(['ts-unavailable']);
      } else {
        this.router.navigate(['checkout-error', { posOperation: 'unlock-order' }]);
      }
      await this.printerService.printReceipt(true);
      return;
    }
    this.checkoutService.orderPOSNumber = tenderOrderResponse.OrderPOSNumber;
    this.checkoutService.receiptContent = tenderOrderResponse.Receipt;
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

