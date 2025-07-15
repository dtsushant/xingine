import { 
  LayoutComponentDetail, 
  ComponentMeta, 
  ComponentMetaMap,
  WrapperMeta,
  ConditionalMeta
} from '../xingine.type';
import { 
  ChartDataset, 
  ChartMeta, 
  ChartConfig,
  FormMeta, 
  DetailMeta, 
  TableMeta,
  ColumnMeta,
  FieldMeta
} from '../component/component-meta-map';
import { DetailFieldMeta } from '../component/detail-meta-map';
import { ButtonMeta, IconMeta, InputMeta } from '../component';
import { StyleMeta } from '../expressions/style';
import { EventBindings } from '../expressions/action';
import { EventBindingsBuilder, StyleMetaBuilder } from './reusable-builders';

/**
 * Base builder class for LayoutComponentDetail and related types
 * Provides common functionality for component builders that can be extended
 */
export abstract class BaseComponentDetailBuilder<T extends LayoutComponentDetail, B extends BaseComponentDetailBuilder<T, B>> {
  protected layoutDetail: T;

  constructor(initialDetail: T) {
    this.layoutDetail = { ...initialDetail };
  }

  /**
   * Sets the component meta for this layout component
   */
  withMeta<K extends keyof ComponentMetaMap>(
    component: K,
    properties: ComponentMetaMap[K]
  ): B {
    this.layoutDetail.meta = {
      component,
      properties
    } as ComponentMeta<K>;
    return this.self();
  }

  /**
   * Creates a WrapperRenderer component
   */
  wrapper(): WrapperRendererBuilder<B> {
    return new WrapperRendererBuilder(this.self());
  }

  /**
   * Creates a ButtonRenderer component
   */
  button(): ButtonRendererBuilder<B> {
    return new ButtonRendererBuilder(this.self());
  }

  /**
   * Creates an InputRenderer component
   */
  input(): InputRendererBuilder<B> {
    return new InputRendererBuilder(this.self());
  }

  /**
   * Creates a FormRenderer component
   */
  form(): FormRendererBuilder<B> {
    return new FormRendererBuilder(this.self());
  }

  /**
   * Creates a TableRenderer component
   */
  table(): TableRendererBuilder<B> {
    return new TableRendererBuilder(this.self());
  }

  /**
   * Creates a ChartRenderer component
   */
  chart(): ChartRendererBuilder<B> {
    return new ChartRendererBuilder(this.self());
  }

  /**
   * Creates a DetailRenderer component
   */
  detailRenderer(): DetailRendererBuilder<B> {
    return new DetailRendererBuilder(this.self());
  }

  /**
   * Creates a ConditionalRenderer component
   */
  conditional(): ConditionalRendererBuilder<B> {
    return new ConditionalRendererBuilder(this.self());
  }

  /**
   * Creates a PopupRenderer component
   */
  popup(): PopupRendererBuilder<B> {
    return new PopupRendererBuilder(this.self());
  }

  /**
   * Creates a dynamic/custom component with user-defined type and properties
   */
  dynamic(componentName: string): DynamicRendererBuilder<B> {
    return new DynamicRendererBuilder(this.self(), componentName);
  }

  /**
   * Returns typed self reference for method chaining
   */
  protected abstract self(): B;

  /**
   * Builds and returns the final object
   */
  build(): T {
    return { ...this.layoutDetail };
  }
}

/**
 * Builder for WrapperRenderer components
 */
