import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import {getMainPage, PosServingLocation} from 'dotsdk';
import { SessionService } from '../../services/session.service';
import { ApplicationSettingsService } from '../../services/app-settings.service';
import { Router } from '@angular/router';
import { StatusService } from '../../services/status.service';
import { OrderCheckInFlowBundleSetting } from '../../helpers/first-page.helper';
import { BannersService } from '../../services/banners.service';
import { ContentService } from '../../services/content.service';
import { DotCdkTranslatePipe } from '../../pipes/dot-translate.pipe';
@Component({
  selector: 'acr-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BannersComponent implements OnInit, OnDestroy {
  public subscriptions: Subscription[] = [];
  public errorMessages: string[] = [];
  public blockKiosk = false;

  public get isTouchToOrderButtonVisible(): boolean {
    return this.appSettings.enableTouchToOrderSection && !this.blockKiosk;
  }
  public get biServiceTypeAttribute(): PosServingLocation | null {
    if (this.appSettings?.orderCheckInFlow !== OrderCheckInFlowBundleSetting.ONLY_BANNERS) {
      return null;
    }
    if (this.appSettings.serviceType === PosServingLocation.OUT) {
      return PosServingLocation.OUT;
    } else {
      return PosServingLocation.IN;
    }
  }

  constructor(public appSettings: ApplicationSettingsService,
              public bannersService: BannersService,
              protected sessionService: SessionService,
              protected contentService: ContentService,
              protected router: Router,
              protected statusService: StatusService,
              protected translatePipe: DotCdkTranslatePipe) {}

  public ngOnInit() {
    this.bannersService.setBannerSlideShow(0);
    this.subscriptions.push(this.statusService.onNewCheck.subscribe(status => {
      this.blockKiosk = this.statusService.isKioskBlocked(status);
    }));
  }

  public ngOnDestroy() {
    clearTimeout(this.bannersService.slideshowTimeout);
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('click')
  public navigate() {
    if (this.blockKiosk) {
      return;
    }
    if (this.appSettings.orderCheckInFlow === OrderCheckInFlowBundleSetting.ONLY_BANNERS) {
      // this.sessionService.setServiceType(PosServingLocation.IN);
      this.router.navigate(['menu', getMainPage()?.ID]);
    } else {
      this.router.navigate(['service-type']);
    }
  }
}
