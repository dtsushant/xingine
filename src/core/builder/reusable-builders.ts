import { EventBindings, SerializableAction,StyleMeta } from '../expressions';

/**
 * Reusable builder for EventBindings with common event methods
 */
export class EventBindingsBuilder {
  private eventBindings: EventBindings = {};

  /**
   * Creates a new EventBindingsBuilder instance
   */
  static create(): EventBindingsBuilder {
    return new EventBindingsBuilder();
  }

  /**
   * Sets onClick event handler
   */
  onClick(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onClick = handler;
    return this;
  }

  /**
   * Sets onSubmit event handler
   */
  onSubmit(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onSubmit = handler;
    return this;
  }

  /**
   * Sets onChange event handler
   */
  onChange(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onChange = handler;
    return this;
  }

  /**
   * Sets onFocus event handler
   */
  onFocus(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onFocus = handler;
    return this;
  }

  /**
   * Sets onBlur event handler
   */
  onBlur(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onBlur = handler;
    return this;
  }

  /**
   * Sets onKeyDown event handler
   */
  onKeyDown(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onKeyDown = handler;
    return this;
  }

  /**
   * Sets onKeyUp event handler
   */
  onKeyUp(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onKeyUp = handler;
    return this;
  }

  /**
   * Sets onHover event handler
   */
  onHover(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onHover = handler;
    return this;
  }

  /**
   * Sets onInit event handler
   */
  onInit(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onInit = handler;
    return this;
  }

  /**
   * Sets onInput event handler
   */
  onInput(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onInput = handler;
    return this;
  }

  /**
   * Sets onClear event handler
   */
  onClear(handler: SerializableAction): EventBindingsBuilder {
    this.eventBindings.onClear = handler;
    return this;
  }

  /**
   * Builds and returns the EventBindings
   */
  build(): EventBindings {
    return { ...this.eventBindings };
  }
}

/**
 * Reusable builder for StyleMeta with common styling methods
 */
export class StyleMetaBuilder {
  private styleMeta: StyleMeta = {};

  /**
   * Creates a new StyleMetaBuilder instance
   */
  static create(): StyleMetaBuilder {
    return new StyleMetaBuilder();
  }

  /**
   * Sets the className
   */
  className(className: string): StyleMetaBuilder {
    this.styleMeta.className = className;
    return this;
  }

  /**
   * Sets inline styles
   */
  style(style: Record<string, unknown>): StyleMetaBuilder {
    this.styleMeta.style = style;
    return this;
  }

  /**
   * Adds a CSS class to existing className
   */
  addClass(className: string): StyleMetaBuilder {
    if (this.styleMeta.className) {
      this.styleMeta.className += ` ${className}`;
    } else {
      this.styleMeta.className = className;
    }
    return this;
  }

  /**
   * Sets a specific style property
   */
  setStyleProperty(property: string, value: unknown): StyleMetaBuilder {
    if (!this.styleMeta.style) {
      this.styleMeta.style = {};
    }
    this.styleMeta.style[property] = value;
    return this;
  }

  /**
   * Sets common styling properties
   */
  width(width: string | number): StyleMetaBuilder {
    return this.setStyleProperty('width', width);
  }

  height(height: string | number): StyleMetaBuilder {
    return this.setStyleProperty('height', height);
  }

  margin(margin: string | number): StyleMetaBuilder {
    return this.setStyleProperty('margin', margin);
  }

  padding(padding: string | number): StyleMetaBuilder {
    return this.setStyleProperty('padding', padding);
  }

  backgroundColor(color: string): StyleMetaBuilder {
    return this.setStyleProperty('backgroundColor', color);
  }

  color(color: string): StyleMetaBuilder {
    return this.setStyleProperty('color', color);
  }

  fontSize(size: string | number): StyleMetaBuilder {
    return this.setStyleProperty('fontSize', size);
  }

  display(display: string): StyleMetaBuilder {
    return this.setStyleProperty('display', display);
  }

  flexDirection(direction: string): StyleMetaBuilder {
    return this.setStyleProperty('flexDirection', direction);
  }

  justifyContent(justify: string): StyleMetaBuilder {
    return this.setStyleProperty('justifyContent', justify);
  }

  alignItems(align: string): StyleMetaBuilder {
    return this.setStyleProperty('alignItems', align);
  }

  /**
   * Builds and returns the StyleMeta
   */
  build(): StyleMeta {
    return { ...this.styleMeta };
  }
}