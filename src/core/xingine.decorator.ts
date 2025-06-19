import "reflect-metadata";
import {
  CommissarProperties,
  FieldValidationError,
  FormValidationResult,
  ModuleProperties,
  ModulePropertyOptions,
  ProvisioneerProps,
  ProvisioneerProperties,
} from "./xingine.type";
import { Constructor } from "./utils/type";
import {
  ColumnMeta,
  FieldMeta,
  FormMeta,
  InputTypeProperties,
  NumberTypeProperties,
  PasswordTypeProperties,
  TextareaTypeProperties,
} from "./component/component-meta-map";
import { DetailFieldMeta } from "./component/detail-meta-map";

export const MODULE_PROPERTY_METADATA_KEY = "custom:module-property";
export const PROVISIONEER_METADATA = "xingine:provisioneer";
export const FORM_FIELD_METADATA = "xingine:form-field";
export const DETAIL_FIELD_METADATA = "xingine:detail-field";
export const COLUMN_PROPERTY_METADATA = "xingine:column-property";

/**
 *A @Provisioneer is a service controller that acts as a centralized,state-assigned provision handler.
 * It exposes a defined set of provision points (actions), each governed by a @Commissar, representing specific state-sanctioned duties.
 * The Provisioneer is not autonomous in defining its functional intent;
 * instead, it operates strictly under system-defined allocations and routes.
 */
export function Provisioneer(options: ProvisioneerProps): ClassDecorator {
  return (target) => {
    const finalOptions: ProvisioneerProps = {
      ...options,
      name: options.name ?? target.name,
    };
    Reflect.defineMetadata(PROVISIONEER_METADATA, finalOptions, target);
  };
}

export function getProvisioneerProperties(
  controllerClass: Constructor,
): ProvisioneerProperties | undefined {
  return Reflect.getMetadata(PROVISIONEER_METADATA, controllerClass) as
    | ProvisioneerProperties
    | undefined;
}

export function ModuleProperty(options: ModulePropertyOptions): ClassDecorator {
  return (target) => {
    const finalOptions: ModuleProperties = {
      ...options,
      name: target.name,
    };
    Reflect.defineMetadata(MODULE_PROPERTY_METADATA_KEY, finalOptions, target);
  };
}

export function getModulePropertyMetadata<T extends object>(
  moduleClass: new (...args: []) => T,
): ModuleProperties | undefined {
  return Reflect.getMetadata(MODULE_PROPERTY_METADATA_KEY, moduleClass) as
    | ModuleProperties
    | undefined;
}

export function FormField(meta: FieldMeta): PropertyDecorator {
  return (target, propertyKey) => {
    const existing: FieldMeta[] =
      Reflect.getMetadata(FORM_FIELD_METADATA, target.constructor) || [];
    meta.name = propertyKey.toString(); // ensure name is always set
    Reflect.defineMetadata(
      FORM_FIELD_METADATA,
      [...existing, meta],
      target.constructor,
    );
  };
}

export function generateFormMeta(dtoClass: new () => any): FormMeta {
  const fields: FieldMeta[] =
    Reflect.getMetadata(FORM_FIELD_METADATA, dtoClass) || [];
  return {
    action: "",
    fields,
  };
}

export function DetailField(meta: DetailFieldMeta): PropertyDecorator {
  return (target, propertyKey) => {
    const existing: DetailFieldMeta[] =
      Reflect.getMetadata(DETAIL_FIELD_METADATA, target.constructor) || [];
    meta.name = propertyKey.toString(); // ensure name is always set
    Reflect.defineMetadata(
      DETAIL_FIELD_METADATA,
      [...existing, meta],
      target.constructor,
    );
  };
}

export function ColumnProperty(meta: ColumnMeta): PropertyDecorator {
  return (target, propertyKey) => {
    const existing: ColumnMeta[] =
      Reflect.getMetadata(COLUMN_PROPERTY_METADATA, target.constructor) || [];
    meta.title = propertyKey.toString();
    meta.dataIndex = propertyKey.toString();
    Reflect.defineMetadata(
      COLUMN_PROPERTY_METADATA,
      [...existing, meta],
      target.constructor,
    );
  };
}