export class WrapperRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: WrapperMeta = {};
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing WrapperMeta object (static method)
   */
  static fromWrapperMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: WrapperMeta, 
    parent: P
  ): WrapperRendererBuilder<P> {
    const builder = new WrapperRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete WrapperMeta object (instance method)
   */
  fromWrapperMeta(meta: WrapperMeta): WrapperRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Set the complete WrapperMeta object
   */
  fromObject(meta: WrapperMeta): WrapperRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): WrapperRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): WrapperRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Adds a child component to the wrapper
   */
  addChild(child: LayoutComponentDetail): WrapperRendererBuilder<P> {
    if (!this.properties.children) {
      this.properties.children = [];
    }
    this.properties.children.push(child);
    return this;
  }

  /**
   * Sets multiple children at once
   */
  children(children: LayoutComponentDetail[]): WrapperRendererBuilder<P> {
    this.properties.children = children;
    return this;
  }

  /**
   * Adds multiple children at once (convenience method)
   */
  addChildren(children: LayoutComponentDetail[]): WrapperRendererBuilder<P> {
    if (!this.properties.children) {
      this.properties.children = [];
    }
    this.properties.children.push(...children);
    return this;
  }

  /**
   * Sets wrapper-specific properties
   */
  wrapperProperty(key: string, value: unknown): WrapperRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets the className for styling
   */
  className(className: string): WrapperRendererBuilder<P> {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.className = className;
    return this;
  }

  /**
   * Sets the content/text for the wrapper
   */
  content(content: string): WrapperRendererBuilder<P> {
    this.properties.content = content;
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): WrapperRendererBuilder<P> {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.style = style;
    return this;
  }

  /**
   * Adds event bindings using the EventBindingsBuilder
   */
  withEventBindings(bindings: EventBindings): WrapperRendererBuilder<P> {
    this.properties.event = bindings;
    return this;
  }

  /**
   * Adds event bindings using a builder function
   */
  eventBindings(builderFn: (builder: EventBindingsBuilder) => EventBindingsBuilder): WrapperRendererBuilder<P> {
    const builder = EventBindingsBuilder.create();
    const result = builderFn(builder);
    this.properties.event = result.build();
    return this;
  }

  /**
   * Completes the wrapper configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('WrapperRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for ButtonRenderer components
 */
export class ButtonRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: ButtonMeta = { name: '' };
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing ButtonMeta object (static method)
   */
  static fromButtonMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: ButtonMeta, 
    parent: P
  ): ButtonRendererBuilder<P> {
    const builder = new ButtonRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete ButtonMeta object (instance method)
   */
  fromButtonMeta(meta: ButtonMeta): ButtonRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Set the complete ButtonMeta object
   */
  fromObject(meta: ButtonMeta): ButtonRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the button name
   */
  name(name: string): ButtonRendererBuilder<P> {
    this.properties.name = name;
    return this;
  }

  /**
   * Sets the button content/text
   */
  content(content: string): ButtonRendererBuilder<P> {
    this.properties.content = content;
    return this;
  }

  /**
   * Sets the button icon
   */
  icon(icon: IconMeta): ButtonRendererBuilder<P> {
    this.properties.icon = icon;
    return this;
  }

  /**
   * Sets the button className for styling
   */
  className(className: string): ButtonRendererBuilder<P> {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.className = className;
    return this;
  }

  /**
   * Sets the button type
   */
  type(type: string): ButtonRendererBuilder<P> {
    this.properties.type = type;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): ButtonRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): ButtonRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Adds event bindings using the EventBindingsBuilder
   */
  withEventBindings(bindings: EventBindings): ButtonRendererBuilder<P> {
    this.properties.event = bindings;
    return this;
  }

  /**
   * Adds event bindings using a builder function
   */
  eventBindings(builderFn: (builder: EventBindingsBuilder) => EventBindingsBuilder): ButtonRendererBuilder<P> {
    const builder = EventBindingsBuilder.create();
    const result = builderFn(builder);
    this.properties.event = result.build();
    return this;
  }

  /**
   * Sets event bindings directly (convenience method for .withEventBindings)
   */
  event(bindings: EventBindings): ButtonRendererBuilder<P> {
    return this.withEventBindings(bindings);
  }

  /**
   * Adds style meta using the StyleMetaBuilder
   */
  withStyleMeta(style: StyleMeta): ButtonRendererBuilder<P> {
    this.properties.style = style;
    return this;
  }

  /**
   * Adds style meta using a builder function
   */
  styleMeta(builderFn: (builder: StyleMetaBuilder) => StyleMetaBuilder): ButtonRendererBuilder<P> {
    const builder = StyleMetaBuilder.create();
    const result = builderFn(builder);
    this.properties.style = result.build();
    return this;
  }

  /**
   * Completes the button configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('ButtonRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for InputRenderer components
 */
