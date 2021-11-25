import { ProductStatus } from './../../enums/general.enum';
import { Component, Input } from '@angular/core';
import { DotButton } from 'dotsdk';
import { price } from '../../helpers/price.helper';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'acr-button',
  templateUrl: './button.component.html',
})
export class ButtonComponent {

  @Input() public button: DotButton;
  @Input() public extraClasses = '';
  @Input() public displayBackground = false;
  @Input() public unavailableButton = false;

  public get price(): number {
    return price(this.button, this.sessionService.serviceType);
  }

  public get isButtonStatusAvailable() {
    return Number(this.button.ButtonStatus) === ProductStatus.UNAVAILABLE || this.unavailableButton;
  }

  public get calories(): string {
    if (this.button.Page) {
      const firstSimpleButton = this.button.Page.Buttons.find(btn => !btn.Page && !btn.hasCombos);
      const cal = firstSimpleButton?.AllergensAndNutritionalValues?.NutritionalValues?.find(n => n.Name === 'CAL');
      return cal ? cal.Value : '';
    }
    if (this.button.hasCombos) {
      return '';
    }
    const calories = this.button?.AllergensAndNutritionalValues?.NutritionalValues?.find(n => n.Name === 'CAL');
    return calories ? calories.Value : '';
  }

  constructor(protected sessionService: SessionService) { }
}
