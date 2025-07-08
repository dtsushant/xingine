import { 
  LayoutComponentDetail, 
  ComponentMeta, 
  ComponentMetaMap,
  WrapperMeta
} from '../xingine.type';
import { ChartDataset } from '../component/component-meta-map';
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
  private properties: ComponentMetaMap['ButtonRenderer'] = { name: '' };

  constructor(
    private parent: LayoutComponentDetailBuilder,
    private wrapperParent?: WrapperRendererBuilder
  ) {}

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
  private properties: ComponentMetaMap['InputRenderer'] = {} as ComponentMetaMap['InputRenderer'];

  constructor(
    private parent: LayoutComponentDetailBuilder,
    private wrapperParent?: WrapperRendererBuilder
  ) {}

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
  icon(icon: ComponentMetaMap['InputRenderer']['icon']): InputRendererBuilder {
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
  private properties: ComponentMetaMap['FormRenderer'] = { fields: [], action: '' };

  constructor(private parent: LayoutComponentDetailBuilder) {}

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
  fields(fields: ComponentMetaMap['FormRenderer']['fields']): FormRendererBuilder {
    this.properties.fields = fields;
    return this;
  }

  /**
   * Adds a single field
   */
  addField(field: ComponentMetaMap['FormRenderer']['fields'][0]): FormRendererBuilder {
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
  dispatch(dispatch: ComponentMetaMap['FormRenderer']['dispatch']): FormRendererBuilder {
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
  private properties: ComponentMetaMap['TableRenderer'] = { columns: [], dataSourceUrl: '' };

  constructor(private parent: LayoutComponentDetailBuilder) {}

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
  columns(columns: ComponentMetaMap['TableRenderer']['columns']): TableRendererBuilder {
    this.properties.columns = columns;
    return this;
  }

  /**
   * Adds a single column
   */
  addColumn(column: ComponentMetaMap['TableRenderer']['columns'][0]): TableRendererBuilder {
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
  dispatch(dispatch: ComponentMetaMap['TableRenderer']['dispatch']): TableRendererBuilder {
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
  private properties: ComponentMetaMap['ChartRenderer'] = { charts: [] };

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Sets the charts array
   */
  charts(charts: ComponentMetaMap['ChartRenderer']['charts']): ChartRendererBuilder {
    this.properties.charts = charts;
    return this;
  }

  /**
   * Adds a single chart using ChartConfig
   */
  addChart(chartConfig: ComponentMetaMap['ChartRenderer']['charts'][0]): ChartRendererBuilder {
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
  renderer(renderer: ComponentMetaMap['ChartRenderer']['renderer']): ChartRendererBuilder {
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
  private config: ComponentMetaMap['ChartRenderer']['charts'][0] = {} as ComponentMetaMap['ChartRenderer']['charts'][0];

  constructor(private chartRenderer: ChartRendererBuilder) {}

  /**
   * Sets chart type (required)
   */
  type(type: ComponentMetaMap['ChartRenderer']['charts'][0]['type']): ChartConfigBuilder {
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
  datasets(datasets: ComponentMetaMap['ChartRenderer']['charts'][0]['datasets']): ChartConfigBuilder {
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
  renderer(renderer: ComponentMetaMap['ChartRenderer']['charts'][0]['renderer']): ChartConfigBuilder {
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
  private properties: ComponentMetaMap['DetailRenderer'] = { fields: [], action: '' };

  constructor(private parent: LayoutComponentDetailBuilder) {}

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
  fields(fields: ComponentMetaMap['DetailRenderer']['fields']): DetailRendererBuilder {
    this.properties.fields = fields;
    return this;
  }

  /**
   * Adds a single field
   */
  addField(field: ComponentMetaMap['DetailRenderer']['fields'][0]): DetailRendererBuilder {
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
  dispatch(dispatch: ComponentMetaMap['DetailRenderer']['dispatch']): DetailRendererBuilder {
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
  private properties: ComponentMetaMap['ConditionalRenderer'] = {
    condition: { field: '', operator: 'eq', value: true },
    trueComponent: {}
  };

  constructor(private parent: LayoutComponentDetailBuilder) {}

  /**
   * Sets the condition
   */
  condition(condition: ComponentMetaMap['ConditionalRenderer']['condition']): ConditionalRendererBuilder {
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