export class InputRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: InputMeta = { name: '' };
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing InputMeta object (static method)
   */
  static fromInputMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: InputMeta, 
    parent: P
  ): InputRendererBuilder<P> {
    const builder = new InputRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete InputMeta object (instance method)
   */
  fromInputMeta(meta: InputMeta): InputRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Set the complete InputMeta object
   */
  fromObject(meta: InputMeta): InputRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the input name (required)
   */
  name(name: string): InputRendererBuilder<P> {
    this.properties.name = name;
    return this;
  }

  /**
   * Sets the input type
   */
  type(type: string): InputRendererBuilder<P> {
    this.properties.type = type;
    return this;
  }

  /**
   * Sets the input placeholder
   */
  placeholder(placeholder: string): InputRendererBuilder<P> {
    this.properties.placeholder = placeholder;
    return this;
  }

  /**
   * Sets the input label
   */
  label(label: string): InputRendererBuilder<P> {
    this.properties.label = label;
    return this;
  }

  /**
   * Sets the input value
   */
  value(value: string): InputRendererBuilder<P> {
    this.properties.value = value;
    return this;
  }

  /**
   * Sets whether the input is required
   */
  required(required: boolean = true): InputRendererBuilder<P> {
    this.properties.required = required;
    return this;
  }

  /**
   * Sets whether the input is disabled
   */
  disabled(disabled: boolean = true): InputRendererBuilder<P> {
    this.properties.disabled = disabled;
    return this;
  }

  /**
   * Sets the input className for styling
   */
  className(className: string): InputRendererBuilder<P> {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.className = className;
    return this;
  }

  /**
   * Sets the input icon
   */
  icon(icon: IconMeta): InputRendererBuilder<P> {
    this.properties.icon = icon;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): InputRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): InputRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Adds event bindings using the EventBindingsBuilder
   */
  withEventBindings(bindings: EventBindings): InputRendererBuilder<P> {
    this.properties.event = bindings;
    return this;
  }

  /**
   * Adds event bindings using a builder function
   */
  eventBindings(builderFn: (builder: EventBindingsBuilder) => EventBindingsBuilder): InputRendererBuilder<P> {
    const builder = EventBindingsBuilder.create();
    const result = builderFn(builder);
    this.properties.event = result.build();
    return this;
  }

  /**
   * Adds style meta using the StyleMetaBuilder
   */
  withStyleMeta(style: StyleMeta): InputRendererBuilder<P> {
    this.properties.style = style;
    return this;
  }

  /**
   * Adds style meta using a builder function
   */
  styleMeta(builderFn: (builder: StyleMetaBuilder) => StyleMetaBuilder): InputRendererBuilder<P> {
    const builder = StyleMetaBuilder.create();
    const result = builderFn(builder);
    this.properties.style = result.build();
    return this;
  }

  /**
   * Completes the input configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    if (!this.properties.name) {
      throw new Error('Input name is required. Use .name(value) to set it.');
    }
    this.parent.withMeta('InputRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }

  /**
   * Alias for build() method - completes configuration and returns to parent builder
   */
  end(): P {
    if (!this.properties.name) {
      throw new Error('Input name is required. Use .name(value) to set it.');
    }
    this.parent.withMeta('InputRenderer', this.properties);
    return this.parent;
  }
}

/**
 * Builder for FormRenderer components
 */
export class FormRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: FormMeta = {
    fields: [],
    action: ''
  };
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing FormMeta object (static method)
   */
  static fromFormMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: FormMeta, 
    parent: P
  ): FormRendererBuilder<P> {
    const builder = new FormRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete FormMeta object (instance method)
   */
  fromFormMeta(meta: FormMeta): FormRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Set the complete FormMeta object
   */
  fromObject(meta: FormMeta): FormRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Adds a field to the form
   */
  addField(field: FieldMeta): FormRendererBuilder<P> {
    this.properties.fields.push(field);
    return this;
  }

  /**
   * Sets all fields at once
   */
  fields(fields: FieldMeta[]): FormRendererBuilder<P> {
    this.properties.fields = fields;
    return this;
  }

  /**
   * Sets the form action/submit URL
   */
  action(action: string): FormRendererBuilder<P> {
    this.properties.action = action;
    return this;
  }

  /**
   * Sets the form method
   */
  method(method: string): FormRendererBuilder<P> {
    this.properties.method = method;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): FormRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): FormRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Adds event bindings using the EventBindingsBuilder
   */
  withEventBindings(bindings: EventBindings): FormRendererBuilder<P> {
    this.properties.event = bindings;
    return this;
  }

  /**
   * Adds event bindings using a builder function
   */
  eventBindings(builderFn: (builder: EventBindingsBuilder) => EventBindingsBuilder): FormRendererBuilder<P> {
    const builder = EventBindingsBuilder.create();
    const result = builderFn(builder);
    this.properties.event = result.build();
    return this;
  }

  /**
   * Completes the form configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('FormRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for TableRenderer components
 */
