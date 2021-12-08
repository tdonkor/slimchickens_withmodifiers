import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
// import { AtpPrinterService } from 'dotsdk';
import { CheckoutService } from '../../../services/checkout.service';
import { SessionEndType, SessionService } from '../../../services/session.service';
import { log } from '../../../helpers/log.helper';
import { routeToFirstPage } from '../../../helpers/first-page.helper';
import { isAdaEnabled } from '../../../helpers/ada.helper';
import { WindowReloadService } from '../../../services/window-reload.service';
import {PosServingLocation} from "dotsdk";

@Component({
  selector: 'acr-order-number',
  templateUrl: './order-number.component.html'
})
export class OrderNumberComponent implements OnInit {
  public isAdaEnabled = isAdaEnabled;
  public isEatIn = false;

  @Output() public orderClosed: EventEmitter<void> = new EventEmitter();

  public get orderNumber(): number {
    return this.checkoutService.orderPOSNumber || 999;
  }
  constructor(
    // protected printerService: PrinterService,
    protected checkoutService: CheckoutService,
    protected router: Router,
    protected sessionService: SessionService,
    private windowReaload: WindowReloadService
  ) { }

  public async ngOnInit() {
    new Promise<void>(resolve => {
      setTimeout(async () => {
        log('End Checkout, go to ', routeToFirstPage());
        await this.sessionService.restartSession(SessionEndType.ORDER_SUCCESS);
        resolve();
      }, 5000);
    }).then(() => {
      const isReloading = this.windowReaload.isReloading();
      if (!isReloading) {
          this.router.navigate([routeToFirstPage()]);
        }
    });
    // added by TD
    if (this.sessionService.serviceType === PosServingLocation.IN) {
        this.isEatIn = true;
    }
  }
}
