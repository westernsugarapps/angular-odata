import { Injectable } from '@angular/core';

import { ODataClient } from "../client";
import { ODataModel, ODataCollection } from '../models';

import { ODataBaseService } from './base';

@Injectable()
export class ODataModelService<T, M extends ODataModel<T>, C extends ODataCollection<T, M>> extends ODataBaseService<T> {
  constructor(protected client: ODataClient) { super(client); }

  // Models
  public attach(value: M): M;
  public attach(value: C): C;
  public attach(value: any): any {
    if (value instanceof ODataModel) {
      return value.attach(this.entities().entity(value.toEntity()));
    } else if (value instanceof ODataCollection) {
      return value.attach(this.entities());
    }
  }
}
