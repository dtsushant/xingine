import {
  ConditionalMeta,
  WrapperMeta,
  Commissar, PathProperties
} from '../xingine.type';
import {
  FormMeta,
  DetailMeta,
  TableMeta,
  ChartMeta,
  ChartConfig,
  ChartDataset,
  ColumnMeta, 
  FieldMeta,
  GrouperFieldProperties,
  TitleMeta
} from '../component/component-meta-map';
import { ButtonMeta, IconMeta, InputMeta } from '../component';
import { WrapInMeta, WrapInMetaBuilder } from '../component/wrap-in-meta';
import { StyleMeta } from '../expressions/style';
import {EventBindings, SerializableAction} from '../expressions';
import { ConditionalExpression } from '../expressions/operators';
import { ConditionalRenderConfig, DataProvider, DefaultFormDataProvider } from '../expressions/providers';
import { BaseComponentDetailBuilder } from './base-component-detail-builder';
import {ActionBuilder} from "./action-builders";
import {StyleMetaBuilder} from "./reusable-builders";

/**
 * Builder for ConditionalMeta objects
 */
export class ConditionalMetaBuilder {
  private meta: ConditionalMeta = {
    condition: { field: '', operator: 'eq', value: true },
    trueComponent: {}
  };

  static create(): ConditionalMetaBuilder {
    return new ConditionalMetaBuilder();
  }

  condition(condition: ConditionalExpression): ConditionalMetaBuilder {
    this.meta.condition = condition;
    return this;
  }

  trueComponent(component: any): ConditionalMetaBuilder {
    this.meta.trueComponent = component;
    return this;
  }

  falseComponent(component: any): ConditionalMetaBuilder {
    this.meta.falseComponent = component;
    return this;
  }

  property(key: string, value: unknown): ConditionalMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): ConditionalMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ConditionalMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): ConditionalMeta {
    return { ...this.meta };
  }
}

/**
 * Builder for IconMeta objects
 */
export class IconMetaBuilder {
  private meta: IconMeta = {};

  static create(): IconMetaBuilder {
    return new IconMetaBuilder();
  }

  name(name: string): IconMetaBuilder {
    this.meta.name = name;
    return this;
  }

  color(color: string): IconMetaBuilder {
    this.meta.color = color;
    return this;
  }

  size(size: number | string): IconMetaBuilder {
    this.meta.size = size;
    return this;
  }

  spin(spin: boolean): IconMetaBuilder {
    this.meta.spin = spin;
    return this;
  }

  rotate(rotate: number): IconMetaBuilder {
    this.meta.rotate = rotate;
    return this;
  }

  twoToneColor(color: string): IconMetaBuilder {
    this.meta.twoToneColor = color;
    return this;
  }

  style(style: StyleMeta): IconMetaBuilder {
    this.meta.style = style;
    return this;
  }

  event(event: EventBindings): IconMetaBuilder {
    this.meta.event = event;
    return this;
  }

  property(key: string, value: unknown): IconMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): IconMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): IconMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): IconMeta {
    return { ...this.meta };
  }
}

/**
 * Builder for ButtonMeta objects
 */
export class ButtonMetaBuilder {
  private meta: ButtonMeta = { name: '' };

  static create(): ButtonMetaBuilder {
    return new ButtonMetaBuilder();
  }

  name(name: string): ButtonMetaBuilder {
    this.meta.name = name;
    return this;
  }

  content(content: string | IconMeta): ButtonMetaBuilder {
    this.meta.content = content;
    return this;
  }

  event(event: EventBindings): ButtonMetaBuilder {
    this.meta.event = event;
    return this;
  }

  style(style: StyleMeta): ButtonMetaBuilder {
    this.meta.style = style;
    return this;
  }

    /**
     * Add wrapper configuration using builder
     */
    withStyle(builderFn: (builder: StyleMetaBuilder) => StyleMetaBuilder): ButtonMetaBuilder {
        const builder = StyleMetaBuilder.create();
        this.meta.style = builderFn(builder).build();
        return this;
    }

