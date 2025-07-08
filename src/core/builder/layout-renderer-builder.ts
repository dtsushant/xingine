import { LayoutRenderer, LayoutComponentDetail } from '../xingine.type';
import { StyleMeta } from '../expressions/style';
import { LayoutComponentDetailBuilder } from './layout-component-detail-builder';

/**
 * Fluent builder for creating LayoutRenderer instances
 * Supports building complete layout structures with header, content, sider, and footer
 */
export class LayoutRendererBuilder {
  private layout: LayoutRenderer = {
    type: 'default',
    content: {
      meta: {}
    }
  };

  /**
   * Creates a new LayoutRendererBuilder instance
   */
  static create(): LayoutRendererBuilder {
    return new LayoutRendererBuilder();
  }

  /**
   * Sets the layout type
   */
  type(type: string): LayoutRendererBuilder {
    this.layout.type = type;
    return this;
  }

  /**
   * Sets the root layout style
   */
  style(style: StyleMeta): LayoutRendererBuilder {
    this.layout.style = style;
    return this;
  }

  /**
   * Sets the root layout className
   */
  className(className: string): LayoutRendererBuilder {
    if (!this.layout.style) {
      this.layout.style = {};
    }
    this.layout.style.className = className;
    return this;
  }

  /**
   * Sets inline styles for the root layout
   */
  inlineStyle(style: Record<string, unknown>): LayoutRendererBuilder {
    if (!this.layout.style) {
      this.layout.style = {};
    }
    this.layout.style.style = style;
    return this;
  }

  /**
   * Configures the header section
   */
  header(): LayoutSectionBuilder {
    return new LayoutSectionBuilder(this, 'header');
  }

  /**
   * Configures the content section
   */
  content(): LayoutSectionBuilder {
    return new LayoutSectionBuilder(this, 'content');
  }

  /**
   * Configures the sider section
   */
  sider(): LayoutSectionBuilder {
    return new LayoutSectionBuilder(this, 'sider');
  }

  /**
   * Configures the footer section
   */
  footer(): LayoutSectionBuilder {
    return new LayoutSectionBuilder(this, 'footer');
  }

  /**
   * Sets the header section with pre-built component
   */
  withHeader(meta: LayoutComponentDetail, style?: StyleMeta): LayoutRendererBuilder {
    this.layout.header = {
      meta,
      style
    };
    return this;
  }

  /**
   * Sets the content section with pre-built component
   */
  withContent(meta: LayoutComponentDetail, style?: StyleMeta): LayoutRendererBuilder {
    this.layout.content = {
      meta,
      style
    };
    return this;
  }

  /**
   * Sets the sider section with pre-built component
   */
  withSider(meta: LayoutComponentDetail, style?: StyleMeta): LayoutRendererBuilder {
    this.layout.sider = {
      meta,
      style
    };
    return this;
  }

  /**
   * Sets the footer section with pre-built component
   */
  withFooter(meta: LayoutComponentDetail, style?: StyleMeta): LayoutRendererBuilder {
    this.layout.footer = {
      meta,
      style
    };
    return this;
  }

  /**
   * Internal method to set a section
   */
  setSection(section: 'header' | 'content' | 'sider' | 'footer', meta: LayoutComponentDetail, style?: StyleMeta): LayoutRendererBuilder {
    if (section === 'content') {
      this.layout.content = { meta, style };
    } else {
      this.layout[section] = { meta, style };
    }
    return this;
  }

  /**
   * Builds and returns the final LayoutRenderer
   */
  build(): LayoutRenderer {
    return { ...this.layout };
  }
}

/**
 * Builder for individual layout sections (header, content, sider, footer)
 */
export class LayoutSectionBuilder {
  private sectionStyle?: StyleMeta;
  private componentBuilder: LayoutComponentDetailBuilder;

  constructor(
    private parent: LayoutRendererBuilder,
    private section: 'header' | 'content' | 'sider' | 'footer'
  ) {
    this.componentBuilder = LayoutComponentDetailBuilder.create();
  }

  /**
   * Sets the section style
   */
  setStyle(style: StyleMeta): LayoutSectionBuilder {
    this.sectionStyle = style;
    return this;
  }

  /**
   * Sets the section className
   */
  className(className: string): LayoutSectionBuilder {
    if (!this.sectionStyle) {
      this.sectionStyle = {};
    }
    this.sectionStyle.className = className;
    return this;
  }

