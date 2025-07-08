import { 
  LayoutComponentDetail, 
  ComponentMeta, 
  ComponentMetaMap,
  WrapperMeta
} from '../xingine.type';
import { StyleMeta } from '../expressions/style';
import { EventBindings } from '../expressions/action';

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
  private properties: ComponentMetaMap['InputRenderer'] = { name: '' };

  constructor(
    private parent: LayoutComponentDetailBuilder,
    private wrapperParent?: WrapperRendererBuilder
  ) {}

  /**
   * Sets the input name
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
   * Builds the input component
   */
  build(): LayoutComponentDetail {
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

// Placeholder builders for other components
export class FormRendererBuilder {
  constructor(private parent: LayoutComponentDetailBuilder) {}
  
  build(): LayoutComponentDetail {
    // TODO: Implement FormRenderer builder
    return this.parent.build();
  }
}

export class TableRendererBuilder {
  constructor(private parent: LayoutComponentDetailBuilder) {}
  
  build(): LayoutComponentDetail {
    // TODO: Implement TableRenderer builder
    return this.parent.build();
  }
}

export class ChartRendererBuilder {
  constructor(private parent: LayoutComponentDetailBuilder) {}
  
  build(): LayoutComponentDetail {
    // TODO: Implement ChartRenderer builder
    return this.parent.build();
  }
}

export class DetailRendererBuilder {
  constructor(private parent: LayoutComponentDetailBuilder) {}
  
  build(): LayoutComponentDetail {
    // TODO: Implement DetailRenderer builder
    return this.parent.build();
  }
}

export class ConditionalRendererBuilder {
  constructor(private parent: LayoutComponentDetailBuilder) {}
  
  build(): LayoutComponentDetail {
    // TODO: Implement ConditionalRenderer builder
    return this.parent.build();
  }
}

export class PopupRendererBuilder {
  constructor(private parent: LayoutComponentDetailBuilder) {}
  
  build(): LayoutComponentDetail {
    // TODO: Implement PopupRenderer builder
    return this.parent.build();
  }
}