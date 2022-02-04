import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import {getMainPage, PosServingLocation, SectionAvailability} from 'dotsdk';
import { Subscription } from 'rxjs';
import { WorkingHoursService } from '../../services/working-hours.service';
import { isAdaEnabled, toggleAdaMode } from '../../helpers/ada.helper';
import { OrderCheckInFlowBundleSetting } from '../../helpers/first-page.helper';
import { ApplicationSettingsService } from '../../services/app-settings.service';
import { SessionService } from '../../services/session.service';
import { StatusService } from '../../services/status.service';
import { DotCdkTranslatePipe } from '../../pipes/dot-translate.pipe';
import { TranslationsService } from '../../services/translations/translations.service';
import { ContentService } from '../../services/content.service';
import { AppInitService } from '../../services/app-init.service';

@Component({
  selector: 'acr-service-type',
  templateUrl: './service-type.component.html'
})
export class ServiceTypeComponent implements OnInit, OnDestroy {
  public PosServingLocation = PosServingLocation;
  public subscriptions: Subscription[] = [];
  public errorMessages: string[] = [];
  public blockKiosk = false;
  public isAdaEnabled = isAdaEnabled;
  public whEatInEnabled = true;
  public whTakeAwayEnabled = true;

  public get isServiceTypeFirstScreen(): boolean {
    return this.appSettings.orderCheckInFlow === OrderCheckInFlowBundleSetting.ONLY_SERVICE_TYPE;
  }

  constructor(public appSettings: ApplicationSettingsService,
              protected translateService: TranslationsService,
              protected sessionService: SessionService,
              protected router: Router,
              protected contentService: ContentService,
              protected statusService: StatusService,
              protected translatePipe: DotCdkTranslatePipe,
              public workingHoursService: WorkingHoursService,
              protected appInitService: AppInitService,
              @Inject(DOCUMENT) private _document: any,
              ) {}

  public ngOnInit() {
    if (this.isServiceTypeFirstScreen) {
      this.subscriptions.push(this.statusService.onNewCheck.subscribe(status => {
        this.blockKiosk = this.statusService.isKioskBlocked(status);
      }));
    }
    const response = this.workingHoursService.getSectionResponse(SectionAvailability.SERVICE_TYPE);

    if (response && ('EatInEnabled' in response && response.EatInEnabled !== undefined)) {
      this.whEatInEnabled = response.EatInEnabled;
      this.whTakeAwayEnabled = response.TakeAwayEnabled;
    }
  }
  public ngOnDestroy() {
    if (this.isServiceTypeFirstScreen) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
  }
  public setServiceType(type: PosServingLocation) {
    if (this.blockKiosk) {
      return;
    }
    this.sessionService.setServiceType(type);
    this.appInitService.setMetaTags();
    this.router.navigate(['menu', getMainPage()?.ID]);
  }
  public async switchAdaMode() {
    await toggleAdaMode();
  }
  public isLanguageButtonActive(languageCode: string) {
    return this.translateService.currentLanguage && this.translateService.currentLanguage.code === languageCode;
  }
  public onLanguageButtonClick(languageCode: string) {
    this.translateService.setCurrentLanguage(languageCode);
    this._document.documentElement.lang = languageCode;
  }
}
