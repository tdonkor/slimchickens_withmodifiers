import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PosElogHandler } from 'dotsdk';
import { isAdaEnabled } from '../../../helpers/ada.helper';

@Component({
  selector: 'acr-preorder',
  templateUrl: './preorder.component.html',
})
export class PreorderComponent implements AfterViewInit {
  public isAdaEnabled = isAdaEnabled;

  public get isTableServiceActive(): boolean {
    return !!PosElogHandler.getInstance().posConfig.posHeader?.cvars?.TS_No;
  }

  constructor(protected router: Router) {}

  public ngAfterViewInit() {
    setTimeout(() => {
      this.router.navigate(['order-number']);
    }, 4000);
  }
}
