import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Location} from '@angular/common';
import { ApplicationSettingsService } from '../../../../services/app-settings.service';
import { CurrencyPipe } from '../../../../pipes/currency.pipe';
import { CheckoutService } from '../../../../services/checkout.service';
import { CheckoutType } from '../../../../enums/checkout-type.enum';
import { DotCdkTranslatePipe } from '../../../../pipes/dot-translate.pipe';

@Component({
  selector: 'acr-glory-legal-requirements',
  templateUrl: './glory-legal-requirements.component.html',
})
export class GloryLegalRequirementsComponent implements OnInit {
  public get legalMessage(): string {
    return this.dotTranslatePipe.transform('2021022401').replace(/%%%/, this.dkCurrencyPipe.transform(parseFloat(this.appSettingsService.gloryPayableAmount)));
  }

  constructor(
    protected router: Router,
    protected location: Location,
    protected dotTranslatePipe: DotCdkTranslatePipe,
    protected dkCurrencyPipe: CurrencyPipe,
    protected appSettingsService: ApplicationSettingsService,
    protected checkoutService: CheckoutService) { }

  public ngOnInit(): void {
  }

  public acceptLegalTerms() {
    if (!this.checkoutService.openedOrder && this.appSettingsService.posInjectionFlow === CheckoutType.PAY_AFTER_POS) {
      this.router.navigate(['open-order']);
    } else {
      this.router.navigate(['glory-payment-progress']);
    }
  }
  public denyLegalTerms() {
    this.location.back();
  }
}
