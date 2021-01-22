import { JsonSchemaExpandOptions, ODataStructuredTypeFieldParser, ODataStructuredTypeParser } from '../parsers';
import { Annotation, Parser, StructuredTypeConfig } from '../types';
import { ODataAnnotation } from './annotation';
import { ODataSchema } from './schema';

export class ODataStructuredType<T> {
  schema: ODataSchema;
  name: string;
  model?: { new(...params: any[]): any };
  collection?: { new(...params: any[]): any };
  parser: ODataStructuredTypeParser<T>;
  annotations: ODataAnnotation[];

  constructor(config: StructuredTypeConfig<T>, schema: ODataSchema) {
    this.schema = schema;
    this.name = config.name;
    this.model = config.model;
    this.collection = config.collection;
    this.parser = new ODataStructuredTypeParser(config, schema.namespace, schema.alias);
    this.annotations = (config.annotations || []).map(annot => new ODataAnnotation(annot));
  }

  isTypeOf(type: string) {
    var names = [`${this.schema.namespace}.${this.name}`];
    if (this.schema.alias)
      names.push(`${this.schema.alias}.${this.name}`);
    return names.indexOf(type) !== -1;
  }

  get options() {
    return this.schema.options;
  }

  findAnnotation(predicate: (annot: Annotation) => boolean) {
    return this.annotations.find(predicate);
  }

  configure(settings: { findParserForType: (type: string) => Parser<any> | undefined }) {
    const parserSettings = Object.assign({options: this.options}, settings);
    this.parser.configure(parserSettings);
  }

  fields(opts: {
    include_parents?: boolean,
    include_navigation?: boolean
  } = { include_navigation: false, include_parents: true }): ODataStructuredTypeFieldParser<any>[] {
    let parent = this.parser as ODataStructuredTypeParser<any> | undefined;
    let fields = <ODataStructuredTypeFieldParser<any>[]>[];
    while (parent !== undefined) {
      fields = [
        ...parent.fields.filter(field => opts.include_navigation || !field.navigation),
        ...fields
      ];
      if (!opts.include_parents)
        break;
      parent = parent.parent;
    }
    return fields;
  }

  findField<P extends keyof T>(name: P) {
    return this.fields().find(f => f.name === name);
  }

  pick(value: {[name:string]: any}, opts: {
    include_parents?: boolean,
    include_navigation?: boolean,
    include_etag?: boolean
  } = { include_navigation: false, include_parents: true, include_etag: true }): Partial<T> {
    const names = this.fields(opts).map(f => f.name);
    let attrs = Object.keys(value)
      .filter(k => names.indexOf(k) !== -1)
      .reduce((acc, k) => Object.assign(acc, { [k]: value[k] }), {});
    if (opts.include_etag) {
      const etag = this.options.helper.etag(value);
      this.options.helper.etag(attrs, etag);
    }
    return attrs;
  }

  defaults() {
    return this.parser.defaults();
  }

  toJsonSchema(options: JsonSchemaExpandOptions<T> = {}) {
    return this.parser.toJsonSchema(options);
  }
}
