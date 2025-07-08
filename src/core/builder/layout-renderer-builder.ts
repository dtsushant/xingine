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
  wrapper(): LayoutSectionWrapperBuilder {
    return new LayoutSectionWrapperBuilder(this.parent, this.section, this.sectionStyle);
  }

  /**
   * Creates a button component for this section
   */
  button(): LayoutSectionButtonBuilder {
    return new LayoutSectionButtonBuilder(this.parent, this.section, this.sectionStyle);
  }

  /**
   * Creates an input component for this section
   */
  input(): LayoutSectionInputBuilder {
    return new LayoutSectionInputBuilder(this.parent, this.section, this.sectionStyle);
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
 * Builder for wrapper components within layout sections
 */
export class LayoutSectionWrapperBuilder {
  private componentBuilder: LayoutComponentDetailBuilder;

  constructor(
    private parent: LayoutRendererBuilder,
    private section: 'header' | 'content' | 'sider' | 'footer',
    private sectionStyle?: StyleMeta
  ) {
    this.componentBuilder = LayoutComponentDetailBuilder.create();
  }

  /**
   * Gets the wrapper builder
   */
  getWrapper() {
    return this.componentBuilder.wrapper();
  }

  /**
   * Sets the wrapper className
   */
  className(className: string): LayoutSectionWrapperBuilder {
    this.getWrapper().className(className);
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): LayoutSectionWrapperBuilder {
    this.getWrapper().style(style);
    return this;
  }

  /**
   * Sets content
   */
  content(content: string): LayoutSectionWrapperBuilder {
    this.getWrapper().content(content);
    return this;
  }

  /**
   * Adds a child component
   */
  addChild(child: LayoutComponentDetail): LayoutSectionWrapperBuilder {
    this.getWrapper().addChild(child);
    return this;
  }

  /**
   * Adds multiple children
   */
  addChildren(children: LayoutComponentDetail[]): LayoutSectionWrapperBuilder {
    this.getWrapper().addChildren(children);
    return this;
  }

  /**
   * Adds a nested wrapper
   */
  addWrapper() {
    return this.getWrapper().addWrapper();
  }

  /**
   * Adds a button
   */
  addButton() {
    return this.getWrapper().addButton();
  }

  /**
   * Adds an input
   */
  addInput() {
    return this.getWrapper().addInput();
  }

  /**
   * Builds and returns to parent
   */
  build(): LayoutRendererBuilder {
    const meta = this.getWrapper().build();
    this.parent.setSection(this.section, meta, this.sectionStyle);
    return this.parent;
  }
}

/**
 * Builder for button components within layout sections
 */
export class LayoutSectionButtonBuilder {
  private componentBuilder: LayoutComponentDetailBuilder;

  constructor(
    private parent: LayoutRendererBuilder,
    private section: 'header' | 'content' | 'sider' | 'footer',
    private sectionStyle?: StyleMeta
  ) {
    this.componentBuilder = LayoutComponentDetailBuilder.create();
  }

  /**
   * Gets the button builder
   */
  getButton() {
    return this.componentBuilder.button();
  }

  /**
   * Sets the button name
   */
  name(name: string): LayoutSectionButtonBuilder {
    this.getButton().name(name);
    return this;
  }

  /**
   * Sets the button content
   */
  content(content: string): LayoutSectionButtonBuilder {
    this.getButton().content(content);
    return this;
  }

  /**
   * Sets the button className
   */
  className(className: string): LayoutSectionButtonBuilder {
    this.getButton().className(className);
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): LayoutSectionButtonBuilder {
    this.getButton().style(style);
    return this;
  }

  /**
   * Builds and returns to parent
   */
  build(): LayoutRendererBuilder {
    const meta = this.getButton().build();
    this.parent.setSection(this.section, meta, this.sectionStyle);
    return this.parent;
  }
}

/**
 * Builder for input components within layout sections
 */
export class LayoutSectionInputBuilder {
  private componentBuilder: LayoutComponentDetailBuilder;

  constructor(
    private parent: LayoutRendererBuilder,
    private section: 'header' | 'content' | 'sider' | 'footer',
    private sectionStyle?: StyleMeta
  ) {
    this.componentBuilder = LayoutComponentDetailBuilder.create();
  }

  /**
   * Gets the input builder
   */
  getInput() {
    return this.componentBuilder.input();
  }

  /**
   * Sets the input name
   */
  name(name: string): LayoutSectionInputBuilder {
    this.getInput().name(name);
    return this;
  }

  /**
   * Sets the input placeholder
   */
  placeholder(placeholder: string): LayoutSectionInputBuilder {
    this.getInput().placeholder(placeholder);
    return this;
  }

  /**
   * Sets the input className
   */
  className(className: string): LayoutSectionInputBuilder {
    this.getInput().className(className);
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): LayoutSectionInputBuilder {
    this.getInput().style(style);
    return this;
  }

  /**
   * Builds and returns to parent
   */
  build(): LayoutRendererBuilder {
    const meta = this.getInput().build();
    this.parent.setSection(this.section, meta, this.sectionStyle);
    return this.parent;
  }
}