/**
 * Validates a form object against its FormField decorators
 * @param formField - The form object instance to validate
 * @returns FormValidationResult with isValid flag and list of errors
 */
export function validateFormField<T extends object>(formField: T): FormValidationResult {
  const constructor = formField.constructor as new () => T;
  const fields: FieldMeta[] = Reflect.getMetadata(FORM_FIELD_METADATA, constructor) || [];
  
  const errors: FieldValidationError[] = [];

  for (const fieldMeta of fields) {
    if (!fieldMeta.name) continue;
    
    const fieldValue = (formField as any)[fieldMeta.name];
    const fieldErrors = validateFieldValue(fieldMeta, fieldValue);
    errors.push(...fieldErrors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a single field value against its FieldMeta constraints
 */
function validateFieldValue(fieldMeta: FieldMeta, value: any): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const fieldName = fieldMeta.name!;

  // Check required validation
  if (fieldMeta.required && (value === undefined || value === null || value === '')) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} is required`
    });
    return errors; // If required field is empty, skip other validations
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return errors;
  }

  // Type-specific validations
  switch (fieldMeta.inputType) {
    case 'input':
      validateInputField(fieldMeta as FieldMeta<'input'>, value, errors);
      break;
    case 'password':
      validatePasswordField(fieldMeta as FieldMeta<'password'>, value, errors);
      break;
    case 'number':
      validateNumberField(fieldMeta as FieldMeta<'number'>, value, errors);
      break;
    case 'textarea':
      validateTextareaField(fieldMeta as FieldMeta<'textarea'>, value, errors);
      break;
    // Add other field types as needed
  }

  return errors;
}

/**
 * Validates input field constraints
 */
function validateInputField(fieldMeta: FieldMeta<'input'>, value: any, errors: FieldValidationError[]): void {
  const fieldName = fieldMeta.name!;
  const properties = fieldMeta.properties as InputTypeProperties;
  
  if (!properties) return;

  const stringValue = String(value);

  if (properties.maxLength && stringValue.length > properties.maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must not exceed ${properties.maxLength} characters`
    });
  }

  if (properties.minLength && stringValue.length < properties.minLength) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must be at least ${properties.minLength} characters`
    });
  }

  if (properties.email && !isValidEmail(stringValue)) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must be a valid email address`
    });
  }
}

/**
 * Validates password field constraints
 */
function validatePasswordField(fieldMeta: FieldMeta<'password'>, value: any, errors: FieldValidationError[]): void {
  const fieldName = fieldMeta.name!;
  const properties = fieldMeta.properties as PasswordTypeProperties;
  
  if (!properties) return;

  const stringValue = String(value);

  if (properties.minLength && stringValue.length < properties.minLength) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must be at least ${properties.minLength} characters`
    });
  }
}

/**
 * Validates number field constraints
 */
function validateNumberField(fieldMeta: FieldMeta<'number'>, value: any, errors: FieldValidationError[]): void {
  const fieldName = fieldMeta.name!;
  const properties = fieldMeta.properties as NumberTypeProperties;
  
  if (!properties) return;

  const numValue = Number(value);

  if (isNaN(numValue)) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must be a valid number`
    });
    return;
  }

  if (properties.min !== undefined && numValue < properties.min) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must be at least ${properties.min}`
    });
  }

  if (properties.max !== undefined && numValue > properties.max) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must not exceed ${properties.max}`
    });
  }
}

/**
 * Validates textarea field constraints
 */
function validateTextareaField(fieldMeta: FieldMeta<'textarea'>, value: any, errors: FieldValidationError[]): void {
  const fieldName = fieldMeta.name!;
  const properties = fieldMeta.properties as TextareaTypeProperties;
  
  if (!properties) return;

  const stringValue = String(value);

  if (properties.maxLength && stringValue.length > properties.maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldMeta.label || fieldName} must not exceed ${properties.maxLength} characters`
    });
  }
}

/**
 * Simple email validation helper
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
