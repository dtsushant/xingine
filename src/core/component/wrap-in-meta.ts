import { StyleMeta } from "../expressions/style";
import { EventBindings } from "../expressions";

/**
 * WrapInMeta Interface - Plugin-style wrapper for any React component
 * Supports recursive wrapping, multiple HTML element types, and full styling
 * 
 * This interface defines the structure for the wrapIn property that can be added
 * to any component meta to provide wrapping functionality without hardcoded HTML elements.
 */
export interface WrapInMeta {
  /**
   * Recursive wrapper meta - allows multiple levels of wrapping
   */
  wrap?: WrapInMeta;

  /**
   * HTML element type to wrap with
   * Supports semantic HTML elements for accessibility and proper structure
   */
  wrapWith: 'div' | 'p' | 'pre' | 'section' | 'article' | 'main' | 'aside' | 
           'header' | 'footer' | 'nav' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 
           'h5' | 'h6' | 'li' | 'ul' | 'ol' | 'label';

  /**
   * Style configuration (className and style object)
   */
  style?: StyleMeta;

  /**
   * Event bindings (onClick, onHover, etc.)
   */
  event?: EventBindings;

  /**
   * Additional HTML attributes (id, data-*, aria-*, etc.)
   */
  htmlAttributes?: Record<string, string | number | boolean>;

  /**
   * Optional className to apply to the container that wraps the children
   * This allows for applying grid layouts or other styling specifically to the children container
   */
  childrenClassName?: string;

  /**
   * Additional properties for extensibility
   */
  [key: string]: unknown;
}

/**
 * Interface for components that support the wrapIn functionality
 * This should be extended by component meta types that want to support wrapping
 */
export interface WrapInSupport {
  /**
   * Optional wrapper configuration
   * When provided, the component will be wrapped with the specified HTML element and styling
   */
  wrapIn?: WrapInMeta;
}

/**
 * Type utility to add wrapIn support to any component meta type
 */
export type WithWrapIn<T> = T & WrapInSupport;

/**
 * Validation utility to check if WrapInMeta is valid
 */
export function validateWrapInMeta(meta: WrapInMeta): boolean {
  // Must have wrapWith property
  if (!meta.wrapWith) {
    return false;
  }

  // Validate wrapWith is a valid HTML element
  const validElements = [
    'div', 'p', 'pre', 'section', 'article', 'main', 'aside',
    'header', 'footer', 'nav', 'span', 'h1', 'h2', 'h3', 'h4',
    'h5', 'h6', 'li', 'ul', 'ol','label'
  ];

  if (!validElements.includes(meta.wrapWith)) {
    return false;
  }

  // If there's a recursive wrap, validate it too
  if (meta.wrap && !validateWrapInMeta(meta.wrap)) {
    return false;
  }

  return true;
}

/**
 * Builder utility for creating WrapInMeta configurations
 */
export class WrapInMetaBuilder {
  private meta: WrapInMeta;

  constructor(wrapWith: WrapInMeta['wrapWith'] = 'div') {
    this.meta = { wrapWith };
  }

  /**
   * Create a new builder instance
   */
  static create(wrapWith: WrapInMeta['wrapWith'] = 'div'): WrapInMetaBuilder {
    return new WrapInMetaBuilder(wrapWith);
  }

  /**
   * Create builder from existing WrapInMeta
   */
  static fromMeta(meta: WrapInMeta): WrapInMetaBuilder {
    const builder = new WrapInMetaBuilder(meta.wrapWith);
    builder.meta = { ...meta };
    return builder;
  }

  /**
   * Set the HTML element type to wrap with
   */
  wrapWith(element: WrapInMeta['wrapWith']): WrapInMetaBuilder {
    this.meta.wrapWith = element;
    return this;
  }

  /**
   * Add style configuration
   */
  style(style: StyleMeta): WrapInMetaBuilder {
    this.meta.style = style;
    return this;
  }

  /**
   * Add CSS class names
   */
  className(className: string): WrapInMetaBuilder {
    if (!this.meta.style) this.meta.style = {};
    this.meta.style.className = className;
    return this;
  }