  property(key: string, value: unknown): ButtonMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  text(text: string): ButtonMetaBuilder {
    this.meta.text = text;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): ButtonMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ButtonMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): ButtonMeta {
    if (!this.meta.name) {
      throw new Error('Button name is required');
    }
    return { ...this.meta };
  }
}

/**
 * Builder for InputMeta objects
 */
export class InputMetaBuilder {
  private meta: InputMeta = { name: '' };

  static create(): InputMetaBuilder {
    return new InputMetaBuilder();
  }

  name(name: string): InputMetaBuilder {
    this.meta.name = name;
    return this;
  }

  placeholder(placeholder: string): InputMetaBuilder {
    this.meta.placeholder = placeholder;
    return this;
  }

  event(event: EventBindings): InputMetaBuilder {
    this.meta.event = event;
    return this;
  }

  style(style: StyleMeta): InputMetaBuilder {
    this.meta.style = style;
    return this;
  }

  icon(icon: IconMeta): InputMetaBuilder {
    this.meta.icon = icon;
    return this;
  }

  property(key: string, value: unknown): InputMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): InputMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): InputMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): InputMeta {
    if (!this.meta.name) {
      throw new Error('Input name is required');
    }
    return { ...this.meta };
  }
}

/**
 * Builder for WrapperMeta objects
 */
export class WrapperMetaBuilder {
  private meta: WrapperMeta = {};

  static create(): WrapperMetaBuilder {
    return new WrapperMetaBuilder();
  }

  content(content: string): WrapperMetaBuilder {
    this.meta.content = content;
    return this;
  }

  style(style: StyleMeta): WrapperMetaBuilder {
    this.meta.style = style;
    return this;
  }

  event(event: EventBindings): WrapperMetaBuilder {
    this.meta.event = event;
    return this;
  }

  children(children: any[]): WrapperMetaBuilder {
    this.meta.children = children;
    return this;
  }

  addChild(child: any): WrapperMetaBuilder {
    if (!this.meta.children) {
      this.meta.children = [];
    }
    this.meta.children.push(child);
    return this;
  }

  property(key: string, value: unknown): WrapperMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): WrapperMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): WrapperMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): WrapperMeta {
    return { ...this.meta };
  }
}

/**
 * Builder for FormMeta objects
 */
export class FormMetaBuilder {
  private meta: FormMeta = { fields: [], action: '' };

  static create(): FormMetaBuilder {
    return new FormMetaBuilder();
  }

  fields(fields: FieldMeta[]): FormMetaBuilder {
    this.meta.fields = fields;
    return this;
  }

  addField(field: FieldMeta): FormMetaBuilder {
    this.meta.fields.push(field);
    return this;
  }

  action(action: string): FormMetaBuilder {
    this.meta.action = action;
    return this;
  }

  event(event: EventBindings): FormMetaBuilder {
    this.meta.event = event;
    return this;
  }

  /**
   * Enables or disables the JSON editor for this form
   */
  showJsonEditor(show: boolean = true): FormMetaBuilder {
    this.meta.showJsonEditor = show;
    return this;
  }

  property(key: string, value: unknown): FormMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): FormMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): FormMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  /**
   * Set child wrapper for the grouper fields container
   */
  childWrapper(wrapIn: WrapInMeta): FormMetaBuilder {
    this.meta.childWrapper = wrapIn;
    return this;
  }

  /**
   * Set child wrapper using builder function for the grouper fields container
   */
  withChildWrapper(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): FormMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.childWrapper = builderFn(builder).build();
    return this;
  }

  build(): FormMeta {
    if (!this.meta.action) {
      throw new Error('Form action is required');
    }
    return { ...this.meta };
  }
}

/**
 * Builder for DetailMeta objects
 */
export class DetailMetaBuilder {
  private meta: DetailMeta = { fields: [], action: '' };

  static create(): DetailMetaBuilder {
    return new DetailMetaBuilder();
  }

  fields(fields: DetailMeta['fields']): DetailMetaBuilder {
    this.meta.fields = fields;
    return this;
  }

  addField(field: DetailMeta['fields'][0]): DetailMetaBuilder {
    this.meta.fields.push(field);
    return this;
  }

