import { FieldInputTypeProperties, FieldMeta } from '../component/form-meta-map';
import { DetailFieldMeta } from '../component/detail-meta-map';
import { ColumnMeta, FormMeta } from '../component/component-meta-map';
import {EventBindings, SerializableAction} from "../expressions";
import { WrapInMeta } from '../component/wrap-in-meta';

/**
 * Base constructor type for class decorators
 * More flexible to handle DTO classes with readonly properties
 */
export type ClassConstructor<T = {}> = new (...args: any[]) => T;

/**
 * Alternative constructor type that's more permissive for DTO classes
 */
export type AnyClassConstructor = abstract new (...args: any[]) => any;

/**
 * Function type that works with both regular classes and DTO classes
 */
export type ClassType<T = any> = Function & { prototype: T };

/**
 * Configuration for @FormGroup decorator - assigns a field to a specific group
 */
export interface FormGroupOptions {
  /**
   * Unique identifier for the form group
   */
  grouperId: string;
}

/**
 * Type for the wrapper map returned by @FormWrapper decorated functions
 */
export type WrapperMap = Record<string, WrapInMeta>;

/**
 * Configuration options for @FormClass decorator
 * Extends FormMeta properties but excludes 'fields' since those are defined via @FormField decorators
 */
export interface FormClassOptions extends Omit<FormMeta, 'fields'> {}

/**
 * Configuration options for @FormField decorator
 */
export interface FormFieldOptions<
    T extends keyof FieldInputTypeProperties = keyof FieldInputTypeProperties,
> extends FieldMeta{
  placeholder?: string;
  options?: FieldInputTypeProperties[T] extends { options: infer O } ? O | 'auto' : never;

  itemType?: ClassConstructor; // Explicit item type for arrays
}

/**
 * Configuration options for @TableClass decorator
 */
export interface TableClassOptions {
  title?: string;
  pagination?: {
    pageSize?: number;
    showSizeChanger?: boolean;
  };
  selection?: {
    type?: 'checkbox' | 'radio';
    multiple?: boolean;
  };
  actions?: string[];
  searchable?: boolean;
  exportable?: boolean;
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  scroll?: { x?: number; y?: number };
  dataSourceUrl?: string;
  handleRowClick?:SerializableAction;
  className?: string;
  style?: Record<string, any>;
}

/**
 * Configuration options for @TableColumn decorator
 */
export interface TableColumnOptions {
  title?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  fixed?: 'left' | 'right';
  sortable?: boolean;
  filterable?: {
    apply?: boolean;
    operator?: string;
    inputType?: keyof FieldInputTypeProperties;
    searchFieldKey?: string;
  };
  render?: 'default' | 'custom' | 'date' | 'currency' | 'badge';
  customRender?: string;
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  copyable?: boolean;
  hidden?: boolean;
  order?: number;
}

/**
 * Configuration options for @DetailClass decorator
 */
export interface DetailClassOptions {
  title?: string;
  layout?: 'horizontal' | 'vertical';
  bordered?: boolean;
  copyable?: boolean;
  className?: string;
  style?: Record<string, any>;
}

/**
 * Configuration options for @DetailField decorator
 */
export interface DetailFieldOptions {
  inputType?: 'text' | 'avatar' | 'date' | 'badge' | 'tag';
  label?: string;
  span?: number;
  copyable?: boolean;
  size?: 'small' | 'middle' | 'large';
  hidden?: boolean;
  order?: number;
}

/**
 * Configuration options for @ChartClass decorator
 */
export interface ChartClassOptions {
  title?: string;
  type?: 'mixed' | 'line' | 'bar' | 'pie';
  responsive?: boolean;
  legend?: { position?: 'top' | 'bottom' | 'left' | 'right' };
  grid?: { show?: boolean };
  className?: string;
  style?: Record<string, any>;
}

/**
 * Configuration options for @ChartSeries decorator
 */
export interface ChartSeriesOptions {
  type?: 'line' | 'bar';
  color?: string;
  yAxis?: 'primary' | 'secondary';
  label?: string;
  hidden?: boolean;
  order?: number;
}