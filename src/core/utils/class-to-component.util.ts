import 'reflect-metadata';
import { ClassConstructor } from '../decorators/decorator-types';
import { 
  FormMeta,
  TableMeta,
  DetailMeta,
  ChartMeta,
  ColumnMeta
} from '../component/component-meta-map';
import { FieldMeta } from '../component/form-meta-map';
import { DetailFieldMeta } from '../component/detail-meta-map';
import {
  FORM_CLASS_METADATA,
  TABLE_CLASS_METADATA,
  DETAIL_CLASS_METADATA,
  CHART_CLASS_METADATA,
  FORM_FIELD_METADATA,
  TABLE_COLUMN_METADATA,
  DETAIL_FIELD_METADATA,
  CHART_SERIES_METADATA
} from '../decorators/metadata-constants';
import {
  getAllClassProperties,
  inferInputTypeFromPropertyType,
  inferInputTypeFromProperty,
  isEnumType,
  extractEnumOptions,
  capitalize,
  isRecursiveType,
  getDefaultPropertiesForInputType
} from './type-inference.util';

/**
 * Extracts FormMeta from a decorated class
 */
export function extractFormMetaFromClass<T extends {}>(
  classType: ClassConstructor<T>,
  depth: number = 0,
  visited: Set<ClassConstructor> = new Set()
): FormMeta {
  const classOptions = Reflect.getMetadata(FORM_CLASS_METADATA, classType) || {};
  const decoratedFields = Reflect.getMetadata(FORM_FIELD_METADATA, classType) || [];
  
  // Add current class to visited set to prevent infinite recursion
  const visitedWithCurrent = new Set(visited);
  visitedWithCurrent.add(classType);
  
  // Get all properties from class
  const allProperties = getAllClassProperties(classType);
  
  // Merge decorated fields with auto-inferred fields
  const fields = mergeFormFields(decoratedFields, allProperties, classType, depth, visitedWithCurrent);
  
  return {
    fields: fields,
    action: classOptions.action || '',
    ...classOptions
  };
}

/**
 * Extracts TableMeta from a decorated class
 */
export function extractTableMetaFromClass<T extends {}>(classType: ClassConstructor<T>): TableMeta {
  const classOptions = Reflect.getMetadata(TABLE_CLASS_METADATA, classType) || {};
  const decoratedColumns = Reflect.getMetadata(TABLE_COLUMN_METADATA, classType) || [];
  
  const allProperties = getAllClassProperties(classType);
  const columns = mergeTableColumns(decoratedColumns, allProperties, classType);
  
  return {
    columns: columns,
    dataSourceUrl: classOptions.dataSourceUrl || '',
    ...classOptions
  };
}

/**
 * Extracts DetailMeta from a decorated class
 */
export function extractDetailMetaFromClass<T extends {}>(classType: ClassConstructor<T>): DetailMeta {
  const classOptions = Reflect.getMetadata(DETAIL_CLASS_METADATA, classType) || {};
  const decoratedFields = Reflect.getMetadata(DETAIL_FIELD_METADATA, classType) || [];
  
  const allProperties = getAllClassProperties(classType);
  const fields = mergeDetailFields(decoratedFields, allProperties, classType);
  
  return {
    fields: fields,
    action: classOptions.action || '',
    ...classOptions
  };
}

/**
 * Extracts ChartMeta from a decorated class
 */
export function extractChartMetaFromClass<T extends {}>(classType: ClassConstructor<T>): ChartMeta {
  const classOptions = Reflect.getMetadata(CHART_CLASS_METADATA, classType) || {};
  const decoratedSeries = Reflect.getMetadata(CHART_SERIES_METADATA, classType) || [];
  
  // For now, we'll create a simple chart structure
  // This can be enhanced based on specific chart requirements
  return {
    charts: [{
      type: classOptions.type || 'line',
      title: classOptions.title,
      datasets: decoratedSeries.map((series: any) => ({
        label: series.label || capitalize(series.name),
        data: [],
        backgroundColor: series.color,
        borderColor: series.color
      }))
    }],
    ...classOptions
  };
}

/**
 * Merges decorated form fields with auto-inferred fields
 */
