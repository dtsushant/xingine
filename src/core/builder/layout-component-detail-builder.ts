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
  ColumnMeta
} from '../component/component-meta-map';
import { ButtonMeta, IconMeta, InputMeta } from '../component';
import { StyleMeta } from '../expressions/style';
import { EventBindings } from '../expressions/action';
import { EventBindingsBuilder, StyleMetaBuilder } from './reusable-builders';

/**
 * Fluent builder for creating LayoutComponentDetail instances
 * Supports recursive and nested component construction
 */
export class LayoutComponentDetailBuilder {
  private layoutDetail: LayoutComponentDetail = {};

  /**
   * Creates a new LayoutComponentDetailBuilder instance
   */
  static create(): LayoutComponentDetailBuilder {
    return new LayoutComponentDetailBuilder();
  }

  /**
   * Create a builder from an existing LayoutComponentDetail object
   */
  static fromLayoutComponentDetail(detail: LayoutComponentDetail): LayoutComponentDetailBuilder {
    const builder = new LayoutComponentDetailBuilder();
    builder.layoutDetail = { ...detail };
    return builder;
  }

  /**
   * Set the complete LayoutComponentDetail object
   */
  fromObject(detail: LayoutComponentDetail): LayoutComponentDetailBuilder {
    this.layoutDetail = { ...detail };
    return this;
  }

  /**
   * Sets the component meta for this layout component
   */
  withMeta<T extends keyof ComponentMetaMap>(
    component: T,
    properties: ComponentMetaMap[T]
  ): LayoutComponentDetailBuilder {
    this.layoutDetail.meta = {
      component,
      properties
    } as ComponentMeta<T>;
    return this;
  }

  /**
   * Creates a WrapperRenderer component
   */
  wrapper(): WrapperRendererBuilder {
    return new WrapperRendererBuilder(this);
  }

  /**
   * Creates a ButtonRenderer component
   */
  button(): ButtonRendererBuilder {
    return new ButtonRendererBuilder(this);
  }

  /**
   * Creates an InputRenderer component
   */
  input(): InputRendererBuilder {
    return new InputRendererBuilder(this);
  }

  /**
   * Creates a FormRenderer component
   */
  form(): FormRendererBuilder {
    return new FormRendererBuilder(this);
  }

  /**
   * Creates a TableRenderer component
   */
  table(): TableRendererBuilder {
    return new TableRendererBuilder(this);
  }

  /**
   * Creates a ChartRenderer component
   */
  chart(): ChartRendererBuilder {
    return new ChartRendererBuilder(this);
  }

  /**
   * Creates a DetailRenderer component
   */
  detailRenderer(): DetailRendererBuilder {
    return new DetailRendererBuilder(this);
  }

  /**
   * Creates a ConditionalRenderer component
   */
  conditional(): ConditionalRendererBuilder {
    return new ConditionalRendererBuilder(this);
  }

  /**
   * Creates a PopupRenderer component
   */
  popup(): PopupRendererBuilder {
    return new PopupRendererBuilder(this);
  }

  /**
   * Creates a dynamic/custom component with user-defined type and properties
   */
  dynamic(componentName: string): DynamicRendererBuilder {
    return new DynamicRendererBuilder(this, componentName);
  }

  /**
   * Builds and returns the final LayoutComponentDetail
   */
  build(): LayoutComponentDetail {
    return { ...this.layoutDetail };
  }
}

/**
 * Builder for WrapperRenderer components
 */
export class WrapperRendererBuilder {
  private properties: WrapperMeta = {};

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Set the complete WrapperMeta object
   */
  fromWrapperMeta(meta: WrapperMeta): WrapperRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the className for styling
   */
  className(className: string): WrapperRendererBuilder {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.className = className;
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): WrapperRendererBuilder {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.style = style;
    return this;
  }

  /**
   * Sets event bindings
   */
  event(event: EventBindings): WrapperRendererBuilder {
    this.properties.event = event;
    return this;
  }

  /**
   * Sets content for the wrapper
   */
  content(content: string): WrapperRendererBuilder {
    this.properties.content = content;
    return this;
  }

  /**
   * Adds a child component
   */
  addChild(child: LayoutComponentDetail): WrapperRendererBuilder {
    if (!this.properties.children) {
      this.properties.children = [];
    }
    this.properties.children.push(child);
    return this;
  }

  /**
   * Adds multiple child components
   */
  addChildren(children: LayoutComponentDetail[]): WrapperRendererBuilder {
    if (!this.properties.children) {
      this.properties.children = [];
    }
    this.properties.children.push(...children);
    return this;
  }

