import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ODataContext } from './context';
import { ODataEntitySet } from './odata-response';
import { ODataBatchRequest, ODataEntityRequest, ODataMetadataRequest, ODataRequest, ODataEntitySetRequest, ODataSingletonRequest } from './odata-request';

export type ODataObserve = 'body' | 'events' | 'response';

function addBody<T>(
    options: {
      etag?: string,
      headers?: HttpHeaders | {[header: string]: string | string[]},
      observe?: ODataObserve,
      params?: HttpParams | {[param: string]: string | string[]},
      reportProgress?: boolean,
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
      withCredentials?: boolean,
      withCount?: boolean
    },
    body: T | null): any {
  return {
    body,
    etag: options.etag,
    headers: options.headers,
    observe: options.observe,
    params: options.params,
    reportProgress: options.reportProgress,
    responseType: options.responseType,
    withCredentials: options.withCredentials,
    withCount: options.withCount
  };
}

function addEtag(
    options: {
      body?: any,
      headers?: HttpHeaders | {[header: string]: string | string[]},
      observe?: ODataObserve,
      params?: HttpParams | {[param: string]: string | string[]},
      reportProgress?: boolean,
      responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
      withCredentials?: boolean,
      withCount?: boolean
    },
    etag: string): any {
  return {
    etag,
    body: options.body,
    headers: options.headers,
    observe: options.observe,
    params: options.params,
    reportProgress: options.reportProgress,
    responseType: options.responseType,
    withCredentials: options.withCredentials,
    withCount: options.withCount
  };
}

@Injectable()
export class ODataClient {
  public static readonly ODATA_CONTEXT = '@odata.context';
  public static readonly ODATA_ETAG = '@odata.etag';
  public static readonly ODATA_ID = '@odata.id';

  public static readonly $ID = '$id';
  public static readonly $COUNT = '$count';

  private static readonly PROPERTY_VALUE = 'value';
  public static readonly IF_MATCH_HEADER = 'If-Match';

  constructor(protected http: HttpClient, public context: ODataContext) { }

  resolveEtag<T>(entity: Partial<T>): string {
    return entity[ODataClient.ODATA_ETAG];
  }

  resolveTarget<T>(type: 'body' | 'query', target: ODataEntityRequest<T>) {
    //TODO: Target has key?
    let key = (type === 'body') ?
      ODataClient.ODATA_ID : ODataClient.$ID;
    return { [key]: this.createEndpointUrl(target)};
  }

  public metadata(): ODataMetadataRequest {
    return ODataMetadataRequest.factory(this);
  }

  batch(): ODataBatchRequest {
    return ODataBatchRequest.factory(this);
  }

  singleton<T>(name: string) {
    return ODataSingletonRequest.factory<T>(name, this);
  }

  entitySet<T>(name: string): ODataEntitySetRequest<T> {
    return ODataEntitySetRequest.factory<T>(name, this);
  }

  mergeHttpHeaders(...headers: (HttpHeaders | { [header: string]: string | string[]; })[]): HttpHeaders {
    let attrs = {};
    headers.forEach(header => {
      if (header instanceof HttpHeaders) {
        const httpHeader = header as HttpHeaders;
        attrs = httpHeader.keys().reduce((acc, key) => Object.assign(acc, { [key]: httpHeader.getAll(key) }), attrs);
      } else if (typeof (header) === 'object')
        attrs = Object.assign(attrs, header);
    });
    return new HttpHeaders(attrs);
  }

  mergeHttpParams(...params: (HttpParams | { [param: string]: string | string[]; })[]): HttpParams {
    let attrs = {};
    params.forEach(param => {
      if (param instanceof HttpParams) {
        const httpParam = param as HttpParams;
        attrs = httpParam.keys().reduce((acc, key) => Object.assign(acc, { [key]: httpParam.getAll(key) }), attrs);
      } else if (typeof (param) === 'object')
        attrs = Object.assign(attrs, param);
    });
    return new HttpParams({ fromObject: attrs });
  }

  createEndpointUrl(query) {
    const serviceRoot = this.context.serviceRoot();
    return `${serviceRoot}${query.path()}`
  }

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    params?: HttpParams|{[param: string]: string | string[]},
    observe: 'events', reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    reportProgress?: boolean,
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<any>>;

