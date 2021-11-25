import { ProductStatus } from './../../enums/general.enum';
import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { DotButton } from 'dotsdk';
import { price } from '../../helpers/price.helper';
import { SessionService } from '../../services/session.service';
import { ApplicationSettingsService } from '../../services/app-settings.service';
@Component({
  selector: 'acr-dropdown',
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent implements AfterViewChecked {
  @Input() public buttons: DotButton[];
  @Output() public dropdownButtonClick: EventEmitter<DotButton> = new EventEmitter();

  constructor(
    protected sessionService: SessionService,
    protected elementRef: ElementRef<HTMLElement>,
    protected zone: NgZone,
    protected appSettings: ApplicationSettingsService) { }

  public ngAfterViewChecked(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        !!this.appSettings.touchlessMode ?
          this.elementRef.nativeElement.scrollIntoView({ behavior: 'auto', block: 'end' }) :
          this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 0);
    });
  }

  public unavailableButton(button) {
    if (button.hasCombos) {
      return button.ComboPage.Combos.filter(btn => btn.Buttons.every(() => Number(button.ButtonStatus) === ProductStatus.UNAVAILABLE)).length > 0;
    } else {
      return false;
    }
  }

  public getPrice(button: DotButton): number {
    return price(button, this.sessionService.serviceType);
  }
  public select(button: DotButton) {
    this.dropdownButtonClick.emit(button);
  }
  public isButtonStatusAvailable(button: DotButton): boolean {
    return Number(button.ButtonStatus) === ProductStatus.UNAVAILABLE || this.unavailableButton(button);
  }
}
