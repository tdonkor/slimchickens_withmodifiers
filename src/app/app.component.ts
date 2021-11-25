import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isAdaEnabled } from './helpers/ada.helper';
import { OrderCheckInFlowBundleSetting } from './helpers/first-page.helper';
import { AppInitService } from './services/app-init.service';
import { ApplicationSettingsService } from './services/app-settings.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public touchlessClass = 'touchlessEnabled';
  public isAdaEnabled = isAdaEnabled;

  public get appInitService(): AppInitService {
    return this.injector.get(AppInitService);
  }

  constructor(
    private appSettings: ApplicationSettingsService,
    private router: Router,
    private injector: Injector) {}

  public async ngOnInit() {
    await this.appInitService.initialize();
    if (this.appSettings.touchlessMode) {
      document.documentElement.classList.add(this.touchlessClass);
    }
    if (this.appSettings.orderCheckInFlow === OrderCheckInFlowBundleSetting.ONLY_SERVICE_TYPE) {
      this.router.navigate(['service-type']);
    } else {
      this.router.navigate(['banners']);
    }
  }
}
