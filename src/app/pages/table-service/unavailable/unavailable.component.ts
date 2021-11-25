import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { routeToFirstPage } from '../../../helpers/first-page.helper';
import { CheckoutService } from '../../../services/checkout.service';
import { PosOperationsService } from '../../../services/pos-operations.service';
import { SessionEndType, SessionService } from '../../../services/session.service';

@Component({
  selector: 'acr-ts-unavailable',
  templateUrl: './unavailable.component.html'
})
export class TableServiceUnavailableComponent implements AfterViewInit {

  constructor(protected router: Router,
              protected posOperationService: PosOperationsService,
              protected sessionService: SessionService,
              protected checkoutService: CheckoutService) { }

  public ngAfterViewInit(): void {
    setTimeout(async () => {
      if (this.checkoutService.openedOrder) {
        this.router.navigate(['order-number']);
        return;
      }
      await this.sessionService.restartSession(SessionEndType.ORDER_FAIL);
      this.router.navigate([routeToFirstPage()]);
    }, 4000);
  }

}