  request<R>(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    reportProgress?: boolean,
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<R>>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  request(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    reportProgress?: boolean,
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  request<R>(method: string, req: ODataRequest, options: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    reportProgress?: boolean,
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<R>>;

  request(method: string, req: ODataRequest, options?: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    responseType?: 'json'|'entity',
    reportProgress?: boolean,
    withCredentials?: boolean,
  }): Observable<Object>;

  request<R>(method: string, req: ODataRequest, options?: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    responseType?: 'json'|'entity',
    reportProgress?: boolean,
    withCredentials?: boolean,
  }): Observable<R>;

  request(method: string, req: ODataRequest, options?: {
    body?: any,
    headers?: HttpHeaders|{[header: string]: string | string[]},
    params?: HttpParams|{[param: string]: string | string[]},
    observe?: ODataObserve,
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
    withCount?: boolean
  }): Observable<any>;

  request(method: string, query?: ODataRequest, options: {
    body?: any,
    etag?: string,
    headers?: HttpHeaders | { [header: string]: string | string[] },
    observe?: ODataObserve,
    params?: HttpParams | { [param: string]: string | string[] },
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
    withCount?: boolean
  } = {}): Observable<any> {
    const url = this.createEndpointUrl(query);

    let observe = <'body'|'events'|'response'>options.observe;

    let responseType = (['entity', 'entityset', 'property'].indexOf(options.responseType) !== -1) ? 'json' :
      <'arraybuffer' | 'blob' | 'json' | 'text'>options.responseType;

    let customHeaders = {};
    if (typeof (options.etag) === 'string')
      customHeaders[ODataClient.IF_MATCH_HEADER] = options.etag;
    let headers = this.mergeHttpHeaders(options.headers, customHeaders);

    let customParams = {};
    let withCount = options.withCount;
    if (withCount || this.context.withCount)
      customParams[ODataClient.$COUNT] = 'true';
    let params = this.mergeHttpParams(query.params(), options.params, customParams);

    let withCredentials = options.withCredentials;
    if (withCredentials === undefined)
      withCredentials = this.context.withCredentials;

    // Call http request
    let res$ = this.http.request(method, url, {
      body: options.body,
      headers: headers,
      observe: observe,
      params: params,
      reportProgress: options.reportProgress,
      responseType: responseType,
      withCredentials: withCredentials
    });

    // Context Error Handler
    if (this.context.errorHandler) {
      res$ = res$.pipe(
        catchError(this.context.errorHandler)
      );
    }

    // ODataResponse
    switch(options.observe || 'body') {
      case 'body':
        switch(options.responseType) {
          case 'entity':
            return res$.pipe(map((body: any) => body));
          case 'entityset':
            return res$.pipe(map((body: any) => new ODataEntitySet<any>(body)));
          case 'property':
            return res$.pipe(map((body: any) => body[ODataClient.PROPERTY_VALUE]));
        }
      case 'response':
        switch(options.responseType) {
          case 'entity':
            return res$.pipe(map((res: HttpResponse<any>) => res));
          case 'entityset':
            return res$.pipe(map((res: HttpResponse<any>) => new HttpResponse<any>({
              body: new ODataEntitySet<any>(res.body), 
              headers: res.headers, 
              status: res.status, 
              statusText: res.statusText, 
              url: res.url})
            ));
          case 'property':
            return res$.pipe(map((res: HttpResponse<any>) => new HttpResponse<any>({
              body: res.body[ODataClient.PROPERTY_VALUE], 
              headers: res.headers, 
              status: res.status, 
              statusText: res.statusText, 
              url: res.url})
            ));
        }
      }
    return res$;
  }

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;

  delete<T>(req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  delete<T>(req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;

  delete (req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<Object>;

  delete<T>(req: ODataRequest, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<T>;

  delete (req: ODataRequest, etag?: string, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: ODataObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('DELETE', req, addEtag(options, etag));
  }

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;

  get<T>(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  get<T>(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;

  get(req: ODataRequest, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<Object>;

  get<T>(req: ODataRequest, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<T>;

  get(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: ODataObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('GET', req, options as any);
  }

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;

  head<T>(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  head<T>(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;

  head(req: ODataRequest, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<Object>;

  head<T>(req: ODataRequest, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<T>;

  head(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: ODataObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('HEAD', req, options as any);
  }

  jsonp(req: ODataRequest, callbackParam: string): Observable<Object>;

  jsonp<T>(req: ODataRequest, callbackParam: string): Observable<T>;

  jsonp<T>(req: ODataRequest, callbackParam: string): Observable<T> {
    return this.request<any>('JSONP', req, {
      params: new HttpParams().append(callbackParam, 'JSONP_CALLBACK'),
      observe: 'body',
      responseType: 'json',
    });
  }

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;

  options<T>(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  options<T>(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;

  options(req: ODataRequest, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<Object>;

  options<T>(req: ODataRequest, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<T>;

  options(req: ODataRequest, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: ODataObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('OPTIONS', req, options as any);
  }

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;

  patch<T>(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  patch<T>(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;

  patch(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<Object>;

  patch<T>(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<T>;

  patch(req: ODataRequest, body: any|null, etag?: string, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: ODataObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('PATCH', req, addEtag(addBody(options, body), etag));
  }

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;

  post<T>(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  post<T>(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;

  post(req: ODataRequest, body: any|null, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<Object>;

  post<T>(req: ODataRequest, body: any|null, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<T>;

  post(req: ODataRequest, body: any|null, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: ODataObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('POST', req, addBody(options, body));
  }

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<ArrayBuffer>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<Blob>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<string>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpEvent<ArrayBuffer>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpEvent<Blob>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpEvent<string>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpEvent<Object>>;

  put<T>(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'events', responseType?: 'json'|'entity', withCredentials?: boolean,
  }): Observable<HttpEvent<T>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'arraybuffer', withCredentials?: boolean,
  }): Observable<HttpResponse<ArrayBuffer>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'blob', withCredentials?: boolean,
  }): Observable<HttpResponse<Blob>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType: 'text', withCredentials?: boolean,
  }): Observable<HttpResponse<string>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<Object>>;

  put<T>(req: ODataRequest, body: any|null, etag?:string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe: 'response',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<HttpResponse<T>>;

  put(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<Object>;

  put<T>(req: ODataRequest, body: any|null, etag?: string, options?: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: 'body',
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'json'|'entity',
    withCredentials?: boolean,
  }): Observable<T>;

  put(req: ODataRequest, body: any|null, etag?: string, options: {
    headers?: HttpHeaders | {[header: string]: string | string[]},
    observe?: ODataObserve,
    params?: HttpParams|{[param: string]: string | string[]},
    reportProgress?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'entity' | 'entityset' | 'property',
    withCredentials?: boolean,
  } = {}): Observable<any> {
    return this.request<any>('PUT', req, addEtag(addBody(options, body), etag));
  }
}
