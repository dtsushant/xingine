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

  /**
   * Create form from class type with automatic field inference
   */
  static fromClass<T extends {}>(classType: ClassConstructor<T>): LayoutComponentDetailBuilder {
    const formMeta = extractFormMetaFromClass(classType);
    return LayoutComponentDetailBuilder.create().withMeta('FormRenderer', formMeta);
  }

  /**
   * Create form component from decorated class
   */
  formFromClass<T extends {}>(classType: ClassConstructor<T>): LayoutComponentDetailBuilder {
    const formMeta = extractFormMetaFromClass(classType);
    this.layoutDetail.meta = {
      component: 'FormRenderer',
      properties: formMeta
    };
    return this;
  }

  /**
   * Create table component from decorated class
   */
  tableFromClass<T extends {}>(classType: ClassConstructor<T>): LayoutComponentDetailBuilder {
    const tableMeta = extractTableMetaFromClass(classType);
    this.layoutDetail.meta = {
      component: 'TableRenderer',
      properties: tableMeta
    };
    return this;
  }

  /**
   * Create detail component from decorated class
   */
  detailFromClass<T extends {}>(classType: ClassConstructor<T>): LayoutComponentDetailBuilder {
    const detailMeta = extractDetailMetaFromClass(classType);
    this.layoutDetail.meta = {
      component: 'DetailRenderer',
      properties: detailMeta
    };
    return this;
  }

  /**
   * Create chart component from decorated class
   */
  chartFromClass<T extends {}>(classType: ClassConstructor<T>): LayoutComponentDetailBuilder {
    const chartMeta = extractChartMetaFromClass(classType);
    this.layoutDetail.meta = {
      component: 'ChartRenderer',
      properties: chartMeta
    };
    return this;
  }
}