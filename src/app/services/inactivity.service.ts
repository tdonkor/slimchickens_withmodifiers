import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timeoutOrderEvent, cancelOrderEvent } from 'dotsdk';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { OrderCheckInFlowBundleSetting } from '../helpers/first-page.helper';
import { DotCdkTranslatePipe } from '../pipes/dot-translate.pipe';
import { ApplicationSettingsService } from './app-settings.service';
import { DynamicContentService } from './dynamic-content/dynamic-content.service';
import { SessionEndType, SessionService } from './session.service';




@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  public inactivityExceptionScreens: string[];
  public inactivityWarningTimer: number;
  public inactivityCloseTimer: number;
  protected intervalPopUp;
  protected intervalBanner;
  protected isComponentVisible: boolean;
  protected _cssClass = 'ada';

  constructor(
    @Inject(DOCUMENT) private _document: any,
    private dynamicContentService: DynamicContentService,
    private translatePipe: DotCdkTranslatePipe,
    private sessionService: SessionService,
    protected router: Router,
    private activatedRoute: ActivatedRoute,
    protected appSettings: ApplicationSettingsService
  ) {}

  public get isAccessibilityMode() {
    return this._document.body.classList.contains(this._cssClass);
  }
  public clearInactivityTimer() {
    clearTimeout(this.intervalPopUp);
    clearTimeout(this.intervalBanner);

    this.intervalPopUp = null;
    this.intervalBanner = null;
  }


  public resetInactivityTimer() {
    this.clearInactivityTimer();
    if (this.inactivityExceptionScreens && !this.inactivityExceptionScreens.includes(this.activatedRoute?.snapshot.children[0].url[0].path)) {
      this.intervalPopUp = setTimeout(() => {
        if (!this.inactivityExceptionScreens.includes(this.activatedRoute?.snapshot.children[0].url[0].path) && !this.isComponentVisible) {
          this.showInactivityWarning();
        }
      }, this.inactivityWarningTimer);
      this.intervalBanner = setTimeout(async () => {
        if (!this.inactivityExceptionScreens.includes(this.activatedRoute?.snapshot.children[0].url[0].path)) {
          await this.sessionService.restartSession(SessionEndType.APP_TIMEOUT);
          timeoutOrderEvent.emit(null);
          this.dynamicContentService.closeAllDialogs();
          this.isComponentVisible = false;
          if (this.appSettings.orderCheckInFlow === OrderCheckInFlowBundleSetting.ONLY_SERVICE_TYPE) {
            this.router.navigate(['service-type']);
          } else {
            this.router.navigate(['banners']);
          }
          if (this.isAccessibilityMode) {
            this._document.body.classList.remove(this._cssClass);
          }
          this.dynamicContentService.closeAllDialogs();
        }
      }, this.inactivityWarningTimer + this.inactivityCloseTimer);
    }
  }

  protected showInactivityWarning() {
    this.isComponentVisible = true;
    const contentRef = this.dynamicContentService.openContent(ConfirmDialogComponent, {
      title: this.translatePipe.transform('2021020901'),
      rightButtonText: this.translatePipe.transform('2021020902'),
      leftButtonText: this.translatePipe.transform('5'),
      logo: '../../../assets/images/logo.svg'
      // title: 'Are you there?',
      // rightButtonText: 'Continue Order',
      // leftButtonText: 'Cancel Order'
    });

    contentRef.afterClosed.subscribe(async response => {
      this.isComponentVisible = false;
      if (response === 'No') {
        await this.sessionService.restartSession(SessionEndType.CANCEL_ORDER);
        cancelOrderEvent.emit(null);
        this.dynamicContentService.closeAllDialogs();
        if (this.appSettings.orderCheckInFlow === OrderCheckInFlowBundleSetting.ONLY_SERVICE_TYPE) {
            this.router.navigate(['service-type']);
          } else {
            this.router.navigate(['banners']);
          }
        this.resetInactivityTimer();
      } else if (response === 'Yes') {
        this.resetInactivityTimer();
      }
    });
  }
}