function mergeFormFields(
  decoratedFields: any[],
  allProperties: string[],
  classType: ClassConstructor,
  depth: number = 0,
  visited: Set<ClassConstructor> = new Set()
): FieldMeta[] {
  const fieldMap = new Map<string, FieldMeta>();
  
  // Add explicitly decorated fields first
  decoratedFields.forEach(field => {
    let inputType = field.inputType;
    let properties = field.properties;
    
    // If decorator is empty (just @FormField()), infer the type
    if (!inputType) {
      const propertyType = Reflect.getMetadata('design:type', classType.prototype, field.name);
      
      let sampleValue: any;
      try {
        const instance = new classType();
        sampleValue = (instance as any)[field.name];
      } catch {
        sampleValue = undefined;
      }
      
      inputType = inferInputTypeFromProperty(propertyType, sampleValue, field.name);
      
      // For object types, we need to extract the nested fields
      if (inputType === 'object' && typeof propertyType === 'function' && propertyType.prototype) {
        if (visited.has(propertyType)) {
          properties = { fields: [] }; // Prevent infinite recursion
        } else {
          const nestedFields = extractFormMetaFromClass(propertyType, depth + 1, visited);
          properties = { fields: nestedFields.fields };
        }
      } else {
        properties = properties || getDefaultPropertiesForInputType(inputType);
      }
    }
    
    const fieldMeta: FieldMeta = {
      name: field.name,
      label: field.label || capitalize(field.name),
      inputType: inputType || 'input',
      required: field.required || false,
      properties: properties || getDefaultPropertiesForInputType(inputType || 'input'),
      ...field
    };
    
    fieldMap.set(field.name, fieldMeta);
  });
  
  // Add auto-inferred fields for remaining properties
  allProperties.forEach(propName => {
    if (!fieldMap.has(propName)) {
      const inferredField = inferFormField(propName, classType, depth, visited);
      fieldMap.set(propName, inferredField);
    }
  });
  
  return Array.from(fieldMap.values());
}

/**
 * Merges decorated table columns with auto-inferred columns
 */
function mergeTableColumns(
  decoratedColumns: any[],
  allProperties: string[],
  classType: ClassConstructor
): ColumnMeta[] {
  const columnMap = new Map<string, ColumnMeta>();
  
  // Add explicitly decorated columns first
  decoratedColumns.forEach(column => {
    const columnMeta: ColumnMeta = {
      title: column.title || capitalize(column.dataIndex || column.key),
      dataIndex: column.dataIndex,
      key: column.key,
      sortable: column.sortable,
      ...column
    };
    columnMap.set(column.dataIndex || column.key, columnMeta);
  });
  
  // Add auto-inferred columns for remaining properties
  allProperties.forEach(propName => {
    if (!columnMap.has(propName)) {
      const inferredColumn = inferTableColumn(propName, classType);
      columnMap.set(propName, inferredColumn);
    }
  });
  
  return Array.from(columnMap.values());
}

/**
 * Merges decorated detail fields with auto-inferred fields
 */
function mergeDetailFields(
  decoratedFields: any[],
  allProperties: string[],
  classType: ClassConstructor
): DetailFieldMeta[] {
  const fieldMap = new Map<string, DetailFieldMeta>();
  
  // Add explicitly decorated fields first
  decoratedFields.forEach(field => {
    const fieldMeta: DetailFieldMeta = {
      name: field.name,
      label: field.label || capitalize(field.name),
      inputType: field.inputType || 'text',
      ...field
    };
    fieldMap.set(field.name, fieldMeta);
  });
  
  // Add auto-inferred fields for remaining properties
  allProperties.forEach(propName => {
    if (!fieldMap.has(propName)) {
      const inferredField = inferDetailField(propName, classType);
      fieldMap.set(propName, inferredField);
    }
  });
  
  return Array.from(fieldMap.values());
}

/**
 * Infers a form field from a property
 */