  /**
   * Adds a nested wrapper inside this wrapper
   */
  addWrapper(): WrapperRendererBuilder {
    const nestedBuilder = new WrapperRendererBuilder(this.parent);
    const nestedWrapper = nestedBuilder.build();
    this.addChild(nestedWrapper);
    return nestedBuilder;
  }

  /**
   * Adds a button inside this wrapper
   */
  addButton(): ButtonRendererBuilder {
    return new ButtonRendererBuilder(this.parent, this);
  }

  /**
   * Adds an input inside this wrapper
   */
  addInput(): InputRendererBuilder {
    return new InputRendererBuilder(this.parent, this);
  }

  /**
   * Builds the wrapper component and returns to parent
   */
  build(): LayoutComponentDetail {
    this.parent.withMeta('WrapperRenderer', this.properties);
    return this.parent.build();
  }

  /**
   * Returns to the parent builder
   */
  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta('WrapperRenderer', this.properties);
    return this.parent;
  }
}

/**
 * Builder for ButtonRenderer components
 */
export class ButtonRendererBuilder {
  private properties: ButtonMeta = { name: '' };

  constructor(
    private parent: LayoutComponentDetailBuilder,
    private wrapperParent?: WrapperRendererBuilder
  ) {}

  /**
   * Set the complete ButtonMeta object
   */
  fromButtonMeta(meta: ButtonMeta): ButtonRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the button name
   */
  name(name: string): ButtonRendererBuilder {
    this.properties.name = name;
    return this;
  }

  /**
   * Sets the button content
   */
  content(content: string): ButtonRendererBuilder {
    this.properties.content = content;
    return this;
  }

  /**
   * Sets the button event bindings
   */
  event(event: EventBindings): ButtonRendererBuilder {
    this.properties.event = event;
    return this;
  }

  /**
   * Sets the button className
   */
  className(className: string): ButtonRendererBuilder {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.className = className;
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): ButtonRendererBuilder {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.style = style;
    return this;
  }

  /**
   * Builds the button component
   */
  build(): LayoutComponentDetail {
    const buttonDetail: LayoutComponentDetail = {
      meta: {
        component: 'ButtonRenderer',
        properties: this.properties
      }
    };

    if (this.wrapperParent) {
      this.wrapperParent.addChild(buttonDetail);
      return this.wrapperParent.build();
    }

    this.parent.withMeta('ButtonRenderer', this.properties);
    return this.parent.build();
  }

  /**
   * Returns to the parent builder
   */
  end(): LayoutComponentDetailBuilder | WrapperRendererBuilder {
    const buttonDetail: LayoutComponentDetail = {
      meta: {
        component: 'ButtonRenderer',
        properties: this.properties
      }
    };

    if (this.wrapperParent) {
      this.wrapperParent.addChild(buttonDetail);
      return this.wrapperParent;
    }

    this.parent.withMeta('ButtonRenderer', this.properties);
    return this.parent;
  }
}

/**
 * Builder for InputRenderer components
 */
export class InputRendererBuilder {
  private properties: InputMeta = {} as InputMeta;

  constructor(
    private parent: LayoutComponentDetailBuilder,
    private wrapperParent?: WrapperRendererBuilder
  ) {}

  /**
   * Set the complete InputMeta object
   */
  fromInputMeta(meta: InputMeta): InputRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the input name (required)
   */
  name(name: string): InputRendererBuilder {
    this.properties.name = name;
    return this;
  }

  /**
   * Sets the input placeholder
   */
  placeholder(placeholder: string): InputRendererBuilder {
    this.properties.placeholder = placeholder;
    return this;
  }

  /**
   * Sets the input event bindings
   */
  event(event: EventBindings): InputRendererBuilder {
    this.properties.event = event;
    return this;
  }

  /**
   * Creates an EventBindingsBuilder for this input
   */
  eventBuilder(): EventBindingsBuilder {
    const builder = EventBindingsBuilder.create();
    // Return a wrapped builder that sets the event when built
    return new Proxy(builder, {
      get: (target, prop) => {
        if (prop === 'build') {
          return () => {
            this.properties.event = target.build();
            return this;
          };
        }
        return target[prop as keyof EventBindingsBuilder];
      }
    }) as EventBindingsBuilder;
  }

  /**
   * Sets the input className
   */
  className(className: string): InputRendererBuilder {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.className = className;
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): InputRendererBuilder {
    if (!this.properties.style) {
      this.properties.style = {};
    }
    this.properties.style.style = style;
    return this;
  }

