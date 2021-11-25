import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AtpEnvironmentService } from 'dotsdk';
import { Subscription } from 'rxjs';
import { DotCdkTranslatePipe } from '../../pipes/dot-translate.pipe';
import { KioskStatusColor } from '../../enums/general.enum';
import { log } from '../../helpers/log.helper';
import { DeviceNames, PeripheralStatus, StatusService } from '../../services/status.service';

export interface AdminClickStatus {
  counter: number;
  timestamp: number;
}

@Component({
  selector: 'acr-status',
  templateUrl: './status.component.html',
})
export class StatusComponent implements OnInit, OnDestroy {
  public messages: string[] = [];
  public subscriptions: Subscription[] = [];
  protected adminClickStatus: AdminClickStatus;
  protected kioskStatus: KioskStatusColor = KioskStatusColor.NO_COLOR;

  public get kioskColor(): string {
    switch (this.kioskStatus) {
      case KioskStatusColor.NO_COLOR:
      return '';
      case KioskStatusColor.BLUE:
      return 'bg--blue';
      case KioskStatusColor.ORANGE:
      return 'bg--orange';
      case KioskStatusColor.RED:
      return 'bg--red';
      case KioskStatusColor.PURPLE:
      return 'bg--purple';
      default:
      return '';
    }
  }

  constructor(protected statusService: StatusService,
              protected translatePipe: DotCdkTranslatePipe) {}

  public ngOnInit() {
    this.subscriptions.push(this.statusService.start().subscribe(status => {
      log('status check: ', status);
      this.messages = this.getErrorMessages(status);
      if (this.statusService.isKioskBlocked(status)) {
        this.messages.push(this.translatePipe.transform('2020122101'));
      }
    }));
    this.subscriptions.push(this.statusService.onKioskStatusUpdate.subscribe(newKioskStatus => {
      this.kioskStatus = newKioskStatus;
    }));
  }
  public ngOnDestroy() {
    this.statusService.stop();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public async handleAdminClick(event: Event) {
    event.stopPropagation();
    if (!this.adminClickStatus || Date.now() - this.adminClickStatus.timestamp > 400) {
      this.adminClickStatus = {
        counter: 1,
        timestamp: Date.now()
      };
      return;
    }
    if (this.adminClickStatus.counter >= 4) {
      await AtpEnvironmentService.getInstance().openAtpAdmin().catch(e => {
        log('Error on open admin call ', e);
        return null;
      });
      this.adminClickStatus = null;
    } else {
      this.adminClickStatus.counter ++;
      this.adminClickStatus.timestamp = Date.now();
    }
  }

  protected getErrorMessages(status: PeripheralStatus[]): string[] {
    return status.reduce((acc, s) => {
      switch (s.Name) {
        case DeviceNames.Printer:
          acc.push(this.translatePipe.transform('2020101403') + '  ' + s.Description);
          break;
        case DeviceNames.Scanner:
          acc.push(this.translatePipe.transform('2020101408') + '  ' + s.Description);
          break;
        case DeviceNames.POS:
          acc.push(this.translatePipe.transform('2020101601') + s.Description);
          break;
        default:
          acc.push(s.Name + ' error - ' + s.Description);
          break;
      }
      return acc;
    }, []);
  }
}
