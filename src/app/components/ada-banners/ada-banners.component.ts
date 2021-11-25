import { Component, OnDestroy, OnInit } from '@angular/core';
import { DotBanner } from 'dotsdk';
import { ApplicationSettingsService } from '../../services/app-settings.service';
import { BannersService } from '../../services/banners.service';

@Component({
  selector: 'acr-ada-banners',
  templateUrl: './ada-banners.component.html',
  styleUrls: ['./ada-banners.component.scss']
})
export class AdaBannersComponent implements OnInit, OnDestroy {

  public accesibilityBanners: DotBanner[] = [];

  constructor(private appSettings: ApplicationSettingsService, public bannersService: BannersService) { }

  public ngOnInit(): void {
    this.bannersService.setBannerSlideShow(0, true);
  }
  public ngOnDestroy() {
    clearTimeout(this.bannersService.slideshowTimeout);
  }
}
