import { FieldInputTypeProperties, FieldMeta } from '../component/form-meta-map';
import { DetailFieldMeta } from '../component/detail-meta-map';
import { ColumnMeta } from '../component/component-meta-map';

/**
 * Base constructor type for class decorators
 */
export type ClassConstructor<T = {}> = new (...args: any[]) => T;

/**
 * Configuration options for @FormClass decorator
 */
export interface FormClassOptions {
  title?: string;
  submitLabel?: string;
  resetLabel?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  validation?: {
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    showErrorSummary?: boolean;
  };
  action?: string;
  className?: string;
  style?: Record<string, any>;
}

/**
 * Configuration options for @FormField decorator
 */
export interface FormFieldOptions<T extends keyof FieldInputTypeProperties = keyof FieldInputTypeProperties> {
  inputType?: T;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: FieldInputTypeProperties[T] extends { options: infer O } ? O | 'auto' : never;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  disabled?: boolean;
  hidden?: boolean;
  span?: number;
  order?: number;
  // For object/object[] fields (xingine's nested structure)
  fields?: FieldMeta[];
  itemFields?: FieldMeta[];
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