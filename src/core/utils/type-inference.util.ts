import { FieldInputTypeProperties } from '../component/form-meta-map';
import { ClassConstructor } from '../decorators/decorator-types';

/**
 * Utility to get all property names from a class, including inherited ones and optional properties
 */
export function getAllClassProperties(classType: ClassConstructor): string[] {
  const properties = new Set<string>();
  
  // Try to create an instance to get initialized properties
  let instance: any;
  try {
    instance = new classType();
  } catch {
    // If instantiation fails, we'll rely only on prototype inspection
    instance = null;
  }
  
  // Get properties from instance (initialized properties with default values)
  if (instance) {
    Object.getOwnPropertyNames(instance).forEach(prop => {
      if (typeof (instance as any)[prop] !== 'function' && 
          !prop.startsWith('_') && 
          prop !== 'constructor') {
        properties.add(prop);
      }
    });
  }
  
  // Get properties from TypeScript design metadata (includes optional properties)
  const metadataKeys = Reflect.getMetadataKeys(classType.prototype) || [];
  metadataKeys.forEach(key => {
    if (typeof key === 'string' && key.startsWith('design:type:')) {
      const propName = key.replace('design:type:', '');
      if (propName && !propName.startsWith('_') && propName !== 'constructor') {
        properties.add(propName);
      }
    }
  });
  
  // Alternative approach: scan for properties that have design:type metadata
  const protoKeys = Object.getOwnPropertyNames(classType.prototype);
  protoKeys.forEach(prop => {
    if (prop !== 'constructor' && !prop.startsWith('_')) {
      const propType = Reflect.getMetadata('design:type', classType.prototype, prop);
      if (propType) {
        properties.add(prop);
      }
    }
  });
  
  // Additional check: look for properties defined with decorators
  const decoratorKeys = Reflect.getOwnMetadataKeys(classType.prototype) || [];
  decoratorKeys.forEach(key => {
    if (typeof key === 'string' && key.includes('field')) {
      // Get decorated field metadata and extract property names
      const decoratedFields = Reflect.getMetadata(key, classType.prototype) || [];
      if (Array.isArray(decoratedFields)) {
        decoratedFields.forEach((field: any) => {
          if (field.name) {
            properties.add(field.name);
          }
        });
      }
    }
  });
  
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
 * Enhanced type inference that uses both metadata and sample values
 */
export function inferInputTypeFromProperty(
  propertyType: any, 
  sampleValue: any, 
  propertyName: string
): keyof FieldInputTypeProperties {
  // Check if it's an enum first using metadata
  if (isEnumType(propertyType)) {
    return 'select';
  }
  
  // First try the metadata-based approach
  if (propertyType) {
    if (propertyType === String) return 'input';
    if (propertyType === Number) return 'number';
    if (propertyType === Boolean) return 'switch';
    if (propertyType === Date) return 'date';
    if (propertyType === Array) return 'input';
    if (typeof propertyType === 'function' && propertyType.prototype) {
      return 'object';
    }
  }
  
  // Fallback to sample value analysis
  if (sampleValue !== undefined && sampleValue !== null) {
    const valueType = typeof sampleValue;
    
    if (valueType === 'string') return 'input';
    if (valueType === 'number') return 'number';
    if (valueType === 'boolean') return 'switch';
    if (sampleValue instanceof Date) return 'date';
    if (Array.isArray(sampleValue)) return 'input'; // Will be handled by array logic
    if (valueType === 'object') return 'object';
  }
  
  // Property name-based heuristics as last resort
  const lowerName = propertyName.toLowerCase();
  
  if (lowerName.includes('email')) return 'input';
  if (lowerName.includes('password')) return 'password';
  if (lowerName.includes('date') || lowerName.includes('time')) return 'date';
  if (lowerName.includes('count') || lowerName.includes('age') || lowerName.includes('id')) return 'number';
  if (lowerName.includes('active') || lowerName.includes('enabled') || lowerName.includes('is')) return 'switch';
  if (lowerName.includes('description') || lowerName.includes('comment') || lowerName.includes('note')) return 'textarea';
  
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
 * Converts camelCase string to proper label with spaces
 * e.g., "fullName" -> "Full Name", "firstName" -> "First Name", "id" -> "ID"
 */
export function camelCaseToLabel(str: string): string {
  // Handle special cases for common abbreviations
  const specialCases: { [key: string]: string } = {
    'id': 'ID',
    'url': 'URL',
    'api': 'API',
    'http': 'HTTP',
    'html': 'HTML',
    'css': 'CSS',
    'js': 'JS',
    'json': 'JSON',
    'xml': 'XML',
    'ui': 'UI',
    'ux': 'UX'
  };
  
  // Check if the entire string is a special case
  const lowerStr = str.toLowerCase();
  if (specialCases[lowerStr]) {
    return specialCases[lowerStr];
  }
  
  // Split camelCase and PascalCase strings
  const words = str
    // Insert space before uppercase letters that follow lowercase letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Insert space before uppercase letters that are followed by lowercase letters (for sequences like "XMLHttp")
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    // Split the string by spaces
    .split(' ')
    .map(word => {
      const lowerWord = word.toLowerCase();
      // Check if this word is a special case
      if (specialCases[lowerWord]) {
        return specialCases[lowerWord];
      }
      // Otherwise capitalize normally
      return capitalize(word);
    });
  
  return words.join(' ');
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