  action(action: string): DetailMetaBuilder {
    this.meta.action = action;
    return this;
  }

  event(event: EventBindings): DetailMetaBuilder {
    this.meta.event = event;
    return this;
  }

  dispatch(dispatch: DetailMeta['dispatch']): DetailMetaBuilder {
    this.meta.dispatch = dispatch;
    return this;
  }

  property(key: string, value: unknown): DetailMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): DetailMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): DetailMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): DetailMeta {
    if (!this.meta.action) {
      throw new Error('Detail action is required');
    }
    return { ...this.meta };
  }
}

/**
 * Builder for TableMeta objects
 */
export class TableMetaBuilder {
  private meta: TableMeta = { columns: [], dataSourceUrl: '' };

  static create(): TableMetaBuilder {
    return new TableMetaBuilder();
  }

  columns(columns: ColumnMeta[]): TableMetaBuilder {
    this.meta.columns = columns;
    return this;
  }

  addColumn(column: ColumnMeta): TableMetaBuilder {
    this.meta.columns.push(column);
    return this;
  }

  dataSourceUrl(url: string): TableMetaBuilder {
    this.meta.dataSourceUrl = url;
    return this;
  }

  rowKey(key: string): TableMetaBuilder {
    this.meta.rowKey = key;
    return this;
  }

  event(event: EventBindings): TableMetaBuilder {
    this.meta.event = event;
    return this;
  }

  handleRowClick(action:SerializableAction):TableMetaBuilder{
      this.meta.handleRowClick = action;
      return this;
  }

  property(key: string, value: unknown): TableMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): TableMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): TableMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): TableMeta {
    if (!this.meta.dataSourceUrl) {
      throw new Error('Table dataSourceUrl is required');
    }
    return { ...this.meta };
  }
}

/**
 * Builder for ChartMeta objects
 */
export class ChartMetaBuilder {
  private meta: ChartMeta = { charts: [] };

  static create(): ChartMetaBuilder {
    return new ChartMetaBuilder();
  }

  charts(charts: ChartConfig[]): ChartMetaBuilder {
    this.meta.charts = charts;
    return this;
  }

  addChart(chart: ChartConfig): ChartMetaBuilder {
    this.meta.charts.push(chart);
    return this;
  }

  event(event: EventBindings): ChartMetaBuilder {
    this.meta.event = event;
    return this;
  }

  renderer(renderer: ChartMeta['renderer']): ChartMetaBuilder {
    this.meta.renderer = renderer;
    return this;
  }

  property(key: string, value: unknown): ChartMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): ChartMetaBuilder {
    this.meta.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ChartMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.meta.wrapIn = builderFn(builder).build();
    return this;
  }

  build(): ChartMeta {
    return { ...this.meta };
  }
}

/**
 * Builder for ChartConfig objects
 */
export class ChartConfigMetaBuilder {
  private config: ChartConfig = {} as ChartConfig;

  static create(): ChartConfigMetaBuilder {
    return new ChartConfigMetaBuilder();
  }

  type(type: ChartConfig['type']): ChartConfigMetaBuilder {
    this.config.type = type;
    return this;
  }

  title(title: string): ChartConfigMetaBuilder {
    this.config.title = title;
    return this;
  }

  width(width: number): ChartConfigMetaBuilder {
    this.config.width = width;
    return this;
  }

  height(height: number): ChartConfigMetaBuilder {
    this.config.height = height;
    return this;
  }

  labels(labels: string[]): ChartConfigMetaBuilder {
    this.config.labels = labels;
    return this;
  }

  datasets(datasets: ChartConfig['datasets']): ChartConfigMetaBuilder {
    this.config.datasets = datasets;
    return this;
  }

  addDataset(dataset: ChartDataset): ChartConfigMetaBuilder {
    if (!this.config.datasets) {
      this.config.datasets = [];
    }
    this.config.datasets.push(dataset);
    return this;
  }

  options(options: Record<string, unknown>): ChartConfigMetaBuilder {
    this.config.options = options;
    return this;
  }