  /**
   * Sets inline styles for the section
   */
  inlineStyle(style: Record<string, unknown>): LayoutSectionBuilder {
    if (!this.sectionStyle) {
      this.sectionStyle = {};
    }
    this.sectionStyle.style = style;
    return this;
  }

  /**
   * Creates a wrapper component for this section
   */
  wrapper(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'wrapper');
  }

  /**
   * Creates a button component for this section
   */
  button(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'button');
  }

  /**
   * Creates an input component for this section
   */
  input(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'input');
  }

  /**
   * Creates a form component for this section
   */
  form(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'form');
  }

  /**
   * Creates a table component for this section
   */
  table(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'table');
  }

  /**
   * Creates a chart component for this section
   */
  chart(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'chart');
  }

  /**
   * Sets the component using a pre-built LayoutComponentDetail
   */
  withComponent(meta: LayoutComponentDetail): LayoutRendererBuilder {
    this.parent.setSection(this.section, meta, this.sectionStyle);
    return this.parent;
  }

  /**
   * Builds and returns to parent
   */
  build(): LayoutRendererBuilder {
    const meta = this.componentBuilder.build();
    this.parent.setSection(this.section, meta, this.sectionStyle);
    return this.parent;
  }
}

/**
 * Generic builder for components within layout sections
 * This replaces the duplicate LayoutSectionWrapperBuilder, LayoutSectionButtonBuilder, etc.
 */
export class LayoutSectionComponentBuilder {
  private componentBuilder: LayoutComponentDetailBuilder;
  private currentBuilder: any;

  constructor(
    private parent: LayoutRendererBuilder,
    private section: 'header' | 'content' | 'sider' | 'footer',
    private sectionStyle?: StyleMeta,
    private componentType: 'wrapper' | 'button' | 'input' | 'form' | 'table' | 'chart' = 'wrapper'
  ) {
    this.componentBuilder = LayoutComponentDetailBuilder.create();
    this.currentBuilder = this.getComponentBuilder();
  }

  /**
   * Gets the appropriate component builder based on type
   */
  private getComponentBuilder() {
    switch (this.componentType) {
      case 'wrapper':
        return this.componentBuilder.wrapper();
      case 'button':
        return this.componentBuilder.button();
      case 'input':
        return this.componentBuilder.input();
      case 'form':
        return this.componentBuilder.form();
      case 'table':
        return this.componentBuilder.table();
      case 'chart':
        return this.componentBuilder.chart();
      default:
        return this.componentBuilder.wrapper();
    }
  }

  /**
   * Provides access to the underlying component builder
   */
  get component() {
    return this.currentBuilder;
  }

  /**
   * Forward method calls to the underlying component builder
   */
  private forwardToBuilder(methodName: string, ...args: any[]) {
    if (this.currentBuilder[methodName]) {
      this.currentBuilder[methodName](...args);
    }
    return this;
  }

  // Common methods that work across all component types
  className(className: string): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('className', className);
  }

  style(style: Record<string, unknown>): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('style', style);
  }

  // Wrapper-specific methods
  content(content: string): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('content', content);
  }

  addChild(child: LayoutComponentDetail): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('addChild', child);
  }

  addChildren(children: LayoutComponentDetail[]): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('addChildren', children);
  }

  // Button-specific methods
  name(name: string): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('name', name);
  }

  // Input-specific methods
  placeholder(placeholder: string): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('placeholder', placeholder);
  }

  icon(icon: any): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('icon', icon);
  }

  // Form-specific methods
  action(action: string): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('action', action);
  }

  fields(fields: any[]): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('fields', fields);
  }

  addField(field: any): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('addField', field);
  }

  // Table-specific methods
  columns(columns: any[]): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('columns', columns);
  }

  addColumn(column: any): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('addColumn', column);
  }

  dataSourceUrl(url: string): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('dataSourceUrl', url);
  }

  // Chart-specific methods
  charts(charts: any[]): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('charts', charts);
  }

  addChart(chart: any): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('addChart', chart);
  }

  chartBuilder(): any {
    return this.currentBuilder.chartBuilder ? this.currentBuilder.chartBuilder() : null;
  }

  // Common methods
  event(event: any): LayoutSectionComponentBuilder {
    return this.forwardToBuilder('event', event);
  }

  /**
   * Builds and returns to parent
   */
  build(): LayoutRendererBuilder {
    const meta = this.currentBuilder.build();
    this.parent.setSection(this.section, meta, this.sectionStyle);
    return this.parent;
  }
}