  /**
   * Add CSS-in-JS styles
   */
  cssStyle(style: Record<string, unknown>): WrapInMetaBuilder {
    if (!this.meta.style) this.meta.style = {};
    this.meta.style.style = style;
    return this;
  }

  /**
   * Add event bindings
   */
  event(event: EventBindings): WrapInMetaBuilder {
    this.meta.event = event;
    return this;
  }

  /**
   * Add a single event binding
   */
  onClick(action: EventBindings['onClick']): WrapInMetaBuilder {
    if (!this.meta.event) this.meta.event = {};
    this.meta.event.onClick = action;
    return this;
  }

  /**
   * Add HTML attributes
   */
  attributes(attributes: Record<string, string | number | boolean>): WrapInMetaBuilder {
    this.meta.htmlAttributes = attributes;
    return this;
  }

  /**
   * Add a single HTML attribute
   */
  attribute(key: string, value: string | number | boolean): WrapInMetaBuilder {
    if (!this.meta.htmlAttributes) this.meta.htmlAttributes = {};
    this.meta.htmlAttributes[key] = value;
    return this;
  }

  /**
   * Add recursive wrapping
   */
  wrap(wrapMeta: WrapInMeta): WrapInMetaBuilder {
    this.meta.wrap = wrapMeta;
    return this;
  }

  /**
   * Add recursive wrapping with element type
   */
  wrapWithElement(element: WrapInMeta['wrapWith']): WrapInMetaBuilder {
    this.meta.wrap = { wrapWith: element };
    return this;
  }

  /**
   * Add recursive wrapping using a builder function
   */
  wrapWithBuilder(builderFn: (builder: WrapInMetaBuilder) => WrapInMetaBuilder): WrapInMetaBuilder {
    const builder = WrapInMetaBuilder.create();
    const result = builderFn(builder);
    this.meta.wrap = result.build();
    return this;
  }

  /**
   * Add custom property
   */
  property(key: string, value: unknown): WrapInMetaBuilder {
    this.meta[key] = value;
    return this;
  }

  /**
   * Set the className for the children container
   * This allows for applying grid layouts or other styling specifically to the children container
   */
  childrenClassName(className: string): WrapInMetaBuilder {
    this.meta.childrenClassName = className;
    return this;
  }

  /**
   * Add multiple custom properties
   */
  properties(properties: Record<string, unknown>): WrapInMetaBuilder {
    Object.assign(this.meta, properties);
    return this;
  }

  /**
   * Build the final WrapInMeta object
   */
  build(): WrapInMeta {
    if (!validateWrapInMeta(this.meta)) {
      throw new Error('Invalid WrapInMeta configuration');
    }
    return { ...this.meta };
  }
}

/**
 * Utility functions for working with WrapInMeta
 */
export const WrapInMetaUtils = {
  /**
   * Check if a component meta has wrapIn configuration
   */
  hasWrapIn(meta: any): meta is WithWrapIn<any> {
    return meta != null && typeof meta === 'object' && 'wrapIn' in meta && meta.wrapIn != null;
  },

  /**
   * Get the wrapIn configuration from component meta
   */
  getWrapIn(meta: any): WrapInMeta | null {
    return this.hasWrapIn(meta) ? meta.wrapIn : null;
  },

  /**
   * Create a new component meta with wrapIn configuration
   */
  withWrapIn<T>(meta: T, wrapIn: WrapInMeta): WithWrapIn<T> {
    return { ...meta, wrapIn };
  },

  /**
   * Remove wrapIn configuration from component meta
   */
  withoutWrapIn<T extends WithWrapIn<any>>(meta: T): Omit<T, 'wrapIn'> {
    const { wrapIn, ...rest } = meta as any;
    return rest as Omit<T, 'wrapIn'>;
  },

  /**
   * Merge multiple WrapInMeta configurations (outer wraps inner)
   */
  mergeWrapIn(outer: WrapInMeta, inner: WrapInMeta): WrapInMeta {
    return {
      ...outer,
      wrap: inner
    };
  }
};