  dataSourceUrl(url: string): ChartConfigMetaBuilder {
    this.config.dataSourceUrl = url;
    return this;
  }

  build(): ChartConfig {
    if (!this.config.type) {
      throw new Error('Chart type is required');
    }
    return { ...this.config };
  }
}

/**
 * Builder for Commissar objects
 * Commissar extends LayoutComponentDetail and adds path and permission properties
 * Inherits all component building capabilities from BaseComponentDetailBuilder
 */
export class CommissarBuilder extends BaseComponentDetailBuilder<Commissar, CommissarBuilder> {
  
  constructor() {
    super({ path: '' });
  }

  /**
   * Creates a new CommissarBuilder instance
   */
  static create(): CommissarBuilder {
    return new CommissarBuilder();
  }

  /**
   * Create a builder from an existing Commissar object
   */
  static fromCommissar(commissar: Commissar): CommissarBuilder {
    const builder = new CommissarBuilder();
    builder.layoutDetail = { ...commissar };
    return builder;
  }

  /**
   * Set the complete Commissar object
   */
  fromObject(commissar: Commissar): CommissarBuilder {
    this.layoutDetail = { ...commissar };
    return this;
  }

  /**
   * Sets the path (required for Commissar)
   */
  path(path: string): CommissarBuilder {
    (this.layoutDetail as Commissar).path = path;
    return this;
  }

  pathWithProperties(path: string | PathProperties): CommissarBuilder {
    if (typeof path === 'string') {
      (this.layoutDetail as Commissar).path = path;
    } else {
      (this.layoutDetail as Commissar).path = { ...path };
    }
    return this;
  }

  /**
   * Sets the permission array (optional for Commissar)
   */
  permission(permission: string[]): CommissarBuilder {
    (this.layoutDetail as Commissar).permission = permission;
    return this;
  }

  /**
   * Adds a single permission to the permission array
   */
  addPermission(permission: string): CommissarBuilder {
    const commissar = this.layoutDetail as Commissar;
    if (!commissar.permission) {
      commissar.permission = [];
    }
    commissar.permission.push(permission);
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): CommissarBuilder {
    (this.layoutDetail as any)[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): CommissarBuilder {
    Object.assign(this.layoutDetail, properties);
    return this;
  }



  /**
   * Returns typed self reference for method chaining
   */
  protected self(): CommissarBuilder {
    return this;
  }

  /**
   * Builds and returns the final Commissar object
   */
  build(): Commissar {
    const commissar = this.layoutDetail as Commissar;
    if (!commissar.path) {
      throw new Error('Path is required for Commissar');
    }
    return { ...commissar };
  }
}

/**
 * Builder for FieldMeta objects with conditional rendering support
 */
export class FieldMetaBuilder {
  private field: FieldMeta = {};

  static create(): FieldMetaBuilder {
    return new FieldMetaBuilder();
  }

  name(name: string): FieldMetaBuilder {
    this.field.name = name;
    return this;
  }

  label(label: string | TitleMeta): FieldMetaBuilder {
    this.field.label = label;
    return this;
  }

  /**
   * Set label as TitleMeta with content and optional wrapIn
   */
  labelWithWrapper(content: string, wrapIn?: WrapInMeta): FieldMetaBuilder {
    this.field.label = { content, wrapIn };
    return this;
  }

  inputType(inputType: FieldMeta['inputType']): FieldMetaBuilder {
    this.field.inputType = inputType;
    return this;
  }

  value(value: string): FieldMetaBuilder {
    this.field.value = value;
    return this;
  }

  required(required: boolean = true): FieldMetaBuilder {
    this.field.required = required;
    return this;
  }

  order(order: number): FieldMetaBuilder {
    this.field.order = order;
    return this;
  }

  properties(properties: FieldMeta['properties']): FieldMetaBuilder {
    this.field.properties = properties;
    return this;
  }

  event(event: EventBindings): FieldMetaBuilder {
    this.field.event = event;
    return this;
  }

