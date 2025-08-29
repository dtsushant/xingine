import { 
  LayoutComponentDetail
} from '../xingine.type';
import { 
  BaseComponentDetailBuilder
} from './base-component-detail-builder';
import { ClassConstructor, ClassType } from '../decorators/decorator-types';
import {
  extractFormMetaFromClass,
  extractTableMetaFromClass,
  extractDetailMetaFromClass,
  extractChartMetaFromClass
} from '../utils/class-to-component.util';

/**
 * Fluent builder for creating LayoutComponentDetail instances
 * Supports recursive and nested component construction
 */
export class LayoutComponentDetailBuilder extends BaseComponentDetailBuilder<LayoutComponentDetail, LayoutComponentDetailBuilder> {
  
  constructor() {
    super({});
  }

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
   * Returns typed self reference for method chaining
   */
  protected self(): LayoutComponentDetailBuilder {
    return this;
  }

}