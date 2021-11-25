import { Component, Input } from "@angular/core";
import { DotButton, DotButtonType } from "dotsdk";

@Component({
  selector: "acr-modifier-messages",
  templateUrl: "./modifier-messages.component.html",
})
export class ModifierMessagesComponent {
  @Input() public catalogModifierLabelText;
  @Input() public modifier;

  public get getQuantityButtons() {
    let totalQty = 0;
    this.modifier.Buttons.filter((btn) => btn.ButtonType === DotButtonType.ITEM_PACK_BUTTON).forEach((x) => {
      totalQty += x.Page.Buttons.reduce((totalQuantity: number, button: DotButton) => totalQuantity + button.quantity, 0);
    });
    totalQty += this.modifier.Buttons.reduce((totalQuantity: number, button: DotButton) => totalQuantity + button.quantity, 0);
    return totalQty;
  }

  public get maxQuantityGroup(): number {
    return this.modifier.PageInfo.MaxQuantity;
  }

  public get displayText(): boolean {
    return this.getQuantityButtons >= this.maxQuantityGroup;
  }
}
