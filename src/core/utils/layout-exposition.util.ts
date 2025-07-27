import {
  LayoutComponentRegistry,
  LayoutExpositionMap,
  LayoutComponentDetail,
  Commissar,
  TypedLayoutExposition,
  LayoutRenderer
} from '../xingine.type';
import { StyleMeta } from '../expressions/style';

/**
 * Implementation of LayoutComponentRegistry for managing layout components
 */
export class LayoutComponentRegistryImpl implements LayoutComponentRegistry {
  private components: LayoutExpositionMap = {};

  /**
   * Register a layout component with a key
   */
  register(key: string, component: LayoutComponentDetail | Commissar): void {
    if (!key || key.trim() === '') {
      throw new Error('Component key cannot be empty');
    }
    if (this.components[key]) {
      console.warn(`[LayoutComponentRegistry] Key "${key}" already exists. Keeping the first registration and ignoring the new one.`);
      return;
    }
    this.components[key] = component;
  }

  /**
   * Get a layout component by key
   */
  get(key: string): LayoutComponentDetail | Commissar | undefined {
    return this.components[key];
  }

  /**
   * Check if a component exists in the registry
   */
  has(key: string): boolean {
    return key in this.components;
  }

  /**
   * Get all registered components
   */
  getAll(): LayoutExpositionMap {
    return { ...this.components };
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components = {};
  }

  /**
   * Delete a component by key
   */
  delete(key: string): boolean {
    if (this.has(key)) {
      delete this.components[key];
      return true;
    }
    return false;
  }

  /**
   * Get all registered keys
   */
  getKeys(): string[] {
    return Object.keys(this.components);
  }

  /**
   * Get the number of registered components
   */
  size(): number {
    return Object.keys(this.components).length;
  }
}

/**
 * Utility functions for layout exposition operations
 */
export class LayoutExpositionUtils {
  
  /**
   * Build a LayoutRenderer from TypedLayoutExposition and registry
   */
  static buildRenderer<T extends TypedLayoutExposition>(
    exposition: T,
    registry: LayoutExpositionMap,
    options?: { style?: StyleMeta }
  ): LayoutRenderer {
    // Validate all keys exist
    const validation = this.validate(exposition, registry);
    if (!validation.isValid) {
      throw new Error(`Missing components in registry: ${validation.missingKeys.join(', ')}`);
    }

    // Resolve components
    const presidium = exposition.presidium ? registry[exposition.presidium] : undefined;
    const assembly = exposition.assembly.map(key => registry[key]).filter(Boolean);
    const sider = exposition.sider ? registry[exposition.sider] : undefined;
    const doctrine = exposition.doctrine ? registry[exposition.doctrine] : undefined;

    // Build LayoutRenderer structure mapping:
    // presidium -> header, assembly -> content, sider -> sider, doctrine -> footer
    return {
      type: exposition.type,
      style: options?.style,
      header: presidium ? { meta: presidium } : undefined,
      content: { meta: assembly as Commissar[] }, // Cast as Commissar[] to match existing LayoutRenderer
      sider: sider ? { meta: sider } : undefined,
      footer: doctrine ? { meta: doctrine } : undefined,
    };
  }

  /**
   * Validate that all keys in TypedLayoutExposition exist in registry
   */
  static validate<T extends TypedLayoutExposition>(
    exposition: T,
    registry: LayoutExpositionMap
  ): { isValid: boolean; missingKeys: string[] } {
    const allKeys: string[] = [];
    
    // Collect all keys from exposition (cast to string as they're keyof LayoutExpositionMap)
    if (exposition.presidium) allKeys.push(String(exposition.presidium));
    if (exposition.assembly) allKeys.push(...exposition.assembly.map(String));
    if (exposition.sider) allKeys.push(String(exposition.sider));
    if (exposition.doctrine) allKeys.push(String(exposition.doctrine));

    // Find missing keys
    const missingKeys = allKeys.filter(key => !registry[key]);

    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  }

  /**
   * Create a factory function for building LayoutRenderer
   */
  static createFactory(registry: LayoutComponentRegistry): <T extends TypedLayoutExposition>(
    exposition: T,
    options?: { style?: StyleMeta }
  ) => LayoutRenderer {
    return <T extends TypedLayoutExposition>(
      exposition: T,
      options?: { style?: StyleMeta }
    ): LayoutRenderer => {
      return this.buildRenderer(exposition, registry.getAll(), options);
    };
  }

  /**
   * Merge multiple registries into one
   */
  static mergeRegistries(...registries: LayoutComponentRegistry[]): LayoutComponentRegistry {
    const merged = new LayoutComponentRegistryImpl();
    
    for (const registry of registries) {
      const components = registry.getAll();
      for (const [key, component] of Object.entries(components)) {
        merged.register(key, component);
      }
    }
    
    return merged;
  }

  /**
   * Create a registry from a map
   */
  static fromMap(map: LayoutExpositionMap): LayoutComponentRegistry {
    const registry = new LayoutComponentRegistryImpl();
    
    for (const [key, component] of Object.entries(map)) {
      registry.register(key, component);
    }
    
    return registry;
  }

  /**
   * Clone a registry
   */
  static cloneRegistry(registry: LayoutComponentRegistry): LayoutComponentRegistry {
    return this.fromMap(registry.getAll());
  }
}

/**
 * Default global registry instance
 */
export const defaultLayoutRegistry = new LayoutComponentRegistryImpl();

/**
 * Convenience functions using the default registry
 */
export const layoutUtils = {
  /**
   * Register a component in the default registry
   */
  register: (key: string, component: LayoutComponentDetail | Commissar) => 
    defaultLayoutRegistry.register(key, component),

  /**
   * Get a component from the default registry
   */
  get: (key: string) => defaultLayoutRegistry.get(key),

  /**
   * Check if a component exists in the default registry
   */
  has: (key: string) => defaultLayoutRegistry.has(key),

  /**
   * Delete a component from the default registry
   */
  delete: (key: string) => defaultLayoutRegistry.delete(key),

  /**
   * Get all components from the default registry
   */
  getAll: () => defaultLayoutRegistry.getAll(),

  /**
   * Get all keys from the default registry
   */
  getKeys: () => defaultLayoutRegistry.getKeys(),

  /**
   * Get the size of the default registry
   */
  size: () => defaultLayoutRegistry.size(),

  /**
   * Build a renderer using the default registry
   */
  buildRenderer: <T extends TypedLayoutExposition>(
    exposition: T,
    options?: { style?: StyleMeta }
  ) => LayoutExpositionUtils.buildRenderer(exposition, defaultLayoutRegistry.getAll(), options),

  /**
   * Validate an exposition using the default registry
   */
  validate: <T extends TypedLayoutExposition>(exposition: T) =>
    LayoutExpositionUtils.validate(exposition, defaultLayoutRegistry.getAll()),

  /**
   * Create a factory using the default registry
   */
  createFactory: () => LayoutExpositionUtils.createFactory(defaultLayoutRegistry),

  /**
   * Get the default registry
   */
  getRegistry: () => defaultLayoutRegistry,

  /**
   * Clear the default registry
   */
  clear: () => defaultLayoutRegistry.clear(),
};
