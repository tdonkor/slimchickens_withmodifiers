import { Injectable } from '@angular/core';
import { IPeripheralsDetails, IPeripheralsStatusDetails, AtpEnvironmentService, PosInjectorService, PeripheralAvailabilityStatusCode, IPeripheralAvailabilityDetails, ICashDenomination, AtpPaymentService, CashDenominationLocation, CashDenominationStatus } from 'dotsdk';
import { Observable, Subject } from 'rxjs';
import { CheckoutType } from '../enums/checkout-type.enum';
import { DeviceCheckMode, InventoryStatus, KioskStatusColor } from '../enums/general.enum';
import { PAYMENT_TYPE } from '../enums/payment-type.enum';
import { PaymentType } from '../models/payment.interface';
import { DotCdkTranslatePipe } from '../pipes/dot-translate.pipe';
import { ApplicationSettingsService } from './app-settings.service';

export interface PeripheralStatus {
  Name?: string;
  Description?: string;
  StatusCode: number;
  Type?: string;
}

export enum DeviceNames {
  Printer = 'Printer',
  Payment = 'Payment',
  Scanner = 'Scanner',
  POS = 'POS'
}
@Injectable({
  providedIn: 'root'
})
export class StatusService {
  public peripheralDetails: IPeripheralsDetails;
  public peripheralStatusDetails: IPeripheralsStatusDetails;
  public inventoryStatus: InventoryStatus;
  public _enabledPayments: PaymentType[] = [];
  protected _isCheckActive = false;
  protected _kioskStatus: KioskStatusColor = KioskStatusColor.NO_COLOR;
  protected _onNewCheck: Subject<PeripheralStatus[]> = new Subject();
  protected _onKioskStatusUpdate: Subject<KioskStatusColor> = new Subject();
  protected _scannerActive = false;

  constructor(protected appSettings: ApplicationSettingsService,
              protected translatePipe: DotCdkTranslatePipe) {}

  public get enabledPayments(): PaymentType[] {
    return this._enabledPayments;
  }
  public get scannerActive(): boolean {
    return this._scannerActive;
  }
  public get onNewCheck(): Observable<PeripheralStatus[]> {
    return this._onNewCheck.asObservable();
  }
  public get onKioskStatusUpdate(): Observable<KioskStatusColor> {
    return this._onKioskStatusUpdate.asObservable();
  }
  public start(): Observable<PeripheralStatus[]> {
    this._isCheckActive = true;
    this.check();
    return this._onNewCheck.asObservable();
  }
  public stop() {
    this._isCheckActive = false;
  }

  public isKioskBlocked(status: PeripheralStatus[]): boolean {
    if (status.some(peripheric => ([DeviceNames.Printer, DeviceNames.Scanner, DeviceNames.POS] as string[]).includes(peripheric.Type))) {
      return true;
    }
    return this._enabledPayments.length < 1 && this.appSettings.paymentCheckMode === DeviceCheckMode.Mandatory;
  }

  protected async check() {
    if (!this._isCheckActive) {
      return;
    }
    this._enabledPayments = [];
    this.peripheralDetails = await AtpEnvironmentService.getInstance().getPeripheralsDetails().catch(e => null);
    this.peripheralStatusDetails = await AtpEnvironmentService.getInstance().getPeripheralsStatusDetails().catch(e => null);
    // ARE: comments are for debugging purpose
    // console.log('[peripheral details]: ', this.peripheralDetails);
    // console.log('[peripheral status details]: ', this.peripheralStatusDetails);
    if (this.peripheralDetails && this.peripheralStatusDetails) {
      // console.log('[printer status]: ', this.getPrinterStatus());
      // console.log('[scanner status]: ', this.getScannerStatus());
      // console.log('[pos status]: ', await this.getPosStatus());
      // console.log('[card status]: ', this.getCardStatus());
      // console.log('[cash status]: ', await this.getCashStatus());
      // console.log('[preorder enabled?]: ', this.getPreorderStatus());
      // console.log('[enabled payments]: ', this._enabledPayments)
      if (this.getPreorderStatus()) {
        this._enabledPayments.push(this.getPreorderStatus());
      }
      this._onNewCheck.next([this.getPrinterStatus(),
                             this.getScannerStatus(),
                             this.getCardStatus(),
                             await this.getCashStatus(),
                             await this.getPosStatus()
                             ].filter(peripheral => peripheral.StatusCode !== PeripheralAvailabilityStatusCode.OK));
    } else {
      this._onNewCheck.next([]);
    }
    this._onKioskStatusUpdate.next(this.getKioskStatus());
    setTimeout(async () => await this.check(), this.appSettings.peripheralsCheckTimer);
  }