  /**
   * Creates a StyleMetaBuilder for this input
   */
  styleBuilder(): StyleMetaBuilder {
    const builder = StyleMetaBuilder.create();
    // Return a wrapped builder that sets the style when built
    return new Proxy(builder, {
      get: (target, prop) => {
        if (prop === 'build') {
          return () => {
            this.properties.style = target.build();
            return this;
          };
        }
        return target[prop as keyof StyleMetaBuilder];
      }
    }) as StyleMetaBuilder;
  }

  /**
   * Sets the input icon
   */
  icon(icon: IconMeta): InputRendererBuilder {
    this.properties.icon = icon;
    return this;
  }

  /**
   * Builds the input component
   */
  build(): LayoutComponentDetail {
    if (!this.properties.name) {
      throw new Error('Input name is required. Use .name(value) to set it.');
    }

    const inputDetail: LayoutComponentDetail = {
      meta: {
        component: 'InputRenderer',
        properties: this.properties
      }
    };

    if (this.wrapperParent) {
      this.wrapperParent.addChild(inputDetail);
      return this.wrapperParent.build();
    }

    this.parent.withMeta('InputRenderer', this.properties);
    return this.parent.build();
  }

  /**
   * Returns to the parent builder
   */
  end(): LayoutComponentDetailBuilder | WrapperRendererBuilder {
    if (!this.properties.name) {
      throw new Error('Input name is required. Use .name(value) to set it.');
    }

    const inputDetail: LayoutComponentDetail = {
      meta: {
        component: 'InputRenderer',
        properties: this.properties
      }
    };

    if (this.wrapperParent) {
      this.wrapperParent.addChild(inputDetail);
      return this.wrapperParent;
    }

    this.parent.withMeta('InputRenderer', this.properties);
    return this.parent;
  }
}

// Component builders for other components
export class FormRendererBuilder {
  private properties: FormMeta = { fields: [], action: '' };

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Set the complete FormMeta object
   */
  fromFormMeta(meta: FormMeta): FormRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the form action
   */
  action(action: string): FormRendererBuilder {
    this.properties.action = action;
    return this;
  }

  /**
   * Sets the form fields
   */
  fields(fields: FormMeta['fields']): FormRendererBuilder {
    this.properties.fields = fields;
    return this;
  }

  /**
   * Adds a single field
   */
  addField(field: FormMeta['fields'][0]): FormRendererBuilder {
    this.properties.fields.push(field);
    return this;
  }

  /**
   * Sets event bindings
   */
  event(event: EventBindings): FormRendererBuilder {
    this.properties.event = event;
    return this;
  }

  /**
   * Sets dispatch properties
   */
  dispatch(dispatch: FormMeta['dispatch']): FormRendererBuilder {
    this.properties.dispatch = dispatch;
    return this;
  }
  
  build(): LayoutComponentDetail {
    this.parent.withMeta('FormRenderer', this.properties);
    return this.parent.build();
  }

  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta('FormRenderer', this.properties);
    return this.parent;
  }
}

export class TableRendererBuilder {
  private properties: TableMeta = { columns: [], dataSourceUrl: '' };

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Set the complete TableMeta object
   */
  fromTableMeta(meta: TableMeta): TableRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the data source URL
   */
  dataSourceUrl(url: string): TableRendererBuilder {
    this.properties.dataSourceUrl = url;
    return this;
  }

  /**
   * Sets the table columns
   */
  columns(columns: TableMeta['columns']): TableRendererBuilder {
    this.properties.columns = columns;
    return this;
  }

  /**
   * Adds a single column
   */
  addColumn(column: ColumnMeta): TableRendererBuilder {
    this.properties.columns.push(column);
    return this;
  }

  /**
   * Sets the row key
   */
  rowKey(key: string): TableRendererBuilder {
    this.properties.rowKey = key;
    return this;
  }

  /**
   * Sets event bindings
   */
  event(event: EventBindings): TableRendererBuilder {
    this.properties.event = event;
    return this;
  }

  /**
   * Sets dispatch properties
   */
  dispatch(dispatch: TableMeta['dispatch']): TableRendererBuilder {
    this.properties.dispatch = dispatch;
    return this;
  }
  
  build(): LayoutComponentDetail {
    this.parent.withMeta('TableRenderer', this.properties);
    return this.parent.build();
  }

  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta('TableRenderer', this.properties);
    return this.parent;
  }
}

export class ChartRendererBuilder {
  private properties: ChartMeta = { charts: [] };

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Set the complete ChartMeta object
   */
  fromChartMeta(meta: ChartMeta): ChartRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the charts array
   */
  charts(charts: ChartMeta['charts']): ChartRendererBuilder {
    this.properties.charts = charts;
    return this;
  }

