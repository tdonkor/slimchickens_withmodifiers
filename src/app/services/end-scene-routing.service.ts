import { StatusService } from './status.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { PosPaidState, PosTenderType, PosElogHandler } from 'dotsdk';
import { ApplicationSettingsService } from './app-settings.service';
import { PaymentFailType } from '../enums/payment-fail-type.enum';
import { PAYMENT_TYPE } from '../enums/payment-type.enum';
import { CheckoutType } from '../enums/checkout-type.enum';
import { PaymentModelService } from '../services/payment-model.service';


@Injectable({
  providedIn: 'root'
})
export class EndSceneRoutingService {
  constructor(
    protected router: Router,
    protected statusService: StatusService,
    protected appSettingsService: ApplicationSettingsService,
    protected paymentModelService: PaymentModelService) { }

  public goToEndScene() {
    if (this.statusService.enabledPayments.length === 1 && this.appSettingsService.skipSinglePaymentSelection) {
      const availablePayments = this.statusService.enabledPayments[0];
      this.appSettingsService.paymentFailRedirect = PaymentFailType.PAY_RETRY;
      switch (availablePayments.PaymentType) {
        case PAYMENT_TYPE.CARD: {
          if (this.appSettingsService.posInjectionFlow !== CheckoutType.PAY_BEFORE_POS) {
            this.router.navigate(['open-order']);
          } else {
            if (this.paymentModelService.getAmountOwed() !== 0) {
              this.router.navigate(['payment-progress']);
            } else {
              this.addElogTender();
              this.router.navigate(['complete-order']);
            }
          }
          break;
        }
        case PAYMENT_TYPE.PREORDER: {
          this.router.navigate(['open-order']);
        }
      }
    } else {
      if (this.paymentModelService.getAmountOwed() === 0) {
        if (this.appSettingsService.posInjectionFlow === CheckoutType.PAY_BEFORE_POS) {
          this.addElogTender();
          this.router.navigate(['complete-order']);
        } else {
          this.router.navigate(['open-order']);
        }
      } else {
        this.router.navigate(['payment-selection']);
      }
    }
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
