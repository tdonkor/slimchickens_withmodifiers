import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseModel } from 'dotsdk';

export abstract class AbstractDynamicComponent {

  public dialogText: string;
  protected _componentControlsClick: Subject<any> = new Subject();
  protected _content: BaseModel | BaseModel[];


  public get componentControlsClick() {
    return this._componentControlsClick.asObservable();
  }

  public set content(value: BaseModel | BaseModel[]) {
    this._content = value;
  }
}
