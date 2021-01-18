import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ODataClient } from '../../client';

import { ODataPathSegments, PathSegmentNames, SegmentOptionNames } from '../path-segments';
import { ODataQueryOptions, QueryOptionNames } from '../query-options';
import { HttpEntityOptions, HttpEntitiesOptions, HttpPropertyOptions, HttpOptions } from './options';

import { Types } from '../../utils/types';
import { EntityKey } from '../../types';
import { Select, Expand, Transform, Filter, OrderBy, PlainObject } from '../builder';
import { ODataResource } from '../resource';
import { ODataEntity, ODataEntities, ODataProperty } from '../responses';
import { ODataStructuredTypeParser } from '../../parsers/structured-type';
import { ODataModel, ODataCollection } from '../../models';

export class ODataFunctionResource<P, R> extends ODataResource<R> {
  //#region Factory
  static factory<P, R>(client: ODataClient, path: string, type: string | null, segments: ODataPathSegments, options: ODataQueryOptions) {
    const segment = segments.segment(PathSegmentNames.function, path);
    if (type)
      segment.setType(type);
    options.clear();
    return new ODataFunctionResource<P, R>(client, segments, options);
  }

  clone() {
    return new ODataFunctionResource<P, R>(this._client, this.pathSegments.clone(), this.queryOptions.clone());
  }
  //#endregion

  //#region Action Config
  get schema() {
    let type = this.type();
    if (type === null) return null;
    return this.api.findCallableForType<R>(type) || null;
  }
  //#endregion

  //#region Inmutable Resource
  parameters(params: P | null) {
    let segments = this.pathSegments.clone();
    let segment = segments.segment(PathSegmentNames.function);
    if (!segment)
      throw new Error(`FunctionResource dosn't have segment for function`);
    segment.option(SegmentOptionNames.parameters, params !== null ? this.serialize(params) : null);
    return new ODataFunctionResource<P, R>(this._client, segments, this.queryOptions.clone());
  }
  //#endregion

  //#region Mutable Resource
  get segment() {
    const res = this;
    const segments = this.pathSegments;
    return {
      entitySet(name?: string) {
        const segment = segments.segment(PathSegmentNames.entitySet);
        if (name !== undefined)
          segment.setPath(name);
        return segment;
      },
      key<E>(key?: EntityKey<E>) {
        const api = res.api;
        const segment = segments.segment(PathSegmentNames.entitySet);
        if (key !== undefined) {
          const type = res.type();
          if (type !== null) {
            let parser = api.findParserForType<E>(type);
            if (parser instanceof ODataStructuredTypeParser && Types.isObject(key))
              key = parser.resolveKey(key);
          }
          segment.option(SegmentOptionNames.key, key);
        }
        return segment.option(SegmentOptionNames.key);
      },
      parameters(params?: P) {
        let segment = segments.segment(PathSegmentNames.function);
        if (params !== undefined) {
          segment.option(SegmentOptionNames.parameters, res.serialize(params));
        }
        return segment.option(SegmentOptionNames.parameters);
      }
    }
  }

  get query() {
    const options = this.queryOptions;
    return {
      select(opts?: Select<R>) {
        return options.option<Select<R>>(QueryOptionNames.select, opts);
      },
      expand(opts?: Expand<R>) {
        return options.option<Expand<R>>(QueryOptionNames.expand, opts);
      },
      transform(opts?: Transform<R>) {
        return options.option<Transform<R>>(QueryOptionNames.transform, opts);
      },
      search(opts?: string) {
        return options.option<string>(QueryOptionNames.search, opts);
      },
      filter(opts?: Filter) {
        return options.option<Filter>(QueryOptionNames.filter, opts);
      },
      orderBy(opts?: OrderBy<R>) {
        return options.option<OrderBy<R>>(QueryOptionNames.orderBy, opts);
      },
      format(opts?: string) {
        return options.option<string>(QueryOptionNames.format, opts);
      },
      top(opts?: number) {
        return options.option<number>(QueryOptionNames.top, opts);
      },
      skip(opts?: number) {
        return options.option<number>(QueryOptionNames.skip, opts);
      },
      skiptoken(opts?: string) {
        return options.option<string>(QueryOptionNames.skiptoken, opts);
      },
      custom(opts?: PlainObject) {
        return options.option<PlainObject>(QueryOptionNames.custom, opts);
      }
    }
  }
  //#endregion

  //#region Requests
  get(options: HttpEntityOptions): Observable<ODataEntity<R>>;
  get(options: HttpEntitiesOptions): Observable<ODataEntities<R>>;
  get(options: HttpPropertyOptions): Observable<ODataProperty<R>>;
  get(options: HttpEntityOptions & HttpEntitiesOptions & HttpPropertyOptions): Observable<any> {
    return super.get(options);
  }
  //#endregion

  //#region Custom
  call(params: P | null, responseType: 'entity', options?: HttpOptions): Observable<R>;
  call(params: P | null, responseType: 'entities', options?: HttpOptions): Observable<R[]>;
  call(params: P | null, responseType: 'property', options?: HttpOptions): Observable<R>;
  call(params: P | null, responseType: 'model', options?: HttpOptions): Observable<ODataModel<R>>;
  call(params: P | null, responseType: 'collection', options?: HttpOptions): Observable<ODataCollection<R, ODataModel<R>>>;
  call(
    params: P | null,
    responseType: 'property' | 'entity' | 'model' | 'entities' | 'collection',
    options?: HttpOptions
  ): Observable<any> {
    const res = this.parameters(params);
    const opts = responseType === 'model' ? Object.assign(<HttpEntityOptions>{responseType: 'entity'}, options || {}) :
      responseType === 'collection' ? Object.assign(<HttpEntitiesOptions>{responseType: 'entities'}, options || {}) :
      Object.assign(<HttpOptions>{responseType}, options || {});
    const res$ = res.get(opts) as Observable<any>;
    switch(responseType) {
      case 'entities':
        return (res$ as Observable<ODataEntities<R>>).pipe(map(({entities}) => entities));
      case 'collection':
        return (res$ as Observable<ODataEntities<R>>).pipe(map(({entities, meta}) => res.asCollection(entities || [], meta)));
      case 'entity':
        return (res$ as Observable<ODataEntity<R>>).pipe(map(({entity}) => entity));
      case 'model':
        return (res$ as Observable<ODataEntity<R>>).pipe(map(({entity, meta}) => res.asModel(entity || {}, meta)));
      case 'property':
        return (res$ as Observable<ODataProperty<R>>).pipe(map(({property}) => property));
      default:
        return res$;
    }
  }
  //#endregion
}
