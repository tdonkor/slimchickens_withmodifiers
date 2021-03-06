import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PosElogHandler, PosInjectorService, IPosResponse, AtpPrinterService, PosPaidState, PosTenderType } from 'dotsdk';
import { ApplicationSettingsService } from '../../../services/app-settings.service';
import { CheckoutService } from '../../../services/checkout.service';
import { log } from '../../../helpers/log.helper';
import { PosOperationsService } from '../../../services/pos-operations.service';
import { PAYMENT_TYPE } from '../../../enums/payment-type.enum';
import { PrinterService } from '../../../services/printer/printer.service';
import { CalculateTotalMode } from '../../../enums/calculate-total-mode.enum';
import { PaymentModelService } from '../../../services/payment-model.service';
import { DotCdkTranslatePipe } from '../../../pipes/dot-translate.pipe';
import { PrintReceiptBuilder } from '../../../services/printer/print-receipt-builder.service';
import { TranslationsService } from 'src/app/services/translations/translations.service';

@Component({
  selector: 'acr-open-order',
  templateUrl: 'open-order.component.html',
})
export class OpenOrderComponent implements OnInit {
  public get paymentType() {
    return this.checkoutService.paymentType;
  }

  constructor(
    protected checkoutService: CheckoutService,
    protected appSettingsService: ApplicationSettingsService,
    protected router: Router,
    protected translatePipe: DotCdkTranslatePipe,
    protected posOperationService: PosOperationsService,
    protected printerService: PrinterService,
    protected printReceiptBuilder: PrintReceiptBuilder,
    protected paymentModelService: PaymentModelService,
    protected translateService: TranslationsService) {
  }

  public async ngOnInit() {
    this.sendOpenOrderToPOS();
  }

  protected async sendOpenOrderToPOS() {
    PosElogHandler.getInstance().posConfig.posHeader.isPreOrder = this.checkoutService.paymentType === PAYMENT_TYPE.PREORDER;
    log('open order sent: ', PosElogHandler.getInstance().posConfig);
    const openOrderResponse = await PosInjectorService.getInstance()
      .sendOpenOrderToPos(this.appSettingsService.posInjectorPath, PosElogHandler.getInstance().posConfig)
      .catch(e => null);
    log('open order response: ', openOrderResponse);
    this.navigateFromOpenOrder(openOrderResponse);
  }

  protected navigateFromOpenOrder(openOrderResponse: IPosResponse) {
    // tslint:disable-next-line: triple-equals
    if (!openOrderResponse || openOrderResponse.ReturnCode != 0 || !openOrderResponse.OrderPOSNumber) {
      this.router.navigate(['checkout-error']);
      return;
    }
    // if (!Number.isInteger(openOrderResponse.SubtotalCents) || !Number.isInteger(openOrderResponse.TaxCents) ||
    //   openOrderResponse.SubtotalCents + openOrderResponse.TaxCents !== this.checkoutService.orderTotal) {
    //   this.router.navigate(['checkout-error', '2020121704']);
    //   return;
    // }
    this.checkoutService.openedOrder = true;
    this.checkoutService.orderPOSNumber = openOrderResponse.OrderPOSNumber;
    this.checkoutService.receiptContent = openOrderResponse.Receipt;
    if (this.paymentModelService.getAmountOwed() === 0) {
      this.addElogTender();
      this.router.navigate(['tender-order']);
      return;
    }
    // todo: refactor the conditions~
    if (PosElogHandler.getInstance().posConfig.posHeader.isPreOrder) {
      this.sendToFrontCounter();
    } else if (this.checkoutService.paymentType === PAYMENT_TYPE.CARD) {
      this.router.navigate(['payment-progress']);
    } else if (this.checkoutService.paymentType === PAYMENT_TYPE.CASH) {
      this.router.navigate(['glory-payment-progress']);
    }
  }

  protected async sendToFrontCounter() {
    // todo print ticket with not paid order
    const oldLanguage = this.translateService.currentLanguage.code;
    this.translateService.setCurrentLanguage(this.appSettingsService.defaultLanguage);
    this.checkoutService.receiptPayAtCounter = this.translatePipe.transform('2021020801');
    this.translateService.setCurrentLanguage(oldLanguage);
    const receipt = this.printerService.buildReceipt(this.checkoutService.orderPOSNumber.toString(),
      (this.checkoutService.orderTotal / 100).toFixed(2) , false);
    await AtpPrinterService.getInstance()
        .print(receipt)
        .catch(e => null);
    this.printReceiptBuilder.clearContent();
    if (this.appSettingsService.unlockOrder) {
      await this.posOperationService.sendUnlockOrderToPOS();
    }
    this.router.navigate(['preorder']);
  }

  private addElogTender() {
    const cardTender = {
      paid: PosPaidState.NOT_PAID,
      type: PosTenderType.CARD,
      paymentMediaId: '-1',
      paidAmount: this.paymentModelService.getAmountOwed()
    };
    (PosElogHandler.getInstance().posConfig.posHeader.amounts.tenders) ?
      PosElogHandler.getInstance().posConfig.posHeader.amounts.tenders.push(cardTender) :
      PosElogHandler.getInstance().posConfig.posHeader.amounts.tenders = [cardTender];
  }
}