  /**
   * Adds conditional rendering to the field
   */
  withCondition(condition: ConditionalExpression, provider?: DataProvider): FieldMetaBuilder {
    this.field.conditionalRender = {
      condition,
      provider // Optional, defaults to form data if not provided
    };
    
    return this;
  }

  /**
   * Adds conditional rendering with a simple field-based condition
   */
  showWhen(fieldName: string, operator: string, value: unknown): FieldMetaBuilder {
    const condition: ConditionalExpression = {
      field: fieldName,
      operator: operator as any,
      value
    };
    
    return this.withCondition(condition);
  }

  /**
   * Shows field when another field equals a specific value
   */
  showWhenEquals(fieldName: string, value: unknown): FieldMetaBuilder {
    return this.showWhen(fieldName, 'eq', value);
  }

  /**
   * Shows field when another field is not equal to a specific value
   */
  showWhenNotEquals(fieldName: string, value: unknown): FieldMetaBuilder {
    return this.showWhen(fieldName, 'ne', value);
  }

  /**
   * Shows field when another field contains a specific value (for multi-select/array fields)
   */
  showWhenContains(fieldName: string, value: unknown): FieldMetaBuilder {
    return this.showWhen(fieldName, 'in', value);
  }

  /**
   * Shows field when another field is not null/undefined/empty
   */
  showWhenNotEmpty(fieldName: string): FieldMetaBuilder {
    return this.showWhen(fieldName, 'ne', null);
  }

  /**
   * Add wrapper configuration
   */
  withWrapIn(wrapIn: WrapInMeta): FieldMetaBuilder {
    this.field.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): FieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.field.wrapIn = builderFn(builder).build();
    return this;
  }

  /**
   * Add wrapper configuration with direct WrapInMeta object
   */
  wrapIn(wrapIn: WrapInMeta): FieldMetaBuilder {
    this.field.wrapIn = wrapIn;
    return this;
  }

  /**
   * Configure object field with nested fields and optional child wrapper
   */
  objectFields(fields: FieldMeta[], childWrapper?: WrapInMeta): FieldMetaBuilder {
    this.field.inputType = 'object';
    this.field.properties = {
      fields,
      childWrapper
    };
    return this;
  }

  /**
   * Configure object[] field with item fields and optional wrappers
   */
  objectArrayFields(itemFields: FieldMeta[], childWrapper?: WrapInMeta, listWrapper?: WrapInMeta): FieldMetaBuilder {
    this.field.inputType = 'object[]';
    this.field.properties = {
      itemFields,
      childWrapper,
      listWrapper
    };
    return this;
  }

  /**
   * Add child wrapper for object/object[] fields
   */
  withChildWrapper(childWrapper: WrapInMeta): FieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = {};
    }
    
    // Type assertion to handle the union type
    const properties = this.field.properties as any;
    properties.childWrapper = childWrapper;
    return this;
  }

  /**
   * Add list wrapper for object[] fields
   */
  withListWrapper(listWrapper: WrapInMeta): FieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = {};
    }
    
    // Type assertion to handle the union type
    const properties = this.field.properties as any;
    properties.listWrapper = listWrapper;
    return this;
  }

  build(): FieldMeta {
    return { ...this.field };
  }
}

/**
 * Builder for grouper fields that group multiple fields with custom styling
 */
export class GrouperFieldMetaBuilder {
  private field: FieldMeta = {
    inputType: 'grouper',
    properties: { fields: [] }
  };

  static create(): GrouperFieldMetaBuilder {
    return new GrouperFieldMetaBuilder();
  }

  /**
   * Set the name for this grouper (optional, usually omitted for layout-only groupers)
   */
  name(name: string): GrouperFieldMetaBuilder {
    this.field.name = name;
    return this;
  }

  /**
   * Set label for this grouper (optional, for collapsible groups)
   */
  label(label: string | TitleMeta): GrouperFieldMetaBuilder {
    this.field.label = label;
    return this;
  }

  /**
   * Set label as TitleMeta with content and optional wrapIn
   */
  labelWithWrapper(content: string, wrapIn?: WrapInMeta): GrouperFieldMetaBuilder {
    this.field.label = { content, wrapIn };
    return this;
  }

