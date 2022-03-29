import { Injectable } from '@angular/core';
import { LanguageDictionaryType } from 'dotsdk';
import { DotButtonType } from 'dotsdk';
import { DotCombo } from 'dotsdk';
import { DotAllergensAndNutritionalValues } from 'dotsdk';
import { DotButton } from 'dotsdk';
import { DotNutritionalValue } from 'dotsdk/src/data/models/dot-nutritional-values.model';

@Injectable({
  providedIn: 'root'
})
export class IngredientsService {

  constructor() { }

// NDA 2021-11-16
  // This method is taken from the Button Component. It is refactored here for sense checking
  // and because the original did not work.

  public resolveCalories(button: DotButton): string {
    // Presumably, if the Button has a Page then the DotButton represents a Group construct consisting
    // of a collection of member Items which can themselves be either 'simple' or 'compound' (i.e. combo)
    // Items.In this case, the value for calories is taken from the (first) individual Menu Item within
    // the Group.
    const page = button.Page;
    let energy: DotNutritionalValue | undefined;
    if (!(page == null)) {
      // Retrieve the first 'simple' Menu Item from the Group where the members are represented by Buttons
      // on a Page.
      button = page.Buttons.find((_button: DotButton) => ((_button.Page == null) && !(_button.hasCombos)));
      if (!(button == null)) {
        // This does not work. The relevant field is not 'CAL'.
        // const cal = button?.AllergensAndNutritionalValues?.NutritionalValues?.find(n => n.Name === 'CAL');
        energy = this.resolveEnergyFromAllergensAndNutritionalValues(button.AllergensAndNutritionalValues);
        return this.formatCaloriesFromNutritionalValue(energy, true);
      }
      return '';
    } else if (button.hasCombos) {
      // The calorie content still needs to be obtained in this case.
      const combos = button.ComboPage.Combos;
      const size = button.StartSize;
      let units: LanguageDictionaryType | undefined;
      let calories = 0;
      combos.forEach((combo: DotCombo) => {
        let buttons = combo.Buttons.filter((_button: DotButton) => (_button.VisibleOn === size || (button.ButtonType === DotButtonType.ITEM_PACK_BUTTON && button.Page?.Buttons?.length > 0)));
        if (!(buttons == null) && (buttons.length > 0)) {
          buttons = buttons.filter((_button: DotButton) => (_button.ButtonType === DotButtonType.ITEM_BUTTON));
          if (!(buttons == null) && (buttons.length > 0)) {
            let minimum: number | undefined;
            let value: number | undefined;
            buttons.forEach((_button: DotButton) => {
              energy = this.resolveEnergyFromAllergensAndNutritionalValues(_button.AllergensAndNutritionalValues);
              units = (!(energy == null) ? energy.UnitDictionary : units);
              value = (!(energy == null) ? Number(energy.Value) : undefined);
              minimum = (!((value == null) || isNaN(value)) ? (((minimum == null) || (value < minimum)) ? value : minimum) : minimum);
            });
            calories += (!(minimum == null) ? minimum : 0);
          }
        }
      });
      return (!(calories == null) ? this.formatCalories(calories, units, true) : '');
    }
    energy = this.resolveEnergyFromAllergensAndNutritionalValues(button.AllergensAndNutritionalValues);
    return this.formatCaloriesFromNutritionalValue(energy);
  }

  private resolveEnergyFromAllergensAndNutritionalValues(information: DotAllergensAndNutritionalValues): DotNutritionalValue | undefined {
    let calories: string | undefined;
    if (!(information == null)) {
      const energyPerProduct = 'Energy per product';
      const nutrition = information.NutritionalValues;
      if (!(nutrition == null)) {
        return nutrition.find((entry: DotNutritionalValue) => (entry.Name === energyPerProduct));
      }
    }
    return undefined;
  }

  private formatCaloriesFromNutritionalValue(energy: DotNutritionalValue | undefined, compound: boolean = false): string {
    return (!(energy == null) ? this.formatCalories(energy.Value, energy.UnitDictionary) : '');
  }

  private formatCalories(value: number | string, units: LanguageDictionaryType, compound: boolean = false): string {
    value = (!(value == null) ? value : 0);
    value = (!(typeof(value) === 'string') ? value : Number(value));
    value = (!(isNaN(value)) ? value : 0);
    return [ value, ((!(units == null) ? units['EN'] : 'Kcal') || 'Kcal') + ((compound) ? '*' : '') ].join(' ');
  }
}
