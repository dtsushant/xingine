# Layout Exposition System

A comprehensive component registry and layout composition system for optimal component reuse across multiple layouts.

## Overview

The Layout Exposition System provides a robust architecture for managing reusable layout components through a centralized registry pattern. It enables developers to define components once and compose them into multiple layouts with type safety and validation.

## Key Features

- **Component Registry**: Centralized registration and management of layout components
- **Type-Safe Layouts**: TypeScript support for layout definitions with compile-time validation
- **Component Reuse**: Register once, use in multiple layouts
- **Flexible Builders**: Multiple builder patterns for different use cases
- **Validation System**: Runtime validation of layout definitions
- **Factory Pattern**: Factory functions for streamlined layout creation
- **Registry Merging**: Combine multiple registries for modular architectures

## Core Types

### TypedLayoutExposition
```typescript
interface TypedLayoutExposition {
  presidium?: string;      // Header component key
  assembly?: string[];     // Content component keys
  sider?: string;         // Sidebar component key
}
```

### LayoutComponentRegistry
```typescript
interface LayoutComponentRegistry {
  register(key: string, component: LayoutComponentDetail | Commissar): void;
  get(key: string): LayoutComponentDetail | Commissar | undefined;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  getKeys(): string[];
  getAll(): LayoutExpositionMap;
}
```

## Usage Examples

### Basic Usage

```typescript
import { layoutUtils } from './utils/layout-exposition.util';

// Register reusable components
layoutUtils.register('header', {
  meta: { 
    component: 'HeaderRenderer', 
    properties: { title: 'My App' } 
  }
});

layoutUtils.register('content', {
  meta: { 
    component: 'ContentRenderer', 
    properties: { layout: 'grid' } 
  }
});

// Define layout
const layout: TypedLayoutExposition = {
  presidium: 'header',
  assembly: ['content']
};

// Build renderer
const renderer = layoutUtils.buildRenderer(layout, { type: 'main-layout' });
```

### Advanced Usage with Custom Registry

```typescript
import { LayoutComponentRegistryImpl, LayoutExpositionUtils } from './utils/layout-exposition.util';

// Create custom registry
const registry = new LayoutComponentRegistryImpl();

// Register components
registry.register('custom-header', {
  meta: { component: 'HeaderRenderer', properties: { theme: 'dark' } }
});

registry.register('dashboard', {
  path: '/dashboard',
  permission: ['dashboard.read'],
  meta: { component: 'DashboardRenderer', properties: {} }
} as Commissar);

// Define layout
const layout: TypedLayoutExposition = {
  presidium: 'custom-header',
  assembly: ['dashboard']
};

// Build with custom registry
const renderer = LayoutExpositionUtils.buildRenderer(
  layout, 
  registry.getAll(),
  { type: 'dashboard-layout' }
);
```

### Factory Pattern

```typescript
import { LayoutExpositionUtils } from './utils/layout-exposition.util';

// Create factory from registry
const factory = LayoutExpositionUtils.createFactory(registry);

// Use factory to build layouts
const renderer = factory(layout, { type: 'themed-layout' });
```

### Validation

```typescript
import { LayoutExpositionUtils } from './utils/layout-exposition.util';

// Validate layout against registry
const validation = LayoutExpositionUtils.validate(layout, registry.getAll());

if (validation.isValid) {
  console.log('Layout is valid');
} else {
  console.log('Validation errors:', validation.errors);
}
```

### Registry Merging

```typescript
import { LayoutExpositionUtils } from './utils/layout-exposition.util';

// Merge multiple registries
const mergedRegistry = LayoutExpositionUtils.mergeRegistries(
  baseRegistry, 
  featureRegistry, 
  themeRegistry
);
```

## API Reference

### LayoutComponentRegistryImpl

The main implementation of the component registry interface.

**Methods:**
- `register(key: string, component: LayoutComponentDetail | Commissar): void`
- `get(key: string): LayoutComponentDetail | Commissar | undefined`
- `has(key: string): boolean`
- `delete(key: string): boolean`
- `clear(): void`
- `size(): number`
- `getKeys(): string[]`
- `getAll(): LayoutExpositionMap`

### LayoutExpositionUtils

Static utility class for layout operations.

**Methods:**
- `buildRenderer(layout, registry, options?): LayoutRenderer`
- `buildExpositionRenderer(layout, registry, options?): ExpositionLayoutRenderer`
- `validate(layout, registry): ValidationResult`
- `createFactory(registry): LayoutFactory`
- `mergeRegistries(...registries): LayoutComponentRegistryImpl`

### layoutUtils

Convenience object using a default registry instance.

**Methods:**
- `register(key, component): void`
- `get(key): LayoutComponentDetail | Commissar | undefined`
- `has(key): boolean`
- `delete(key): boolean`
- `clear(): void`
- `size(): number`
- `getKeys(): string[]`
- `getAll(): LayoutExpositionMap`
- `buildRenderer(layout, options?): LayoutRenderer`
- `buildExpositionRenderer(layout, options?): ExpositionLayoutRenderer`
- `validate(layout): ValidationResult`
- `createFactory(): LayoutFactory`

## Best Practices

1. **Component Naming**: Use descriptive, hierarchical names for components (e.g., 'admin-header', 'user-dashboard')

2. **Registry Organization**: Create separate registries for different application domains when needed

3. **Reusability**: Design components to be reusable across different layouts by using flexible properties

4. **Validation**: Always validate layouts before building renderers in production code

5. **Type Safety**: Use TypeScript interfaces to ensure compile-time safety

6. **Testing**: Write comprehensive tests for custom registries and layout compositions

## Integration

The Layout Exposition System integrates seamlessly with the existing Xingine architecture:

- Uses existing `LayoutComponentDetail` and `Commissar` types
- Compatible with current `LayoutRenderer` and `ExpositionLayoutRenderer` builders
- Extends existing type system without breaking changes
- Works with current validation and builder patterns

## Examples

See `layout-exposition.examples.ts` for comprehensive usage examples including:
- Basic component registration and layout building
- Advanced custom registry usage
- Factory pattern implementation
- Registry merging strategies
- Validation workflows

## Testing

The system includes comprehensive test coverage with 28 test cases covering:
- Component registration and retrieval
- Registry management operations
- Layout validation
- Builder pattern usage
- Factory function creation
- Registry merging
- Error handling scenarios

Run tests with:
```bash
npm test
```