  protected getCardStatus(): PeripheralStatus {
    const status: PeripheralStatus = {
      Type: PAYMENT_TYPE.CARD,
      StatusCode: 0
    };
    const cardBsPayment = this.appSettings.paymentTypes.find(p => p.PaymentType === PAYMENT_TYPE.CARD && p.PaymentIsEnabled);
    status.Name = cardBsPayment?.PaymentName || 'EFT payment terminal';
    if (!this.peripheralDetails.Payments || this.peripheralDetails.Payments.every(payment => payment.Type !== 'card')) {
        status.StatusCode = -1;
        status.Description = 'No EFT payment terminal is set in the ATP environment';
    } else if (!this.peripheralStatusDetails.Payments ||
               !this.peripheralStatusDetails.Payments.some(payment => payment.Type === 'card' && payment.StatusCode === PeripheralAvailabilityStatusCode.OK)) {
          const paymentInError = this.peripheralStatusDetails.Payments.find(p => p.Type === 'card');
          status.Name = paymentInError ? paymentInError.Name : 'EFT payment terminal';
          status.StatusCode = paymentInError ? paymentInError.StatusCode : -1;
          status.Description = paymentInError ? paymentInError.Description : '';
    }
    if (status.StatusCode === 0 && cardBsPayment) {
      cardBsPayment.DisplayName = '61';
      this._enabledPayments.push(cardBsPayment);
    }
    if (this.appSettings.paymentCheckMode !== DeviceCheckMode.Mandatory ||
      this.appSettings.paymentTypes.every(pay => pay.PaymentType !== PAYMENT_TYPE.CARD)) {
        return {
          Type: PAYMENT_TYPE.CARD,
          StatusCode: 0
        };
    }
    return status;
  }

  protected async getCashStatus(): Promise<PeripheralStatus> {
    const status: PeripheralStatus = {
      Type: PAYMENT_TYPE.CASH,
      StatusCode: 0
    };
    const cashBsPayment = this.appSettings.paymentTypes.find(p => p.PaymentType === PAYMENT_TYPE.CASH && p.PaymentIsEnabled);
    status.Name = cashBsPayment?.PaymentName || 'Glory cash machine';
    if (!this.peripheralDetails.Payments || this.peripheralDetails.Payments.every(payment => payment.Type !== 'cash')) {
        status.StatusCode = -1;
        status.Description = 'No cash payment peripheric is set in the ATP environment';
    } else if (!this.peripheralStatusDetails.Payments ||
               !this.peripheralStatusDetails.Payments.some(payment => payment.Type === 'cash' && payment.StatusCode === PeripheralAvailabilityStatusCode.OK)) {
          const paymentInError = this.peripheralStatusDetails.Payments.find(p => p.Type === 'cash');
          status.Name = paymentInError ? paymentInError.Name : 'Glory cash machine';
          status.StatusCode = paymentInError ? paymentInError.StatusCode : -1;
          status.Description = paymentInError ? paymentInError.Description : '';
    } else if (cashBsPayment) {
      this.inventoryStatus = await this.getInventoryStatus(cashBsPayment.PaymentName);
    }
    if (status.StatusCode === 0 && cashBsPayment && this.inventoryStatus !== InventoryStatus.NOK) {
      cashBsPayment.DisplayName = '2021021901';
      this._enabledPayments.push(cashBsPayment);
    } else if (status.StatusCode === 0 && cashBsPayment && this.inventoryStatus === InventoryStatus.NOK) {
      status.StatusCode = -1;
      status.Description = 'Glory cash inventory is either full or empty.';
    }
    if (this.appSettings.paymentCheckMode !== DeviceCheckMode.Mandatory ||
      this.appSettings.paymentTypes.every(pay => pay.PaymentType !== PAYMENT_TYPE.CASH)) {
        return {
          Type: PAYMENT_TYPE.CASH,
          StatusCode: 0
        };
    }
    return status;
  }

  protected getPreorderStatus(): PaymentType {
    if (this.appSettings.posInjectionFlow === CheckoutType.PAY_BEFORE_POS) {
      return null;
    }
    const preorderPayment = this.appSettings.paymentTypes.find(p => p.PaymentType === PAYMENT_TYPE.PREORDER && p.PaymentIsEnabled);
    if (preorderPayment) {
      preorderPayment.DisplayName = '62';
      return preorderPayment;
    }
    return null;
  }

  protected async getPosStatus(): Promise<PeripheralStatus> {
    if (this.appSettings.POSCheckMode !== DeviceCheckMode.Mandatory) {
      return {
        Name: 'POS',
        Type: 'POS',
        StatusCode: 0,
        Description: 'POS check mode is not on mandatory'
      };
    }
    const posStatus = await PosInjectorService.getInstance().testConnection(this.appSettings.posInjectorPathTest, this.appSettings.kioskId).catch(e => null);
    return {
      Name: 'POS',
      Type: 'POS',
      StatusCode: posStatus ? Number(posStatus.ReturnCode) : -1,
      Description: posStatus ? posStatus.ReturnMessage : 'No POS connection established'
    };
  }

