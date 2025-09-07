import 'reflect-metadata';
import {
  FormFieldOptions,
  TableColumnOptions,
  DetailFieldOptions,
  ChartSeriesOptions,
  FormGroupOptions,
  WrapperMap
} from './decorator-types';
import {
  FORM_FIELD_METADATA,
  FORM_GROUP_METADATA,
  FORM_WRAPPER_METADATA,
  TABLE_COLUMN_METADATA,
  DETAIL_FIELD_METADATA,
  CHART_SERIES_METADATA
} from './metadata-constants';

/**
 * Property decorator for form fields
 * @param options - Configuration options for the form field
 */
export function FormField(options: FormFieldOptions = {}) {
  return function (target: any, propertyKey: string) {
    const existingFields = Reflect.getMetadata(FORM_FIELD_METADATA, target.constructor) || [];
    const fieldData = { name: propertyKey, ...options };
    existingFields.push(fieldData);
    Reflect.defineMetadata(FORM_FIELD_METADATA, existingFields, target.constructor);
  };
}

/**
 * Property decorator for assigning form fields to groups
 * @param options - Configuration options for the form group assignment
 */
export function FormGroup(options: FormGroupOptions) {
  return function (target: any, propertyKey: string) {
    const existingGroups = Reflect.getMetadata(FORM_GROUP_METADATA, target.constructor) || [];
    const groupData = { 
      fieldName: propertyKey,
      grouperId: options.grouperId
    };
    existingGroups.push(groupData);
    Reflect.defineMetadata(FORM_GROUP_METADATA, existingGroups, target.constructor);
  };
}

/**
 * Method decorator for defining wrapper configurations
 * Applied to a method that returns a WrapperMap
 * @returns Method decorator
 */
export function FormWrapper() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store the method name that returns the wrapper map
    Reflect.defineMetadata(FORM_WRAPPER_METADATA, propertyKey, target.constructor);
    return descriptor;
  };
}

/**
 * Property decorator for table columns
 * @param options - Configuration options for the table column
 */
export function TableColumn(options: TableColumnOptions = {}) {
  return function (target: any, propertyKey: string) {
    const existingColumns = Reflect.getMetadata(TABLE_COLUMN_METADATA, target.constructor) || [];
    const columnData = { dataIndex: propertyKey, key: propertyKey, ...options };
    existingColumns.push(columnData);
    Reflect.defineMetadata(TABLE_COLUMN_METADATA, existingColumns, target.constructor);
  };
}

/**
 * Property decorator for detail fields
 * @param options - Configuration options for the detail field
 */
export function DetailField(options: DetailFieldOptions = {}) {
  return function (target: any, propertyKey: string) {
    const existingFields = Reflect.getMetadata(DETAIL_FIELD_METADATA, target.constructor) || [];
    const fieldData = { name: propertyKey, ...options };
    existingFields.push(fieldData);
    Reflect.defineMetadata(DETAIL_FIELD_METADATA, existingFields, target.constructor);
  };
}

/**
 * Property decorator for chart series
 * @param options - Configuration options for the chart series
 */
export function ChartSeries(options: ChartSeriesOptions = {}) {
  return function (target: any, propertyKey: string) {
    const existingSeries = Reflect.getMetadata(CHART_SERIES_METADATA, target.constructor) || [];
    const seriesData = { name: propertyKey, ...options };
    existingSeries.push(seriesData);
    Reflect.defineMetadata(CHART_SERIES_METADATA, existingSeries, target.constructor);
  };
}