function inferFormField(
  propertyName: string,
  classType: ClassConstructor,
  depth: number = 0,
  visited: Set<ClassConstructor> = new Set()
): FieldMeta {
  const propertyType = Reflect.getMetadata('design:type', classType.prototype, propertyName);
  
  // Try to get a sample instance to analyze the actual value
  let sampleValue: any;
  try {
    const instance = new classType();
    sampleValue = (instance as any)[propertyName];
  } catch {
    // If we can't instantiate, proceed without sample value
    sampleValue = undefined;
  }
  
  // Check if this property has an empty @FormField decorator
  const decoratedFields = Reflect.getMetadata(FORM_FIELD_METADATA, classType) || [];
  const emptyDecorator = decoratedFields.find((field: any) => field.name === propertyName && !field.inputType);
  
  // Enhanced type detection using both metadata and sample value
  const inferredInputType = inferInputTypeFromProperty(propertyType, sampleValue, propertyName);
  
  // Handle enums -> single select
  if (isEnumType(propertyType)) {
    return {
      name: propertyName,
      label: capitalize(propertyName),
      inputType: 'select',
      required: false,
      properties: {
        options: extractEnumOptions(propertyType)
      }
    };
  }
  
  // Handle arrays
  if (propertyType === Array || Array.isArray(sampleValue)) {
    let itemType = Reflect.getMetadata('design:itemtype', classType.prototype, propertyName);
    
    // If no itemtype metadata, try to infer from sample value
    if (!itemType && Array.isArray(sampleValue) && sampleValue.length > 0) {
      const firstItem = sampleValue[0];
      if (firstItem && typeof firstItem === 'object' && firstItem.constructor && firstItem.constructor !== Object) {
        itemType = firstItem.constructor;
      }
    }
    
    // Try to infer from property name patterns for common array types
    if (!itemType) {
      const lowerName = propertyName.toLowerCase();
      if (lowerName.includes('categories') || lowerName.includes('users') || lowerName.includes('items')) {
        // Assume these are object arrays, but we'll need the type elsewhere
        // For now, provide a generic object[] structure
        return {
          name: propertyName,
          label: capitalize(propertyName),
          inputType: 'object[]',
          required: false,
          properties: {
            itemFields: [] // Will be populated if type is known
          }
        };
      }
    }
    
    if (isEnumType(itemType)) {
      // Array of enums -> select with multiple
      return {
        name: propertyName,
        label: capitalize(propertyName),
        inputType: 'select',
        required: false,
        properties: {
          multiple: true,
          options: extractEnumOptions(itemType)
        }
      };
    } else if (itemType && typeof itemType === 'function' && itemType.prototype) {
      // Array of objects -> use xingine's object[] type
      return {
        name: propertyName,
        label: capitalize(propertyName),
        inputType: 'object[]',
        required: false,
        properties: {
          itemFields: visited.has(itemType) ? [] : extractFormMetaFromClass(itemType, depth + 1, visited).fields
        }
      };
    } else {
      // Array of primitives (string[], number[], etc.) -> use appropriate input
      return {
        name: propertyName,
        label: capitalize(propertyName),
        inputType: 'input', // Changed from checkbox to input for array of primitives
        required: false,
        properties: {
          placeholder: `Enter ${propertyName} (comma-separated)`
        }
      };
    }
  }
  
  // Handle nested objects
  if (typeof propertyType === 'function' && propertyType.prototype) {
    if (isRecursiveType(propertyType, classType)) {
      // Recursive reference -> use simple input for ID/reference
      return {
        name: propertyName,
        label: capitalize(propertyName),
        inputType: 'input',
        required: false,
        properties: {
          placeholder: `Enter ${propertyType.name} ID or reference`
        }
      };
    } else {
      // Regular nested object -> use xingine's object type
      // Check if already visited to prevent infinite recursion
      if (visited.has(propertyType)) {
        return {
          name: propertyName,
          label: capitalize(propertyName),
          inputType: 'object',
          required: false,
          properties: {
            fields: [] // Empty to prevent infinite recursion
          }
        };
      }
      
      return {
        name: propertyName,
        label: capitalize(propertyName),
        inputType: 'object',
        required: false,
        properties: {
          fields: extractFormMetaFromClass(propertyType, depth + 1, visited).fields
        }
      };
    }
  }
  
  // Enhanced object detection for cases where propertyType might not be properly detected
  if (sampleValue && typeof sampleValue === 'object' && !Array.isArray(sampleValue) && !(sampleValue instanceof Date)) {
    const objectType = sampleValue.constructor;
    if (objectType && objectType !== Object) {
      if (isRecursiveType(objectType, classType)) {
        return {
          name: propertyName,
          label: capitalize(propertyName),
          inputType: 'input',
          required: false,
          properties: {
            placeholder: `Enter ${objectType.name} ID or reference`
          }
        };
      } else {
        if (visited.has(objectType)) {
          return {
            name: propertyName,
            label: capitalize(propertyName),
            inputType: 'object',
            required: false,
            properties: {
              fields: [] // Empty to prevent infinite recursion
            }
          };
        }
        
        return {
          name: propertyName,
          label: capitalize(propertyName),
          inputType: 'object',
          required: false,
          properties: {
            fields: extractFormMetaFromClass(objectType, depth + 1, visited).fields
          }
        };
      }
    }
  }
  
  // Handle primitives with enhanced detection
  const finalInputType = emptyDecorator ? inferredInputType : inferredInputType;
  
  return {
    name: propertyName,
    label: capitalize(propertyName),
    inputType: finalInputType,
    required: false,
    properties: getDefaultPropertiesForInputType(finalInputType)
  };
}

/**
 * Infers a table column from a property
 */
function inferTableColumn(propertyName: string, classType: ClassConstructor): ColumnMeta {
  const propertyType = Reflect.getMetadata('design:type', classType.prototype, propertyName);
  
  return {
    title: capitalize(propertyName),
    dataIndex: propertyName,
    key: propertyName,
    sortable: propertyType === Number || propertyType === Date || propertyType === String
  };
}

/**
 * Infers a detail field from a property
 */
function inferDetailField(propertyName: string, classType: ClassConstructor): DetailFieldMeta {
  const propertyType = Reflect.getMetadata('design:type', classType.prototype, propertyName);
  
  // Try to get a sample instance to analyze the actual value
  let sampleValue: any;
  try {
    const instance = new classType();
    sampleValue = (instance as any)[propertyName];
  } catch {
    sampleValue = undefined;
  }
  
  let inputType: DetailFieldMeta['inputType'] = 'text';
  
  // Enhanced type detection
  if (propertyType === Date || sampleValue instanceof Date) {
    inputType = 'date';
  } else if (propertyType === Boolean || typeof sampleValue === 'boolean') {
    inputType = 'badge';
  } else if (propertyType === Number || typeof sampleValue === 'number') {
    inputType = 'number';
  }
  
  return {
    name: propertyName,
    label: capitalize(propertyName),
    inputType: inputType
  };
}