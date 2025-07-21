# Xingine Class-to-Component Conversion

This document describes the new class-to-component conversion functionality that allows automatic generation of form, table, detail, and chart components from TypeScript classes using decorators and intelligent type inference.

## Overview

The class-to-component conversion system provides:

- 🏗️ **Class decorators** for automatic component generation (@FormClass, @TableClass, etc.)
- 🔧 **Enhanced builders** that accept class types and auto-convert to LayoutComponentDetail
- 🧠 **Intelligent property type inference** and default value assignment
- 🎨 **Property-level decorators** for fine-grained control
- 📐 **Support for nested objects, arrays, and complex types**

## Quick Start

### 1. Basic Usage with Auto-Inference

```typescript
import { LayoutComponentDetailBuilder, extractFormMetaFromClass } from 'xingine';

// Simple class without decorators
class UserDto {
  id: number = 0;
  name: string = '';
  email: string = '';
  age: number = 0;
  isActive: boolean = false;
  createdAt: Date = new Date();
}

// Generate form automatically
const userForm = LayoutComponentDetailBuilder.create()
  .formFromClass(UserDto)
  .build();

// Or use static method
const quickForm = LayoutComponentDetailBuilder.fromClass(UserDto).build();
```

### 2. Enhanced with Decorators

```typescript
import { FormClass, FormField, TableClass, TableColumn } from 'xingine';

@FormClass({
  title: 'User Registration',
  submitLabel: 'Create User',
  action: 'createUser'
})
class CreateUserDto {
  @FormField({ 
    inputType: 'input', 
    required: true, 
    placeholder: 'Enter username' 
  })
  username: string = '';

  @FormField({ 
    inputType: 'input', 
    required: true 
  })
  email: string = '';

  // Auto-inferred fields (no decorators needed)
  firstName: string = '';    // → input field
  lastName: string = '';     // → input field  
  age: number = 0;           // → number input
  isActive: boolean = false; // → switch field
  birthDate: Date = new Date(); // → date field
}

// Usage
const userForm = LayoutComponentDetailBuilder.create()
  .formFromClass(CreateUserDto)
  .build();
```

## Class Decorators

### @FormClass

Marks a class for form component generation.

```typescript
@FormClass({
  title?: string;
  submitLabel?: string;
  resetLabel?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  action?: string;
  validation?: {
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    showErrorSummary?: boolean;
  };
})
class MyFormDto { ... }
```

### @TableClass

Marks a class for table component generation.

```typescript
@TableClass({
  title?: string;
  dataSourceUrl?: string;
  pagination?: { pageSize?: number; showSizeChanger?: boolean };
  searchable?: boolean;
  exportable?: boolean;
})
class MyTableDto { ... }
```

### @DetailClass

Marks a class for detail view component generation.

```typescript
@DetailClass({
  title?: string;
  layout?: 'horizontal' | 'vertical';
  bordered?: boolean;
  copyable?: boolean;
})
class MyDetailDto { ... }
```

### @ChartClass

Marks a class for chart component generation.

```typescript
@ChartClass({
  title?: string;
  type?: 'mixed' | 'line' | 'bar' | 'pie';
  responsive?: boolean;
})
class MyChartDto { ... }
```

## Property Decorators

### @FormField

Customizes form field generation for a property.

```typescript
@FormField({
  inputType?: 'input' | 'number' | 'select' | 'switch' | 'date' | 'textarea' | 'object' | 'object[]' | ...;
  label?: string;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[] | 'auto';
  validation?: ValidationRule;
})
propertyName: Type;
```

### @TableColumn

Customizes table column generation for a property.

```typescript
@TableColumn({
  title?: string;
  width?: number;
  sortable?: boolean;
  filterable?: FilterConfig;
  render?: 'default' | 'custom' | 'date' | 'currency' | 'badge';
})
propertyName: Type;
```

### @DetailField

Customizes detail field generation for a property.

```typescript
@DetailField({
  label?: string;
  inputType?: 'text' | 'avatar' | 'date' | 'badge' | 'tag';
  copyable?: boolean;
  span?: number;
})
propertyName: Type;
```

## Type Inference

The system automatically infers appropriate input types based on TypeScript types:

| TypeScript Type | Form Input Type | Table Column | Detail Field |
|-----------------|----------------|--------------|--------------|
| `string` | `input` | text column | `text` |
| `number` | `number` | sortable number | `number` |
| `boolean` | `switch` | boolean column | `badge` |
| `Date` | `date` | sortable date | `date` |
| `enum` | `select` | filterable | `text` |
| `NestedClass` | `object` | text column | `text` |
| `Array<NestedClass>` | `object[]` | text column | `text` |
| `Array<primitive>` | `checkbox` | text column | `text` |

## Advanced Examples

### Nested Objects

```typescript
class AddressDto {
  street: string = '';
  city: string = '';
  zipCode: string = '';
}

@FormClass({ title: 'User Profile' })
class UserProfileDto {
  @FormField({ required: true })
  name: string = '';

  // Automatically becomes an object field with nested form
  address: AddressDto = new AddressDto();
  
  // Array of objects becomes object[] field
  contacts: ContactDto[] = [];
}
```

