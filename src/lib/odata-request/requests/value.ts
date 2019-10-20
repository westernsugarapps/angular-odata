import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ODataRequest } from './request';
import { ODataSegments } from '../segments';
import { ODataOptions } from '../options';
import { Segments } from '../types';
import { ODataClient } from '../../client';
import { $VALUE } from '../../constants';
import { Schema } from '../schema';

export class ODataValueRequest<T> extends ODataRequest<T> {
  // Factory
  static factory<V>(service: ODataClient, opts?: {
      segments?: ODataSegments, 
      options?: ODataOptions,
      schema?: Schema<V>}
  ) {
    let segments = opts && opts.segments || new ODataSegments();
    let options = opts && opts.options || new ODataOptions();
    let schema = opts && opts.schema || new Schema<V>();

    segments.segment(Segments.value, $VALUE);
    options.clear();
    return new ODataValueRequest<V>(service, segments, options, schema);
  }

  get(options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    withCredentials?: boolean,
  }): Observable<T> {
    return super.get({
      headers: options && options.headers,
      observe: 'body',
      params: options && options.params,
      responseType: 'json',
      reportProgress: options && options.reportProgress,
      withCredentials: options && options.withCredentials
    });
  }

}
