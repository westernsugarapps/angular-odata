import { HttpHeaders } from '@angular/common/http';
import { ODataEntityMeta, ODataEntitiesMeta, ODataPropertyMeta } from './meta';
import { VALUE, Parser, odataType } from '../../types';
import { Types } from '../../utils/types';
import { ODataApiConfig } from '../../config';
import { ODataResource } from '../resource';
import { ODataEntityParser } from '../../parsers/entity';
import { ODataEntities, ODataEntity, ODataProperty } from './types';

export class ODataResponse<T> {
  readonly body: any|null;
  readonly config: ODataApiConfig;
  readonly headers: HttpHeaders;
  readonly status: number;
  readonly statusText: string;
  readonly resource: ODataResource<T>;

  constructor(init: { 
    body?: any | null;
    config?: ODataApiConfig;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    resource?: ODataResource<T>;
  }) {
      this.body = init.body;
      this.config = init.config;
      this.headers = init.headers;
      this.status = init.status;
      this.statusText = init.statusText;
      this.resource = init.resource;
    }

  private parse(parser: Parser<T>, value: any): any {
    const type = Types.isObject(value) ? odataType(value) : undefined;
    if (!Types.isUndefined(type) && parser instanceof ODataEntityParser && parser.type !== type) {
      parser = parser.findParser(c => c.type === type);
    }
    return parser.deserialize(value, this.config.options());
  }
  
  private deserialize(type: string, value: any): any {
    const parser = !Types.isNullOrUndefined(type) ? this.config.parserForType<T>(type) : undefined;
    if (!Types.isUndefined(parser) && 'deserialize' in parser)
      return Array.isArray(value) ? 
        value.map(v => this.parse(parser, v)) : 
        this.parse(parser, value);
    return value;
  }

  entity(): ODataEntity<T> {
    if (this.body) {
      const annotations = new ODataEntityMeta(this.body, this.headers)
      const entity = this.deserialize(this.resource.type(), this.body) as T;
      return { entity, meta: annotations };
    }
  }

  entities(): ODataEntities<T> { 
    if (this.body) {
      const annotations = new ODataEntitiesMeta(this.body, this.headers)
      const entities = this.deserialize(this.resource.type(), this.body[VALUE]) as T[];
      return { entities, meta: annotations };
    }
  }

  property(): ODataProperty<T> {
    if (this.body) {
      const annotations = new ODataPropertyMeta(this.body, this.headers)
      const property = this.deserialize(
        this.resource.type(), 
        VALUE in this.body? this.body[VALUE] : this.body) as T;
      return { property, meta: annotations };
    } 
  }

  value(): T {
    if (this.body) {
      return this.deserialize(this.resource.type(), this.body) as T;
    } 
  }
}