  /**
   * Set the fields to be grouped
   */
  fields(fields: FieldMeta[]): GrouperFieldMetaBuilder {
    this.field.properties = { ...this.field.properties, fields };
    return this;
  }

  /**
   * Set title for the grouper with optional wrapper configuration
   */
  title(content: string, wrapIn?: WrapInMeta): GrouperFieldMetaBuilder {
    const properties = this.field.properties as GrouperFieldProperties;
    properties.title = { content, wrapIn };
    return this;
  }

  /**
   * Set child wrapper for the grouper fields container
   */
  childWrapper(wrapIn: WrapInMeta): GrouperFieldMetaBuilder {
    const properties = this.field.properties as GrouperFieldProperties;
    properties.childWrapper = wrapIn;
    return this;
  }

  /**
   * Set child wrapper using builder function for the grouper fields container
   */
  withChildWrapper(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): GrouperFieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    const properties = this.field.properties as GrouperFieldProperties;
    properties.childWrapper = builderFn(builder).build();
    return this;
  }

  /**
   * Add a single field to the group
   */
  addField(field: FieldMeta): GrouperFieldMetaBuilder {
    const properties = this.field.properties as { fields: FieldMeta[] };
    properties.fields.push(field);
    return this;
  }

  /**
   * Add multiple fields using a builder function
   */
  withFields(builderFn: (fields: FieldMeta[]) => FieldMeta[]): GrouperFieldMetaBuilder {
    const properties = this.field.properties as { fields: FieldMeta[] };
    properties.fields = builderFn(properties.fields);
    return this;
  }

  /**
   * Set the order for this grouper
   */
  order(order: number): GrouperFieldMetaBuilder {
    this.field.order = order;
    return this;
  }

  /**
   * Add conditional rendering to the grouper
   */
  withCondition(condition: ConditionalExpression, provider?: DataProvider): GrouperFieldMetaBuilder {
    this.field.conditionalRender = {
      condition,
      provider
    };
    return this;
  }

  /**
   * Shows grouper when a field equals a specific value
   */
  showWhenEquals(fieldName: string, value: unknown): GrouperFieldMetaBuilder {
    return this.withCondition({
      field: fieldName,
      operator: 'eq',
      value
    });
  }

  /**
   * Add wrapper configuration for styling the group container
   */
  withWrapIn(wrapIn: WrapInMeta): GrouperFieldMetaBuilder {
    this.field.wrapIn = wrapIn;
    return this;
  }

  /**
   * Add wrapper configuration using builder (for styling the group container)
   */
  wrapInMeta(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): GrouperFieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.field.wrapIn = builderFn(builder).build();
    return this;
  }

  /**
   * Quick method to create a row layout grouper
   */
  asRow(gap: string = '1rem'): GrouperFieldMetaBuilder {
    return this.wrapInMeta(w => w
      .className('flex flex-row')
      .cssStyle({ gap })
    );
  }

  /**
   * Quick method to create a row layout with child wrapper for fields
   */
  asRowWithChildWrapper(gap: string = '1rem', childGap: string = '0.5rem'): GrouperFieldMetaBuilder {
    return this.wrapInMeta(w => w.className('flex flex-col'))
      .withChildWrapper(w => w
        .className('flex flex-row')
        .cssStyle({ gap: childGap })
      );
  }

  /**
   * Quick method to create a grid layout grouper
   */
  asGrid(columns: number, gap: string = '1rem'): GrouperFieldMetaBuilder {
    return this.wrapInMeta(w => w
      .className('grid')
      .cssStyle({ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap 
      })
    );
  }

  /**
   * Quick method to create a grid layout with separate child wrapper
   */
  asGridWithChildWrapper(columns: number, gap: string = '1rem', childGap: string = '0.5rem'): GrouperFieldMetaBuilder {
    return this.wrapInMeta(w => w.className('flex flex-col'))
      .withChildWrapper(w => w
        .className('grid')
        .cssStyle({ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: childGap 
        })
      );
  }

  /**
   * Quick method to create a card-style grouper
   */
  asCard(titleText?: string): GrouperFieldMetaBuilder {
    if (titleText) {
      this.title(titleText);
    }
    return this.wrapInMeta(w => w
      .className('bg-white p-4 rounded-lg shadow-md border')
    );
  }

  /**
   * Quick method to create a card with separate child wrapper for fields
   */
  asCardWithChildWrapper(titleText?: string, childColumns: number = 2, childGap: string = '1rem'): GrouperFieldMetaBuilder {
    if (titleText) {
      this.title(titleText);
    }
    return this.wrapInMeta(w => w
        .className('bg-white p-4 rounded-lg shadow-md border')
      )
      .withChildWrapper(w => w
        .className('grid mt-4')
        .cssStyle({ 
          gridTemplateColumns: `repeat(${childColumns}, 1fr)`,
          gap: childGap 
        })
      );
  }

  /**
   * Add event bindings
   */
  event(event: EventBindings): GrouperFieldMetaBuilder {
    this.field.event = event;
    return this;
  }

  build(): FieldMeta {
    return { ...this.field };
  }
}

