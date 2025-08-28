import { LayoutRenderer, LayoutComponentDetail, Commissar } from '../xingine.type';
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
      meta: []
    }
  };

  /**
   * Get access to the layout (for internal use by section builders)
   */
  get _layout(): LayoutRenderer {
    return this.layout;
  }

  /**
   * Creates a new LayoutRendererBuilder instance
   */
  static create(): LayoutRendererBuilder {
    return new LayoutRendererBuilder();
  }

  /**
   * Create a builder from an existing LayoutRenderer object
   */
  static fromLayoutRenderer(renderer: LayoutRenderer): LayoutRendererBuilder {
    const builder = new LayoutRendererBuilder();
    builder.layout = { ...renderer };
    return builder;
  }

  /**
   * Set the complete LayoutRenderer object
   */
  fromObject(renderer: LayoutRenderer): LayoutRendererBuilder {
    this.layout = { ...renderer };
    return this;
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
   * Sets the content section with pre-built component array
   */
  withContent(meta: Commissar[], style?: StyleMeta): LayoutRendererBuilder {
    // Validate that all Commissar objects have paths
    meta.forEach(commissar => {
      if (!commissar.path) {
        throw new Error('Content section requires all Commissar objects to have a path property.');
      }
    });
    
    this.layout.content = {
      meta,
      style
    };
    return this;
  }

  /**
   * Adds a single Commissar to the content section
   */
  addContentCommissar(commissar: Commissar): LayoutRendererBuilder {
    if (!commissar.path) {
      throw new Error('Commissar must have a path property');
    }
    if (!this.layout.content.meta) {
      this.layout.content.meta = [];
    }
    this.layout.content.meta.push(commissar);
    return this;
  }

  /**
   * Sets the content section style
   */
  contentStyle(style: StyleMeta): LayoutRendererBuilder {
    if (!this.layout.content) {
      this.layout.content = { meta: [] };
    }
    if (!this.layout.content.style) {
      this.layout.content.style = {};
    }
    Object.assign(this.layout.content.style, style);
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
  setSection(section: 'header' | 'content' | 'sider' | 'footer', meta: LayoutComponentDetail | Commissar | Commissar[], style?: StyleMeta): LayoutRendererBuilder {
    if (section === 'content') {
      // For content, we need to ensure it's a Commissar array with path
      if (Array.isArray(meta)) {
        // Handle array of Commissar objects
        const commissarArray = meta as Commissar[];
        commissarArray.forEach(commissar => {
          if (!commissar.path) {
            throw new Error('Content section requires all Commissar objects to have a path property.');
          }
        });
        this.layout.content = { meta: commissarArray, style };
      } else {
        // Handle single Commissar object (convert to array)
        const commissarMeta = meta as Commissar;
        if (!commissarMeta.path) {
          throw new Error('Content section requires a path property. Use a Commissar object with path.');
        }
        this.layout.content = { meta: [commissarMeta], style };
      }
    } else {
      this.layout[section] = { meta: meta as LayoutComponentDetail, style };
    }
    return this;
  }

  /**
   * Builds and returns the final LayoutRenderer
   */
  build(): LayoutRenderer {
    return { ...this.layout };
  }

  // ========================================
  // UI Builder Support Methods
  // ========================================

  /**
   * Check if a section can be added (for UI constraint checking)
   * @param sectionType The section type to check
   * @returns true if the section can be added, false if it already exists
   */
  canAddSection(sectionType: 'header' | 'sider' | 'footer' | 'content'): boolean {
    switch (sectionType) {
      case 'header':
        return !this.layout.header;
      case 'sider':
        return !this.layout.sider;
      case 'footer':
        return !this.layout.footer;
      case 'content':
        return true; // Content can always be added (multiple allowed)
      default:
        return false;
    }
  }

  /**
   * Check if a specific section exists
   * @param sectionType The section type to check
   * @returns true if the section exists
   */
  hasSection(sectionType: 'header' | 'sider' | 'footer' | 'content'): boolean {
    switch (sectionType) {
      case 'header':
        return !!this.layout.header;
      case 'sider':
        return !!this.layout.sider;
      case 'footer':
        return !!this.layout.footer;
      case 'content':
        return this.layout.content.meta.length > 0;
      default:
        return false;
    }
  }

  /**
   * Get available section types that can be added (for UI dropdown)
   * @returns Array of section types that can be added
   */
  getAvailableChildTypes(): ('header' | 'sider' | 'footer' | 'content')[] {
    const availableTypes: ('header' | 'sider' | 'footer' | 'content')[] = [];

    if (this.canAddSection('header')) {
      availableTypes.push('header');
    }

    // Content can always be added (multiple allowed)
    availableTypes.push('content');

    if (this.canAddSection('sider')) {
      availableTypes.push('sider');
    }

    if (this.canAddSection('footer')) {
      availableTypes.push('footer');
    }

    return availableTypes;
  }

  /**
   * Get the count of content items
   * @returns Number of content items
   */
  getContentCount(): number {
    return this.layout.content.meta.length;
  }

  /**
   * Get all active sections
   * @returns Array of section types that have content
   */
  getActiveSections(): ('header' | 'sider' | 'footer' | 'content')[] {
    const sections: ('header' | 'sider' | 'footer' | 'content')[] = [];

    if (this.hasSection('header')) sections.push('header');
    if (this.hasSection('content')) sections.push('content');
    if (this.hasSection('sider')) sections.push('sider');
    if (this.hasSection('footer')) sections.push('footer');

    return sections;
  }

  /**
   * Remove a section (for UI operations)
   * @param sectionType The section type to remove
   * @param contentIndex Optional index for content items
   */
  removeSection(sectionType: 'header' | 'sider' | 'footer' | 'content', contentIndex?: number): LayoutRendererBuilder {
    switch (sectionType) {
      case 'header':
        delete this.layout.header;
        break;
      case 'sider':
        delete this.layout.sider;
        break;
      case 'footer':
        delete this.layout.footer;
        break;
      case 'content':
        if (typeof contentIndex === 'number' && this.layout.content.meta[contentIndex]) {
          this.layout.content.meta.splice(contentIndex, 1);
        }
        break;
    }
    return this;
  }

  /**
   * Get layout constraint information for UI builders
   * @returns Object containing constraint information
   */
  getConstraints() {
    return {
      singleSections: ['header', 'sider', 'footer'], // Only one allowed
      multipleSections: ['content'], // Multiple allowed
      maxSections: {
        header: 1,
        sider: 1,
        footer: 1,
        content: Infinity
      },
      currentCounts: {
        header: this.hasSection('header') ? 1 : 0,
        sider: this.hasSection('sider') ? 1 : 0,
        footer: this.hasSection('footer') ? 1 : 0,
        content: this.getContentCount()
      }
    };
  }
}

/**
 * Builder for individual layout sections (header, content, sider, footer)
 */
export class LayoutSectionBuilder {
  private sectionStyle?: StyleMeta;
  private componentBuilder: LayoutComponentDetailBuilder;
  private pathValue?: string;
  private permissionValue?: string[];

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
   * Sets the path for content section (required for Commissar)
   */
  path(path: string): LayoutSectionBuilder {
    this.pathValue = path;
    return this;
  }

  /**
   * Sets the permissions for content section (optional for Commissar)
   */
  permission(permission: string[]): LayoutSectionBuilder {
    this.permissionValue = permission;
    return this;
  }

  /**
   * Creates a wrapper component for this section
   */
  wrapper(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'wrapper', this.pathValue, this.permissionValue);
  }

  /**
   * Creates a button component for this section
   */
  button(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'button', this.pathValue, this.permissionValue);
  }

  /**
   * Creates an input component for this section
   */
  input(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'input', this.pathValue, this.permissionValue);
  }

  /**
   * Creates a form component for this section
   */
  form(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'form', this.pathValue, this.permissionValue);
  }

  /**
   * Creates a table component for this section
   */
  table(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'table', this.pathValue, this.permissionValue);
  }

  /**
   * Creates a chart component for this section
   */
  chart(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'chart', this.pathValue, this.permissionValue);
  }

  /**
   * Creates a slider component for this section
   */
  slider(): LayoutSectionComponentBuilder {
    return new LayoutSectionComponentBuilder(this.parent, this.section, this.sectionStyle, 'slider', this.pathValue, this.permissionValue);
  }

  /**
   * Sets the component using a pre-built LayoutComponentDetail
   */
  withComponent(meta: LayoutComponentDetail): LayoutRendererBuilder {
    if (this.section === 'content') {
      // For content section, ensure it has path property (convert to Commissar)
      const commissarMeta: Commissar = {
        ...meta,
        path: (meta as any).path || this.pathValue || '/default-path',
        ...(this.permissionValue && { permission: this.permissionValue })
      };
      // Add to the array instead of replacing
      if (!this.parent._layout.content.meta) {
        this.parent._layout.content.meta = [];
      }
      this.parent._layout.content.meta.push(commissarMeta);
      if (this.sectionStyle) {
        this.parent._layout.content.style = this.sectionStyle;
      }
    } else {
      this.parent.setSection(this.section, meta, this.sectionStyle);
    }
    return this.parent;
  }

  /**
   * Builds and returns to parent
   */
  build(): LayoutRendererBuilder {
    const meta = this.componentBuilder.build();
    
    if (this.section === 'content') {
      // For content section, create Commissar object and add to array
      const commissarMeta: Commissar = {
        ...meta,
        path: this.pathValue || '/default-path',
        ...(this.permissionValue && { permission: this.permissionValue })
      };
      
      // Add to the array instead of replacing
      if (!this.parent._layout.content.meta) {
        this.parent._layout.content.meta = [];
      }
      this.parent._layout.content.meta.push(commissarMeta);
      
      if (this.sectionStyle) {
        this.parent._layout.content.style = this.sectionStyle;
      }
    } else {
      this.parent.setSection(this.section, meta, this.sectionStyle);
    }
    
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
  private pathValue?: string;
  private permissionValue?: string[];

  constructor(
    private parent: LayoutRendererBuilder,
    private section: 'header' | 'content' | 'sider' | 'footer',
    private sectionStyle?: StyleMeta,
    private componentType: 'wrapper' | 'button' | 'input' | 'form' | 'table' | 'chart' | 'slider' = 'wrapper',
    pathValue?: string,
    permissionValue?: string[]
  ) {
    this.componentBuilder = LayoutComponentDetailBuilder.create();
    this.currentBuilder = this.getComponentBuilder();
    this.pathValue = pathValue;
    this.permissionValue = permissionValue;
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
      case 'slider':
        return this.componentBuilder.slider();
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
   * Sets the path for content section (required for Commissar)
   */
  path(path: string): LayoutSectionComponentBuilder {
    this.pathValue = path;
    return this;
  }

  /**
   * Sets the permissions for content section (optional for Commissar)
   */
  permission(permission: string[]): LayoutSectionComponentBuilder {
    this.permissionValue = permission;
    return this;
  }

  /**
   * Builds and returns to parent
   */
  build(): LayoutRendererBuilder {
    const meta = this.currentBuilder.build();
    
    if (this.section === 'content') {
      // For content section, create Commissar object and add to array
      const commissarMeta: Commissar = {
        ...meta,
        path: this.pathValue || '/default-path',
        ...(this.permissionValue && { permission: this.permissionValue })
      };
      
      // Add to the array instead of replacing
      if (!this.parent._layout.content.meta) {
        this.parent._layout.content.meta = [];
      }
      this.parent._layout.content.meta.push(commissarMeta);
      
      if (this.sectionStyle) {
        this.parent._layout.content.style = this.sectionStyle;
      }
    } else {
      this.parent.setSection(this.section, meta, this.sectionStyle);
    }
    
    return this.parent;
  }
}