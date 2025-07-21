import 'reflect-metadata';
import {
  FormClassOptions,
  TableClassOptions,
  DetailClassOptions,
  ChartClassOptions,
  ClassConstructor
} from './decorator-types';
import {
  FORM_CLASS_METADATA,
  TABLE_CLASS_METADATA,
  DETAIL_CLASS_METADATA,
  CHART_CLASS_METADATA
} from './metadata-constants';

/**
 * Class decorator for marking a class as a form component
 * @param options - Configuration options for the form
 */
export function FormClass(options: FormClassOptions = {}) {
  return function <T extends ClassConstructor>(target: T) {
    Reflect.defineMetadata(FORM_CLASS_METADATA, options, target);
    return target;
  };
}

/**
 * Class decorator for marking a class as a table component
 * @param options - Configuration options for the table
 */
export function TableClass(options: TableClassOptions = {}) {
  return function <T extends ClassConstructor>(target: T) {
    Reflect.defineMetadata(TABLE_CLASS_METADATA, options, target);
    return target;
  };
}

/**
 * Class decorator for marking a class as a detail component
 * @param options - Configuration options for the detail view
 */
export function DetailClass(options: DetailClassOptions = {}) {
  return function <T extends ClassConstructor>(target: T) {
    Reflect.defineMetadata(DETAIL_CLASS_METADATA, options, target);
    return target;
  };
}

/**
 * Class decorator for marking a class as a chart component
 * @param options - Configuration options for the chart
 */
export function ChartClass(options: ChartClassOptions = {}) {
  return function <T extends ClassConstructor>(target: T) {
    Reflect.defineMetadata(CHART_CLASS_METADATA, options, target);
    return target;
  };
}