/**
 * Builder for object fields with nested form fields and advanced styling
 */
export class ObjectFieldMetaBuilder {
  private field: FieldMeta = {
    inputType: 'object',
    properties: { fields: [] }
  };

  static create(): ObjectFieldMetaBuilder {
    return new ObjectFieldMetaBuilder();
  }

  name(name: string): ObjectFieldMetaBuilder {
    this.field.name = name;
    return this;
  }

  label(label: string | TitleMeta): ObjectFieldMetaBuilder {
    this.field.label = label;
    return this;
  }

  labelWithWrapper(content: string, wrapIn?: WrapInMeta): ObjectFieldMetaBuilder {
    this.field.label = { content, wrapIn };
    return this;
  }

  required(required: boolean = true): ObjectFieldMetaBuilder {
    this.field.required = required;
    return this;
  }

  fields(fields: FieldMeta[]): ObjectFieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = { fields: [] };
    }
    (this.field.properties as any).fields = fields;
    return this;
  }

  addField(field: FieldMeta): ObjectFieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = { fields: [] };
    }
    (this.field.properties as any).fields.push(field);
    return this;
  }

  withChildWrapper(childWrapper: WrapInMeta): ObjectFieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = { fields: [] };
    }
    (this.field.properties as any).childWrapper = childWrapper;
    return this;
  }

  withChildWrapperBuilder(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ObjectFieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    return this.withChildWrapper(builderFn(builder).build());
  }

  wrapIn(wrapIn: WrapInMeta): ObjectFieldMetaBuilder {
    this.field.wrapIn = wrapIn;
    return this;
  }

  wrapInBuilder(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ObjectFieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.field.wrapIn = builderFn(builder).build();
    return this;
  }

  /**
   * Quick method to create a card-style object field
   */
  asCard(titleText?: string): ObjectFieldMetaBuilder {
    if (titleText) {
      this.label(titleText);
    }
    return this.wrapInBuilder(w => w
      .className('bg-white p-6 rounded-lg shadow-md border border-gray-200/50')
    );
  }

  /**
   * Quick method to create a grid layout for child fields
   */
  asGrid(columns: number = 2, gap: string = '1rem'): ObjectFieldMetaBuilder {
    return this.withChildWrapperBuilder(w => w
      .className('grid')
      .cssStyle({ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap 
      })
    );
  }

  /**
   * Quick method to create a card with grid layout for child fields
   */
  asCardWithGrid(titleText?: string, columns: number = 2, gap: string = '1rem'): ObjectFieldMetaBuilder {
    return this.asCard(titleText).asGrid(columns, gap);
  }

  conditionalRender(config: ConditionalRenderConfig): ObjectFieldMetaBuilder {
    this.field.conditionalRender = config;
    return this;
  }

  showWhenEquals(fieldName: string, value: unknown): ObjectFieldMetaBuilder {
    this.field.conditionalRender = {
      condition: { field: fieldName, operator: 'eq', value }
    };
    return this;
  }

  build(): FieldMeta {
    return { ...this.field };
  }
}