export class TableRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: TableMeta = {
    columns: [],
    dataSourceUrl: ''
  };
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing TableMeta object
   */
  static fromTableMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: TableMeta, 
    parent: P
  ): TableRendererBuilder<P> {
    const builder = new TableRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete TableMeta object
   */
  fromObject(meta: TableMeta): TableRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Adds a column to the table
   */
  addColumn(column: ColumnMeta): TableRendererBuilder<P> {
    this.properties.columns.push(column);
    return this;
  }

  /**
   * Sets all columns at once
   */
  columns(columns: ColumnMeta[]): TableRendererBuilder<P> {
    this.properties.columns = columns;
    return this;
  }

  /**
   * Sets the table data
   */
  data(data: any[]): TableRendererBuilder<P> {
    this.properties.data = data;
    return this;
  }

  /**
   * Sets the data source URL for the table
   */
  dataSourceUrl(url: string): TableRendererBuilder<P> {
    this.properties.dataSourceUrl = url;
    return this;
  }

  /**
   * Sets the row key for the table
   */
  rowKey(key: string): TableRendererBuilder<P> {
    this.properties.rowKey = key;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): TableRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): TableRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Completes the table configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('TableRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for ChartRenderer components
 */
export class ChartRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: ChartMeta = {
    charts: []
  };
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing ChartMeta object
   */
  static fromChartMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: ChartMeta, 
    parent: P
  ): ChartRendererBuilder<P> {
    const builder = new ChartRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete ChartMeta object
   */
  fromObject(meta: ChartMeta): ChartRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Adds a chart configuration using ChartConfigBuilder
   */
  addChart(builderFn: (builder: ChartConfigBuilder) => ChartConfigBuilder): ChartRendererBuilder<P> {
    const builder = ChartConfigBuilder.create();
    const result = builderFn(builder);
    this.properties.charts.push(result.build());
    return this;
  }

  /**
   * Returns a ChartConfigBuilder for building chart configurations
   * The built chart will be automatically added to this renderer
   */
  chartBuilder(): ChartConfigBuilderWithParent<P> {
    return new ChartConfigBuilderWithParent(this);
  }

  /**
   * Adds a chart configuration directly
   */
  addChartConfig(config: ChartConfig): ChartRendererBuilder<P> {
    this.properties.charts.push(config);
    return this;
  }

  /**
   * Sets all charts at once
   */
  charts(charts: ChartConfig[]): ChartRendererBuilder<P> {
    this.properties.charts = charts;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): ChartRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): ChartRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Completes the chart configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('ChartRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for ChartConfig objects
 */
export class ChartConfigBuilder {
  private config: Partial<ChartConfig> = {
    labels: [],
    datasets: []
  };

  static create(): ChartConfigBuilder {
    return new ChartConfigBuilder();
  }

  /**
   * Create a builder from an existing ChartConfig object
   */
  static fromChartConfig(config: ChartConfig): ChartConfigBuilder {
    const builder = new ChartConfigBuilder();
    builder.config = { ...config };
    return builder;
  }

  /**
   * Set the complete ChartConfig object
   */
  fromObject(config: ChartConfig): ChartConfigBuilder {
    this.config = { ...config };
    return this;
  }

  /**
   * Sets the chart type (required)
   */
  type(type: 'bar' | 'line' | 'pie' | 'scatter'): ChartConfigBuilder {
    this.config.type = type;
    return this;
  }

  /**
   * Sets the chart title
   */
  title(title: string): ChartConfigBuilder {
    this.config.title = title;
    return this;
  }

  /**
   * Sets the chart labels
   */
  labels(labels: string[]): ChartConfigBuilder {
    this.config.labels = labels;
    return this;
  }

  /**
   * Adds a dataset to the chart
   */
  addDataset(dataset: ChartDataset): ChartConfigBuilder {
    if (!this.config.datasets) {
      this.config.datasets = [];
    }
    this.config.datasets.push(dataset);
    return this;
  }

  /**
   * Sets all datasets at once
   */
  datasets(datasets: ChartDataset[]): ChartConfigBuilder {
    this.config.datasets = datasets;
    return this;
  }

  /**
   * Sets chart options
   */
  options(options: any): ChartConfigBuilder {
    this.config.options = options;
    return this;
  }

  /**
   * Sets chart width
   */
  width(width: number): ChartConfigBuilder {
    (this.config as any).width = width;
    return this;
  }

  /**
   * Sets chart height
   */
  height(height: number): ChartConfigBuilder {
    (this.config as any).height = height;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): ChartConfigBuilder {
    (this.config as any)[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): ChartConfigBuilder {
    Object.assign(this.config, properties);
    return this;
  }

  /**
   * Builds and returns the final ChartConfig
   */
  build(): ChartConfig {
    if (!this.config.type) {
      throw new Error('Chart type is required. Use .type(value) to set it.');
    }
    return { ...this.config } as ChartConfig;
  }
}

/**
 * Builder for ChartConfig objects with parent reference
 * This allows building charts that automatically get added to the parent ChartRenderer
 */
export class ChartConfigBuilderWithParent<P extends BaseComponentDetailBuilder<any, any>> {
  private configBuilder: ChartConfigBuilder;
  private parent: ChartRendererBuilder<P>;

  constructor(parent: ChartRendererBuilder<P>) {
    this.configBuilder = ChartConfigBuilder.create();
    this.parent = parent;
  }

  /**
   * Sets the chart type (required)
   */
  type(type: 'bar' | 'line' | 'pie' | 'scatter'): ChartConfigBuilderWithParent<P> {
    this.configBuilder.type(type);
    return this;
  }

  /**
   * Sets the chart title
   */
  title(title: string): ChartConfigBuilderWithParent<P> {
    this.configBuilder.title(title);
    return this;
  }

  /**
   * Sets the chart labels
   */
  labels(labels: string[]): ChartConfigBuilderWithParent<P> {
    this.configBuilder.labels(labels);
    return this;
  }

  /**
   * Adds a dataset to the chart
   */
  addDataset(dataset: ChartDataset): ChartConfigBuilderWithParent<P> {
    this.configBuilder.addDataset(dataset);
    return this;
  }

  /**
   * Sets all datasets at once
   */
  datasets(datasets: ChartDataset[]): ChartConfigBuilderWithParent<P> {
    this.configBuilder.datasets(datasets);
    return this;
  }

  /**
   * Sets chart options
   */
  options(options: any): ChartConfigBuilderWithParent<P> {
    this.configBuilder.options(options);
    return this;
  }

  /**
   * Sets chart width
   */
  width(width: number): ChartConfigBuilderWithParent<P> {
    this.configBuilder.width(width);
    return this;
  }

  /**
   * Sets chart height
   */
  height(height: number): ChartConfigBuilderWithParent<P> {
    this.configBuilder.height(height);
    return this;
  }

  /**
   * Sets chart dataSourceUrl (specific to ChartRenderer)
   */
  dataSourceUrl(url: string): ChartConfigBuilderWithParent<P> {
    this.configBuilder.property('dataSourceUrl', url);
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): ChartConfigBuilderWithParent<P> {
    this.configBuilder.property(key, value);
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): ChartConfigBuilderWithParent<P> {
    this.configBuilder.setProperties(properties);
    return this;
  }

  /**
   * Builds the chart config and adds it to the parent renderer, then returns the parent
   */
  build(): ChartRendererBuilder<P> {
    const config = this.configBuilder.build(); // This will throw if type is missing
    this.parent.addChartConfig(config);
    return this.parent;
  }
}
export class DetailRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: DetailMeta = {
    fields: [],
    action: ''
  };
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing DetailMeta object
   */
  static fromDetailMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: DetailMeta, 
    parent: P
  ): DetailRendererBuilder<P> {
    const builder = new DetailRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete DetailMeta object
   */
  fromObject(meta: DetailMeta): DetailRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Adds a field to the detail view
   */
  addField(field: DetailFieldMeta): DetailRendererBuilder<P> {
    this.properties.fields.push(field);
    return this;
  }

  /**
   * Sets all fields at once
   */
  fields(fields: DetailFieldMeta[]): DetailRendererBuilder<P> {
    this.properties.fields = fields;
    return this;
  }

  /**
   * Sets the action for the detail view
   */
  action(action: string): DetailRendererBuilder<P> {
    this.properties.action = action;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): DetailRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): DetailRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Completes the detail configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('DetailRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for ConditionalRenderer components
 */
export class ConditionalRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: ConditionalMeta = {
    condition: { field: '', operator: 'eq', value: true },
    trueComponent: {}
  };
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing ConditionalMeta object
   */
  static fromConditionalMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: ConditionalMeta, 
    parent: P
  ): ConditionalRendererBuilder<P> {
    const builder = new ConditionalRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete ConditionalMeta object
   */
  fromObject(meta: ConditionalMeta): ConditionalRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the condition for the conditional renderer
   */
  condition(condition: ConditionalMeta['condition']): ConditionalRendererBuilder<P> {
    this.properties.condition = condition;
    return this;
  }

  /**
   * Sets the component to render when condition is true
   */
  trueComponent(component: LayoutComponentDetail): ConditionalRendererBuilder<P> {
    this.properties.trueComponent = component;
    return this;
  }

  /**
   * Sets the component to render when condition is false
   */
  falseComponent(component: LayoutComponentDetail): ConditionalRendererBuilder<P> {
    this.properties.falseComponent = component;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): ConditionalRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): ConditionalRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Completes the conditional configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('ConditionalRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for PopupRenderer components
 */
export class PopupRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: ComponentMetaMap['PopupRenderer'] = {};
  private parent: P;

  constructor(parent: P) {
    this.parent = parent;
  }

  /**
   * Create a builder from an existing PopupRenderer meta object
   */
  static fromPopupMeta<P extends BaseComponentDetailBuilder<any, any>>(
    meta: ComponentMetaMap['PopupRenderer'], 
    parent: P
  ): PopupRendererBuilder<P> {
    const builder = new PopupRendererBuilder(parent);
    builder.properties = { ...meta };
    return builder;
  }

  /**
   * Set the complete PopupRenderer meta object
   */
  fromObject(meta: ComponentMetaMap['PopupRenderer']): PopupRendererBuilder<P> {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the popup title
   */
  title(title: string): PopupRendererBuilder<P> {
    this.properties.title = title;
    return this;
  }

  /**
   * Sets the popup content
   */
  content(content: LayoutComponentDetail): PopupRendererBuilder<P> {
    this.properties.content = content;
    return this;
  }

  /**
   * Sets whether the popup is visible
   */
  visible(visible: boolean): PopupRendererBuilder<P> {
    this.properties.visible = visible;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): PopupRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): PopupRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Completes the popup configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta('PopupRenderer', this.properties);
    return this.parent.build() as ReturnType<P['build']>;
  }
}

