import { ConditionalExpression } from "./operators";

/**
 * Base interface for data providers that supply data to conditional expressions
 */
export interface DataProvider {
  /**
   * Unique identifier for the provider type
   */
  type: string;
  
  /**
   * Gets the current data from this provider
   */
  getData(): Record<string, unknown>;
}

/**
 * Form data provider that supplies form field values for conditional rendering
 */
export interface FormDataProvider extends DataProvider {
  type: 'form';
  
  /**
   * Gets the current form data as key-value pairs
   */
  getData(): Record<string, unknown>;
  
  /**
   * Gets a specific field value from the form
   */
  getFieldValue(fieldName: string): unknown;
  
  /**
   * Checks if a field has a specific value
   */
  hasFieldValue(fieldName: string, value: unknown): boolean;
}

/**
 * Context data provider that supplies global/context state for conditional rendering
 */
export interface ContextDataProvider extends DataProvider {
  type: 'context';
  
  /**
   * Gets the current context data
   */
  getData(): Record<string, unknown>;
  
  /**
   * Gets a specific context value
   */
  getContextValue(key: string): unknown;
}

/**
 * Configuration for conditional field rendering
 */
export interface ConditionalRenderConfig {
  /**
   * The condition expression to evaluate
   */
  condition: ConditionalExpression;
  
  /**
   * Optional data provider to use for the condition evaluation
   * If not specified, defaults to current form data
   */
  provider?: DataProvider;
}

/**
 * Factory for creating data providers
 */
export class DataProviderFactory {
  private static providers: Map<string, (config: unknown) => DataProvider> = new Map();
  
  /**
   * Registers a data provider factory function
   */
  static register(type: string, factory: (config: unknown) => DataProvider): void {
    this.providers.set(type, factory);
  }
  
  /**
   * Creates a data provider of the specified type
   */
  static create(type: string, config: unknown = {}): DataProvider {
    const factory = this.providers.get(type);
    if (!factory) {
      throw new Error(`No provider factory registered for type: ${type}`);
    }
    return factory(config);
  }
  
  /**
   * Gets all registered provider types
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Default form data provider implementation
export class DefaultFormDataProvider implements FormDataProvider {
  type: 'form' = 'form';
  private formData: Record<string, unknown> = {};
  
  constructor(initialData: Record<string, unknown> = {}) {
    this.formData = { ...initialData };
  }
  
  getData(): Record<string, unknown> {
    return { ...this.formData };
  }
  
  getFieldValue(fieldName: string): unknown {
    return this.formData[fieldName];
  }
  
  hasFieldValue(fieldName: string, value: unknown): boolean {
    return this.formData[fieldName] === value;
  }
  
  /**
   * Updates the form data (typically called when form values change)
   */
  updateFormData(data: Record<string, unknown>): void {
    this.formData = { ...this.formData, ...data };
  }
  
  /**
   * Sets a specific field value
   */
  setFieldValue(fieldName: string, value: unknown): void {
    this.formData[fieldName] = value;
  }
}

// Register the default form data provider
DataProviderFactory.register('form', (config: unknown) => {
  const initialData = (config as { initialData?: Record<string, unknown> })?.initialData || {};
  return new DefaultFormDataProvider(initialData);
});

// Default context data provider implementation
export class DefaultContextDataProvider implements ContextDataProvider {
  type: 'context' = 'context';
  private contextData: Record<string, unknown> = {};
  
  constructor(initialData: Record<string, unknown> = {}) {
    this.contextData = { ...initialData };
  }
  
  getData(): Record<string, unknown> {
    return { ...this.contextData };
  }
  
  getContextValue(key: string): unknown {
    return this.contextData[key];
  }
  
  /**
   * Updates the context data
   */
  updateContextData(data: Record<string, unknown>): void {
    this.contextData = { ...this.contextData, ...data };
  }
}

// Register the default context data provider
DataProviderFactory.register('context', (config: unknown) => {
  const initialData = (config as { initialData?: Record<string, unknown> })?.initialData || {};
  return new DefaultContextDataProvider(initialData);
});