  /**
   * Adds a single chart using ChartConfig
   */
  addChart(chartConfig: ChartConfig): ChartRendererBuilder {
    if (!chartConfig.type) {
      throw new Error('Chart type is required');
    }
    this.properties.charts.push(chartConfig);
    return this;
  }

  /**
   * Creates a ChartConfigBuilder for adding charts safely
   */
  chartBuilder(): ChartConfigBuilder {
    return new ChartConfigBuilder(this);
  }

  /**
   * Sets event bindings
   */
  event(event: EventBindings): ChartRendererBuilder {
    this.properties.event = event;
    return this;
  }

  /**
   * Sets renderer configuration
   */
  renderer(renderer: ChartMeta['renderer']): ChartRendererBuilder {
    this.properties.renderer = renderer;
    return this;
  }
  
  build(): LayoutComponentDetail {
    this.parent.withMeta('ChartRenderer', this.properties);
    return this.parent.build();
  }

  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta('ChartRenderer', this.properties);
    return this.parent;
  }
}

/**
 * Builder for ChartConfig to ensure proper chart configuration
 */
export class ChartConfigBuilder {
  private config: ChartConfig = {} as ChartConfig;

  constructor(private chartRenderer: ChartRendererBuilder) {}

  /**
   * Set the complete ChartConfig object
   */
  fromChartConfig(config: ChartConfig): ChartConfigBuilder {
    this.config = { ...config };
    return this;
  }

  /**
   * Sets chart type (required)
   */
  type(type: ChartConfig['type']): ChartConfigBuilder {
    this.config.type = type;
    return this;
  }

  /**
   * Sets chart title
   */
  title(title: string): ChartConfigBuilder {
    this.config.title = title;
    return this;
  }

  /**
   * Sets chart width
   */
  width(width: number): ChartConfigBuilder {
    this.config.width = width;
    return this;
  }

  /**
   * Sets chart height
   */
  height(height: number): ChartConfigBuilder {
    this.config.height = height;
    return this;
  }

  /**
   * Sets chart labels
   */
  labels(labels: string[]): ChartConfigBuilder {
    this.config.labels = labels;
    return this;
  }

  /**
   * Sets chart datasets
   */
  datasets(datasets: ChartConfig['datasets']): ChartConfigBuilder {
    this.config.datasets = datasets;
    return this;
  }

  /**
   * Adds a single dataset
   */
  addDataset(dataset: ChartDataset): ChartConfigBuilder {
    if (!this.config.datasets) {
      this.config.datasets = [];
    }
    this.config.datasets.push(dataset);
    return this;
  }

  /**
   * Sets chart options
   */
  options(options: Record<string, unknown>): ChartConfigBuilder {
    this.config.options = options;
    return this;
  }

  /**
   * Sets data source URL
   */
  dataSourceUrl(url: string): ChartConfigBuilder {
    this.config.dataSourceUrl = url;
    return this;
  }

  /**
   * Sets renderer configuration
   */
  renderer(renderer: ChartConfig['renderer']): ChartConfigBuilder {
    this.config.renderer = renderer;
    return this;
  }

  /**
   * Builds the chart config and adds it to the parent ChartRenderer
   */
  build(): ChartRendererBuilder {
    if (!this.config.type) {
      throw new Error('Chart type is required. Use .type(value) to set it.');
    }
    this.chartRenderer.addChart(this.config);
    return this.chartRenderer;
  }
}

export class DetailRendererBuilder {
  private properties: DetailMeta = { fields: [], action: '' };

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Set the complete DetailMeta object
   */
  fromDetailMeta(meta: DetailMeta): DetailRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the detail action
   */
  action(action: string): DetailRendererBuilder {
    this.properties.action = action;
    return this;
  }

  /**
   * Sets the detail fields
   */
  fields(fields: DetailMeta['fields']): DetailRendererBuilder {
    this.properties.fields = fields;
    return this;
  }

  /**
   * Adds a single field
   */
  addField(field: DetailMeta['fields'][0]): DetailRendererBuilder {
    this.properties.fields.push(field);
    return this;
  }

  /**
   * Sets event bindings
   */
  event(event: EventBindings): DetailRendererBuilder {
    this.properties.event = event;
    return this;
  }

  /**
   * Sets dispatch properties
   */
  dispatch(dispatch: DetailMeta['dispatch']): DetailRendererBuilder {
    this.properties.dispatch = dispatch;
    return this;
  }
  
  build(): LayoutComponentDetail {
    this.parent.withMeta('DetailRenderer', this.properties);
    return this.parent.build();
  }

  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta('DetailRenderer', this.properties);
    return this.parent;
  }
}