/**
 * Builder for object[] fields with array item fields and advanced styling
 */
export class ObjectArrayFieldMetaBuilder {
  private field: FieldMeta = {
    inputType: 'object[]',
    properties: { itemFields: [] }
  };

  static create(): ObjectArrayFieldMetaBuilder {
    return new ObjectArrayFieldMetaBuilder();
  }

  name(name: string): ObjectArrayFieldMetaBuilder {
    this.field.name = name;
    return this;
  }

  label(label: string | TitleMeta): ObjectArrayFieldMetaBuilder {
    this.field.label = label;
    return this;
  }

  labelWithWrapper(content: string, wrapIn?: WrapInMeta): ObjectArrayFieldMetaBuilder {
    this.field.label = { content, wrapIn };
    return this;
  }

  required(required: boolean = true): ObjectArrayFieldMetaBuilder {
    this.field.required = required;
    return this;
  }

  itemFields(fields: FieldMeta[]): ObjectArrayFieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = { itemFields: [] };
    }
    (this.field.properties as any).itemFields = fields;
    return this;
  }

  addItemField(field: FieldMeta): ObjectArrayFieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = { itemFields: [] };
    }
    (this.field.properties as any).itemFields.push(field);
    return this;
  }

  withChildWrapper(childWrapper: WrapInMeta): ObjectArrayFieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = { itemFields: [] };
    }
    (this.field.properties as any).childWrapper = childWrapper;
    return this;
  }

  withChildWrapperBuilder(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ObjectArrayFieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    return this.withChildWrapper(builderFn(builder).build());
  }

  withListWrapper(listWrapper: WrapInMeta): ObjectArrayFieldMetaBuilder {
    if (!this.field.properties) {
      this.field.properties = { itemFields: [] };
    }
    (this.field.properties as any).listWrapper = listWrapper;
    return this;
  }

  withListWrapperBuilder(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ObjectArrayFieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    return this.withListWrapper(builderFn(builder).build());
  }

  wrapIn(wrapIn: WrapInMeta): ObjectArrayFieldMetaBuilder {
    this.field.wrapIn = wrapIn;
    return this;
  }

  wrapInBuilder(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): ObjectArrayFieldMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    this.field.wrapIn = builderFn(builder).build();
    return this;
  }

  /**
   * Quick method to create a card-style list container
   */
  asCardList(titleText?: string): ObjectArrayFieldMetaBuilder {
    if (titleText) {
      this.label(titleText);
    }
    return this.wrapInBuilder(w => w
        .className('bg-white p-6 rounded-lg shadow-md border border-gray-200/50')
      )
      .withListWrapperBuilder(w => w
        .className('space-y-4 mt-4')
      );
  }

  /**
   * Quick method to create card-style items in the array
   */
  asCardItems(): ObjectArrayFieldMetaBuilder {
    return this.withChildWrapperBuilder(w => w
      .className('bg-gray-50 p-4 rounded-md border border-gray-200')
    );
  }

  /**
   * Quick method to create a grid layout for each item's fields
   */
  asItemGrid(columns: number = 2, gap: string = '1rem'): ObjectArrayFieldMetaBuilder {
    return this.withChildWrapperBuilder(w => w
      .className('grid')
      .cssStyle({ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap 
      })
    );
  }

  /**
   * Quick method to create a complete card list with card items and grid layout
   */
  asCardListWithGridItems(titleText?: string, columns: number = 2, gap: string = '1rem'): ObjectArrayFieldMetaBuilder {
    return this.asCardList(titleText)
      .asCardItems()
      .asItemGrid(columns, gap);
  }

  conditionalRender(config: ConditionalRenderConfig): ObjectArrayFieldMetaBuilder {
    this.field.conditionalRender = config;
    return this;
  }

  showWhenEquals(fieldName: string, value: unknown): ObjectArrayFieldMetaBuilder {
    this.field.conditionalRender = {
      condition: { field: fieldName, operator: 'eq', value }
    };
    return this;
  }

  build(): FieldMeta {
    return { ...this.field };
  }
}