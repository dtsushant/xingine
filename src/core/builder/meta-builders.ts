import { 
  ConditionalMeta,
  WrapperMeta,
  Commissar
} from '../xingine.type';
import { 
  FormMeta, 
  DetailMeta, 
  TableMeta, 
  ChartMeta,
  ChartConfig,
  ChartDataset,
  ColumnMeta
} from '../component/component-meta-map';
import { ButtonMeta, IconMeta, InputMeta } from '../component';
import { StyleMeta } from '../expressions/style';
import { EventBindings } from '../expressions/action';
import { ConditionalExpression } from '../expressions/operators';
import { BaseComponentDetailBuilder } from './base-component-detail-builder';

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

  property(key: string, value: unknown): ButtonMetaBuilder {
    this.meta[key] = value;
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

  fields(fields: FormMeta['fields']): FormMetaBuilder {
    this.meta.fields = fields;
    return this;
  }

  addField(field: FormMeta['fields'][0]): FormMetaBuilder {
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

  dispatch(dispatch: FormMeta['dispatch']): FormMetaBuilder {
    this.meta.dispatch = dispatch;
    return this;
  }

  property(key: string, value: unknown): FormMetaBuilder {
    this.meta[key] = value;
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

  dispatch(dispatch: TableMeta['dispatch']): TableMetaBuilder {
    this.meta.dispatch = dispatch;
    return this;
  }

  property(key: string, value: unknown): TableMetaBuilder {
    this.meta[key] = value;
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

  renderer(renderer: ChartConfig['renderer']): ChartConfigMetaBuilder {
    this.config.renderer = renderer;
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
   * Sets the meta component for this commissar (legacy method for compatibility)
   */
  meta(meta: any): CommissarBuilder {
    this.layoutDetail.meta = meta;
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