/**
 * Builder for dynamic/custom components
 */
export class DynamicRendererBuilder<P extends BaseComponentDetailBuilder<any, any>> {
  private properties: Record<string, unknown> = {};
  private componentName: string;
  private parent: P;

  constructor(parent: P, componentName: string) {
    this.parent = parent;
    this.componentName = componentName;
  }

  /**
   * Sets the component name (this goes into properties.name, not the component type)
   */
  name(name: string): DynamicRendererBuilder<P> {
    this.properties.name = name;
    return this;
  }

  /**
   * Sets the content/text for the component
   */
  content(content: string): DynamicRendererBuilder<P> {
    this.properties.content = content;
    return this;
  }

  /**
   * Sets the className for styling
   */
  className(className: string): DynamicRendererBuilder<P> {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    (this.properties.style as any).className = className;
    return this;
  }

  /**
   * Sets a custom property
   */
  property(key: string, value: unknown): DynamicRendererBuilder<P> {
    this.properties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(properties: Record<string, unknown>): DynamicRendererBuilder<P> {
    Object.assign(this.properties, properties);
    return this;
  }

  /**
   * Adds event bindings using the EventBindingsBuilder
   */
  withEventBindings(bindings: EventBindings): DynamicRendererBuilder<P> {
    this.properties.event = bindings;
    return this;
  }

  /**
   * Adds event bindings using a builder function
   */
  eventBindings(builderFn: (builder: EventBindingsBuilder) => EventBindingsBuilder): DynamicRendererBuilder<P> {
    const builder = EventBindingsBuilder.create();
    const result = builderFn(builder);
    this.properties.event = result.build();
    return this;
  }

  /**
   * Adds style meta using the StyleMetaBuilder
   */
  withStyleMeta(style: StyleMeta): DynamicRendererBuilder<P> {
    this.properties.style = style;
    return this;
  }

  /**
   * Adds style meta using a builder function
   */
  styleMeta(builderFn: (builder: StyleMetaBuilder) => StyleMetaBuilder): DynamicRendererBuilder<P> {
    const builder = StyleMetaBuilder.create();
    const result = builderFn(builder);
    this.properties.style = result.build();
    return this;
  }

  /**
   * Completes the dynamic component configuration and returns the built component
   */
  build(): ReturnType<P['build']> {
    this.parent.withMeta(this.componentName as keyof ComponentMetaMap, this.properties as any);
    return this.parent.build() as ReturnType<P['build']>;
  }

  /**
   * Alias for build() method - completes configuration and returns to parent builder
   */
  end(): P {
    this.parent.withMeta(this.componentName as keyof ComponentMetaMap, this.properties as any);
    return this.parent;
  }
}