### Enums with Options

```typescript
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

@FormClass({ title: 'User Management' })
class UserDto {
  // For reliable enum handling, use explicit decorator
  @FormField({
    inputType: 'select',
    options: [
      { label: 'Administrator', value: 'admin' },
      { label: 'Regular User', value: 'user' },
      { label: 'Moderator', value: 'moderator' }
    ]
  })
  role: UserRole = UserRole.USER;
}
```

### Dashboard Composition

```typescript
// Create complex dashboards with multiple class-based components
const userDashboard = LayoutComponentDetailBuilder.create()
  .wrapper()
  .className('user-dashboard')
  .addChild(
    LayoutComponentDetailBuilder.create()
      .formFromClass(CreateUserDto)
      .build()
  )
  .addChild(
    LayoutComponentDetailBuilder.create()
      .tableFromClass(UserTableDto)
      .build()
  )
  .addChild(
    LayoutComponentDetailBuilder.create()
      .detailFromClass(UserDetailDto)
      .build()
  )
  .build();
```

## Builder Methods

The `LayoutComponentDetailBuilder` now includes these class-aware methods:

### Instance Methods

- `formFromClass<T>(classType: ClassConstructor<T>)` - Creates form from class
- `tableFromClass<T>(classType: ClassConstructor<T>)` - Creates table from class  
- `detailFromClass<T>(classType: ClassConstructor<T>)` - Creates detail view from class
- `chartFromClass<T>(classType: ClassConstructor<T>)` - Creates chart from class

### Static Methods

- `LayoutComponentDetailBuilder.fromClass<T>(classType: ClassConstructor<T>)` - Creates form component directly

## Utility Functions

For advanced use cases, you can directly access the extraction functions:

```typescript
import { 
  extractFormMetaFromClass,
  extractTableMetaFromClass,
  extractDetailMetaFromClass,
  extractChartMetaFromClass 
} from 'xingine';

const formMeta = extractFormMetaFromClass(MyDto);
const tableMeta = extractTableMetaFromClass(MyDto);
const detailMeta = extractDetailMetaFromClass(MyDto);
const chartMeta = extractChartMetaFromClass(MyDto);
```

## Best Practices

### 1. Use Decorators for Critical Fields

```typescript
@FormClass({ title: 'User Registration' })
class UserDto {
  // Use decorators for important fields that need specific configuration
  @FormField({ required: true, placeholder: 'Enter email address' })
  email: string = '';

  // Let auto-inference handle simple fields
  firstName: string = '';
  lastName: string = '';
}
```

### 2. Leverage Type Inference

```typescript
// These will be automatically inferred correctly
class UserDto {
  id: number = 0;           // → number input
  name: string = '';        // → text input
  isActive: boolean = true; // → switch
  birthDate: Date = new Date(); // → date picker
}
```

### 3. Handle Complex Types Explicitly

```typescript
// For enums, arrays, and complex types, use explicit decorators
@FormField({
  inputType: 'select',
  options: [{ label: 'Option 1', value: 'opt1' }]
})
complexField: ComplexEnum;
```

### 4. Compose Components

```typescript
// Build complex UIs by composing class-based components
const complexUI = LayoutComponentDetailBuilder.create()
  .wrapper()
  .addChild(LayoutComponentDetailBuilder.fromClass(SearchDto).build())
  .addChild(LayoutComponentDetailBuilder.create().tableFromClass(ResultDto).build())
  .addChild(LayoutComponentDetailBuilder.create().detailFromClass(SelectedDto).build())
  .build();
```

## Limitations & Notes

1. **Enum Auto-Detection**: Due to TypeScript reflection limitations, enum auto-detection may not work reliably. Use explicit `@FormField` decorators for enum properties.

2. **Reflection Metadata**: Requires `reflect-metadata` to be imported and `experimentalDecorators: true` in TypeScript config.

3. **Compatibility**: All existing xingine functionality remains unchanged and fully compatible.

4. **Property Initialization**: Properties should be initialized with default values for better type inference.

## Migration Guide

Existing code will continue to work unchanged. To adopt the new functionality:

1. **Add reflection support** to your project:
   ```typescript
   import 'reflect-metadata';
   ```

2. **Start using class decorators** for new components:
   ```typescript
   @FormClass({ title: 'My Form' })
   class MyDto { ... }
   ```

3. **Replace manual builders** with class-based builders:
   ```typescript
   // Old way
   const form = LayoutComponentDetailBuilder.create()
     .form()
     .addField({ name: 'email', inputType: 'input' })
     .build();

   // New way
   const form = LayoutComponentDetailBuilder.fromClass(MyDto).build();
   ```

## Conclusion

The class-to-component conversion system significantly reduces boilerplate code while maintaining full flexibility through decorators. It provides intelligent defaults through type inference while allowing fine-grained control when needed.

This feature makes xingine more powerful and developer-friendly, enabling rapid UI development from existing TypeScript DTOs and models.