  protected getPrinterStatus(): PeripheralStatus {
    const status: PeripheralStatus = {
      Type: 'Printer',
      StatusCode: 0
    };
    if (this.appSettings.printerCheckMode !== DeviceCheckMode.Mandatory) {
      return status;
    }
    if (!this.peripheralDetails.Printers || this.peripheralDetails.Printers.length < 1) {
        status.StatusCode = -1;
        status.Description = 'No printer device is set in the ATP environment';
        return status;
    }
    if (!this.peripheralStatusDetails.Printers ||
        this.peripheralStatusDetails.Printers.every(printer => printer.StatusCode !== PeripheralAvailabilityStatusCode.OK)) {
          status.Name = this.peripheralStatusDetails.Printers.length > 0 ? this.peripheralStatusDetails.Printers[0].Name : '';
          status.StatusCode = this.peripheralStatusDetails.Printers.length > 0 ? this.peripheralStatusDetails.Printers[0].StatusCode : -1;
          status.Description = this.peripheralStatusDetails.Printers.length > 0 ? this.peripheralStatusDetails.Printers[0].Description : '';
          return status;
    }
    return status;
  }

  protected getScannerStatus(): PeripheralStatus {
    const status: PeripheralStatus = {
      Type: 'Scanner',
      StatusCode: 0
    };
    if (!this.peripheralDetails.Scanners || this.peripheralDetails.Scanners.length < 1) {
        status.StatusCode = -1;
        status.Description = 'No scanner device is set in the ATP environment';
    } else if (!this.peripheralStatusDetails['Scanners'] ||
        this.peripheralStatusDetails['Scanners'].every(printer => printer.StatusCode !== PeripheralAvailabilityStatusCode.OK)) {
          status.Name = this.peripheralStatusDetails['Scanners'].length > 0 ? this.peripheralStatusDetails['Scanners'][0].Name : '';
          status.StatusCode = this.peripheralStatusDetails['Scanners'].length > 0 ? this.peripheralStatusDetails['Scanners'][0].StatusCode : -1;
          status.Description = this.peripheralStatusDetails['Scanners'].length > 0 ? this.peripheralStatusDetails['Scanners'][0].Description : '';
    }
    this._scannerActive = status.StatusCode === 0;
    if (this.appSettings.scannerCheckMode !== DeviceCheckMode.Mandatory) {
      return {
        Type: 'Scanner',
        StatusCode: 0
      };
    }
    return status;
  }

  protected async getInventoryStatus(paymentName: string): Promise<InventoryStatus> {
    const inventoryStatus = await AtpPaymentService.getInstance().cashGetInventory(paymentName).catch(e => null) as ICashDenomination[];
    if (!inventoryStatus) {
      return InventoryStatus.NOK;
    }
    const isDispensableInventoryEmpty = inventoryStatus.some(i => i.Location === CashDenominationLocation.DispensableInventory && i.Status === CashDenominationStatus.Empty);
    const isDispensableInventoryNearEmpty = inventoryStatus.some(i => i.Location === CashDenominationLocation.DispensableInventory && i.Status === CashDenominationStatus.NearEmpty);
    const isInternalInventoryFull = inventoryStatus.some(i => i.Location === CashDenominationLocation.InternalInventory && i.Status === CashDenominationStatus.Full);
    const isInternalInventoryNearFull = inventoryStatus.some(i => i.Location === CashDenominationLocation.InternalInventory && i.Status === CashDenominationStatus.NearFull);
    if (isDispensableInventoryEmpty || isInternalInventoryFull) {
      return InventoryStatus.NOK;
    }
    if (isDispensableInventoryNearEmpty || isInternalInventoryNearFull) {
      return InventoryStatus.NEAR;
    }
    return InventoryStatus.OK;
  }
  protected getKioskStatus(): KioskStatusColor {
    const isCashAvailable = this._enabledPayments.some(p => p.PaymentType === PAYMENT_TYPE.CASH);
    const isCashEnabledInBS = this.appSettings.paymentTypes.some(p => p.PaymentType === PAYMENT_TYPE.CASH && p.PaymentIsEnabled);
    const isCardAvailable = this._enabledPayments.some(p => p.PaymentType === PAYMENT_TYPE.CARD);
    const isCardEnabledInBS = this.appSettings.paymentTypes.some(p => p.PaymentType === PAYMENT_TYPE.CARD && p.PaymentIsEnabled);
    if (isCardEnabledInBS && !isCardAvailable && isCashEnabledInBS && !isCashAvailable) {
      return KioskStatusColor.RED;
    }
    if (isCashEnabledInBS && !isCashAvailable) {
      return KioskStatusColor.BLUE;
    }
    if (isCardEnabledInBS && !isCardAvailable) {
      return KioskStatusColor.PURPLE;
    }
    if (isCashEnabledInBS && isCashAvailable && this.inventoryStatus === InventoryStatus.NEAR) {
      return KioskStatusColor.ORANGE;
    }
    return KioskStatusColor.NO_COLOR;
  }
}
