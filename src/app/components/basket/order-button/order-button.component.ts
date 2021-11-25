import { Component, OnInit } from '@angular/core';
import { DotButton } from 'dotsdk';
import { DotCdkTranslatePipe } from '../../../pipes/dot-translate.pipe';
import { DynamicContentService } from '../../../services/dynamic-content/dynamic-content.service';
import { BasketService } from '../../../services/basket.service';
import { BasketComponent } from '../basket.component';

@Component({
  selector: 'acr-order-button',
  templateUrl: './order-button.component.html'
})
export class OrderButtonComponent implements OnInit {

  constructor(
    private basketService: BasketService,
    protected translatePipe: DotCdkTranslatePipe,
    protected dynamicContentService: DynamicContentService) { }

  public ngOnInit(): void {
  }

  public get basketButtons(): DotButton[] {
    return this.basketService.buttons;
  }

  public get basketTitle(): string {
    if (this.basketButtonLength === 0) {
      return this.translatePipe.transform('6');
    }

    if (this.basketButtonLength === 1) {
      return this.translatePipe.transform('19');
    }

    return this.translatePipe.transform('92');
  }

  public get basketButtonLength(): number {
    return this.basketService.getQuantityButtons();
  }

  public basketToggle(): void {
    this.basketService.basketToggle(BasketComponent);
  }
}