export class ConditionalRendererBuilder {
  private properties: ConditionalMeta = {
    condition: { field: '', operator: 'eq', value: true },
    trueComponent: {}
  };

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Set the complete ConditionalMeta object
   */
  fromConditionalMeta(meta: ConditionalMeta): ConditionalRendererBuilder {
    this.properties = { ...meta };
    return this;
  }

  /**
   * Sets the condition
   */
  condition(condition: ConditionalMeta['condition']): ConditionalRendererBuilder {
    this.properties.condition = condition;
    return this;
  }

  /**
   * Sets the true component
   */
  trueComponent(component: LayoutComponentDetail): ConditionalRendererBuilder {
    this.properties.trueComponent = component;
    return this;
  }

  /**
   * Sets the false component
   */
  falseComponent(component: LayoutComponentDetail): ConditionalRendererBuilder {
    this.properties.falseComponent = component;
    return this;
  }
  
  build(): LayoutComponentDetail {
    this.parent.withMeta('ConditionalRenderer', this.properties);
    return this.parent.build();
  }

  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta('ConditionalRenderer', this.properties);
    return this.parent;
  }
}

export class PopupRendererBuilder {
  private popupProperties: ComponentMetaMap['PopupRenderer'] = {};

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Set the complete popup properties object
   */
  fromPopupMeta(meta: Record<string, unknown>): PopupRendererBuilder {
    this.popupProperties = { ...meta };
    return this;
  }

  /**
   * Sets a property on the popup
   */
  property(key: string, value: unknown): PopupRendererBuilder {
    this.popupProperties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties
   */
  setProperties(props: Record<string, unknown>): PopupRendererBuilder {
    Object.assign(this.popupProperties, props);
    return this;
  }
  
  build(): LayoutComponentDetail {
    this.parent.withMeta('PopupRenderer', this.popupProperties);
    return this.parent.build();
  }

  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta('PopupRenderer', this.popupProperties);
    return this.parent;
  }
}

/**
 * Builder for Dynamic/Custom Renderer components
 * Allows users to create components with custom names and properties
 */
export class DynamicRendererBuilder {
  private componentProperties: Record<string, unknown> = {};

  constructor(
    private parent: LayoutComponentDetailBuilder,
    private componentName: string
  ) {}

  /**
   * Sets a property value for the dynamic component
   */
  property(key: string, value: unknown): DynamicRendererBuilder {
    this.componentProperties[key] = value;
    return this;
  }

  /**
   * Sets multiple properties at once
   */
  setProperties(props: Record<string, unknown>): DynamicRendererBuilder {
    Object.assign(this.componentProperties, props);
    return this;
  }

  /**
   * Sets the name property (commonly used)
   */
  name(name: string): DynamicRendererBuilder {
    this.componentProperties.name = name;
    return this;
  }

  /**
   * Sets the content property (commonly used)
   */
  content(content: unknown): DynamicRendererBuilder {
    this.componentProperties.content = content;
    return this;
  }

  /**
   * Sets the className for styling
   */
  className(className: string): DynamicRendererBuilder {
    if (!this.componentProperties.style) {
      this.componentProperties.style = {};
    }
    (this.componentProperties.style as any).className = className;
    return this;
  }

  /**
   * Sets event bindings for the dynamic component
   */
  withEventBindings(eventBindings: EventBindings): DynamicRendererBuilder {
    this.componentProperties.event = eventBindings;
    return this;
  }

  /**
   * Creates event bindings using the fluent builder
   */
  eventBuilder(): EventBindingsBuilder {
    const builder = EventBindingsBuilder.create();
    // We'll need to manually apply the result when calling build
    return builder;
  }

  /**
   * Sets style properties for the dynamic component
   */
  withStyleMeta(styleMeta: StyleMeta): DynamicRendererBuilder {
    this.componentProperties.style = styleMeta;
    return this;
  }

  /**
   * Creates style properties using the fluent builder
   */
  styleBuilder(): StyleMetaBuilder {
    const builder = StyleMetaBuilder.create();
    // We'll need to manually apply the result when calling build
    return builder;
  }

  /**
   * Builds the dynamic component and returns to parent
   */
  build(): LayoutComponentDetail {
    this.parent.withMeta(this.componentName as any, this.componentProperties);
    return this.parent.build();
  }

  /**
   * Returns to the parent builder
   */
  end(): LayoutComponentDetailBuilder {
    this.parent.withMeta(this.componentName as any, this.componentProperties);
    return this.parent;
  }
}