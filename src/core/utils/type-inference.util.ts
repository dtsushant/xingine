import { FieldInputTypeProperties } from '../component/form-meta-map';
import { ClassConstructor } from '../decorators/decorator-types';

/**
 * Utility to get all property names from a class, including inherited ones
 */
export function getAllClassProperties(classType: ClassConstructor): string[] {
  const instance = new classType();
  const properties = new Set<string>();
  
  // Get own properties
  Object.getOwnPropertyNames(instance).forEach(prop => {
    if (typeof (instance as any)[prop] !== 'function') {
      properties.add(prop);
    }
  });
  
  // Get properties from prototype chain
  let currentProto = Object.getPrototypeOf(instance);
  while (currentProto && currentProto !== Object.prototype) {
    Object.getOwnPropertyNames(currentProto).forEach(prop => {
      if (prop !== 'constructor' && typeof currentProto[prop] !== 'function') {
        properties.add(prop);
      }
    });
    currentProto = Object.getPrototypeOf(currentProto);
  }
  
  return Array.from(properties);
}

/**
 * Infers the input type for a property based on its TypeScript design type
 */
export function inferInputTypeFromPropertyType(propertyType: any): keyof FieldInputTypeProperties {
  // Handle primitive types
  if (propertyType === String) return 'input';
  if (propertyType === Number) return 'number';
  if (propertyType === Boolean) return 'switch'; // Use switch for boolean in xingine
  if (propertyType === Date) return 'date';
  
  // Handle array types
  if (propertyType === Array) return 'input'; // Fallback for generic arrays
  
  // Handle object types (classes)
  if (typeof propertyType === 'function' && propertyType.prototype) {
    return 'object'; // Use xingine's object type for nested classes
  }
  
  // Default fallback
  return 'input';
}

/**
 * Checks if a type is a TypeScript enum
 */
export function isEnumType(type: any): boolean {
  if (!type || typeof type !== 'object') return false;
  
  const keys = Object.keys(type);
  const values = Object.values(type);
  
  // Check if it's a numeric enum (keys and values are reversed)
  const isNumericEnum = keys.length === values.length * 2 && 
    keys.some(key => !isNaN(Number(key))) && 
    values.some(val => typeof val === 'number');
  
  if (isNumericEnum) return true;
  
  // Check if it's a string enum
  const isStringEnum = keys.length === values.length && 
    keys.every(key => typeof type[key] === 'string') &&
    values.every(val => typeof val === 'string');
  
  return isStringEnum;
}

/**
 * Extracts options from a TypeScript enum
 */
export function extractEnumOptions(enumType: any): { label: string; value: string }[] {
  if (!enumType || typeof enumType !== 'object') return [];
  
  const options: { label: string; value: string }[] = [];
  const keys = Object.keys(enumType);
  const values = Object.values(enumType);
  
  // Handle string enums
  if (keys.every(key => typeof enumType[key] === 'string')) {
    keys.forEach(key => {
      options.push({
        label: formatEnumLabel(key),
        value: enumType[key] as string
      });
    });
  }
  // Handle numeric enums (skip reverse mapping)
  else {
    const numericKeys = keys.filter(key => !isNaN(Number(enumType[key])));
    numericKeys.forEach(key => {
      options.push({
        label: formatEnumLabel(key),
        value: String(enumType[key])
      });
    });
  }
  
  return options;
}

/**
 * Formats an enum key into a human-readable label
 */
export function formatEnumLabel(enumKey: string): string {
  return enumKey
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Checks if a type is recursive (self-referencing)
 */
export function isRecursiveType(type: any, rootType: any): boolean {
  return type === rootType || 
         (type && type.prototype && rootType && rootType.prototype && 
          type.prototype === rootType.prototype);
}

/**
 * Gets default properties for a given input type
 */
export function getDefaultPropertiesForInputType(inputType: keyof FieldInputTypeProperties): any {
  switch (inputType) {
    case 'input':
      return { placeholder: '' };
    case 'number':
      return { step: 1 };
    case 'select':
      return { options: [] };
    case 'date':
      return { format: 'YYYY-MM-DD' };
    case 'textarea':
      return { rows: 3 };
    case 'switch':
      return { defaultChecked: false };
    case 'object':
      return { fields: [] };
    case 'object[]':
      return { itemFields: [] };
    default:
      return {};
  }
}