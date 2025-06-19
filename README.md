# Xingine

A powerful TypeScript library that provides decorators, types, and utilities to dynamically generate and manage UI components from backend metadata. Xingine enables you to build data-driven user interfaces with comprehensive form rendering, validation, and component management capabilities.

## Features

- 🎯 **Decorator-based Configuration** - Define UI components using TypeScript decorators
- 🔧 **Rich Form Components** - Support for 14+ input types with comprehensive properties
- ✅ **Built-in Validation** - Form field validation with customizable rules
- 🏗️ **Component Rendering** - FormRenderer, TableRenderer, DetailRenderer, TabRenderer, and ChartRenderer
- 📝 **Type Safety** - Full TypeScript support with runtime type checking
- 🔄 **Runtime Decoding** - Robust decoders for runtime validation and type safety

## Installation

```bash
npm install xingine
```

### Peer Dependencies

```bash
npm install decoders reflect-metadata
```

## Quick Start

```typescript
import 'reflect-metadata';
import { FormField, validateFormField } from 'xingine';

class UserRegistrationDto {
  @FormField({
    label: 'Email Address',
    inputType: 'input',
    required: true,
    properties: {
      email: true,
      placeholder: 'Enter your email',
      maxLength: 100
    }
  })
  email!: string;

  @FormField({
    label: 'Password',
    inputType: 'password',
    required: true,
    properties: {
      minLength: 8,
      hasStrengthMeter: true
    }
  })
  password!: string;
}

// Usage
const user = new UserRegistrationDto();
user.email = 'user@example.com';
user.password = 'securepassword';

const validationResult = validateFormField(user);
console.log(validationResult.isValid); // true or false
```

## Core Decorators

### @Provisioneer

A service controller decorator that acts as a centralized, state-assigned provision handler.

```typescript
import { Provisioneer, ProvisioneerProps } from 'xingine';

@Provisioneer({
  name: 'UserService',
  description: 'Handles user management operations',
  layoutMandate: {
    layout: 'default',
    structure: {
      presidium: 'users',
      assembly: 'management',
      doctrine: 'crud'
    }
  },
  clearance: [
    { name: 'user.read', description: 'Read user data' },
    { name: 'user.write', description: 'Write user data' }
  ]
})
class UserProvisioneer {
  // Service methods here
}
```

### @ModuleProperty

Define module-level properties and permissions.

```typescript
import { ModuleProperty } from 'xingine';

@ModuleProperty({
  description: 'User Management Module',
  permissions: [
    { name: 'user.create', description: 'Create users' },
    { name: 'user.edit', description: 'Edit users' },
    { name: 'user.delete', description: 'Delete users' }
  ],
  uiComponent: [{
    component: 'FormRenderer',
    path: '/users/create',
    roles: ['admin', 'manager']
  }]
})
class UserModule {
  // Module implementation
}
```

### @FormField

Define form field metadata with comprehensive properties.

```typescript
import { FormField } from 'xingine';

class ProductDto {
  @FormField({
    label: 'Product Name',
    inputType: 'input',
    required: true,
    properties: {
      placeholder: 'Enter product name',
      maxLength: 100,
      minLength: 3
    }
  })
  name!: string;
}
```

### @DetailField

Define detail view field metadata for read-only displays.

```typescript
import { DetailField } from 'xingine';

class UserDetailDto {
  @DetailField({
    label: 'User Status',
    inputType: 'badge',
    properties: {
      status: 'success',
      text: 'Active'
    }
  })
  status!: string;

  @DetailField({
    label: 'Registration Date',
    inputType: 'date',
    properties: {
      format: 'YYYY-MM-DD HH:mm:ss'
    }
  })
  createdAt!: string;
}
```

### @ColumnProperty

Define table column properties.

```typescript
import { ColumnProperty } from 'xingine';

class UserTableDto {
  @ColumnProperty({
    title: 'User ID',
    sortable: true,
    width: 100
  })
  id!: number;

  @ColumnProperty({
    title: 'Email',
    filterable: {
      apply: true,
      inputType: 'input'
    }
  })
  email!: string;
}
```

## Form Input Types & Properties

### Input Field (`input`)

Basic text input with validation options.

```typescript
@FormField({
  label: 'Username',
  inputType: 'input',
  required: true,
  properties: {
    placeholder: 'Enter username',
    maxLength: 50,
    minLength: 3,
    disabled: false,
    email: false, // Set to true for email validation
    validationRegex: '^[a-zA-Z0-9_]{3,50}$',
    regexValidationMessage: 'Username must contain only letters, numbers, and underscores'
  }
})
username!: string;
```

**InputTypeProperties:**
- `placeholder?: string` - Placeholder text
- `maxLength?: number` - Maximum character length
- `minLength?: number` - Minimum character length  
- `disabled?: boolean` - Whether the field is disabled
- `email?: boolean` - Enable email validation
- `validationRegex?: string` - Custom regex pattern
- `regexValidationMessage?: string` - Custom validation message

### Password Field (`password`)

Password input with strength validation.

```typescript
@FormField({
  label: 'Password',
  inputType: 'password',
  required: true,
  properties: {
    placeholder: 'Enter password',
    minLength: 8,
    hasStrengthMeter: true,
    disabled: false
  }
})
password!: string;
```

**PasswordTypeProperties:**
- `placeholder?: string` - Placeholder text
- `minLength?: number` - Minimum password length
- `hasStrengthMeter?: boolean` - Show password strength indicator
- `disabled?: boolean` - Whether the field is disabled

### Number Field (`number`)

Numeric input with range and precision controls.

```typescript
@FormField({
  label: 'Price',
  inputType: 'number',
  required: true,
  properties: {
    min: 0.01,
    max: 999999.99,
    step: 0.01,
    precision: 2,
    disabled: false
  }
})
price!: number;
```

**NumberTypeProperties:**
- `min?: number` - Minimum value
- `max?: number` - Maximum value
- `step?: number` - Step increment
- `precision?: number` - Decimal precision
- `disabled?: boolean` - Whether the field is disabled

### Select Field (`select`)

Dropdown selection with single or multiple options.

```typescript
@FormField({
  label: 'Country',
  inputType: 'select',
  required: true,
  properties: {
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'United Kingdom', value: 'uk' }
    ],
    multiple: false,
    disabled: false,
    placeholder: 'Select a country'
  }
})
country!: string;
```

**SelectTypeProperties:**
- `options: { label: string; value: string }[]` - Available options
- `multiple?: boolean` - Allow multiple selections
- `disabled?: boolean` - Whether the field is disabled
- `placeholder?: string` - Placeholder text

### Lookup Field (`lookup`)

Dynamic lookup with search and remote data fetching.

```typescript
@FormField({
  label: 'User Lookup',
  inputType: 'lookup',
  required: false,
  properties: {
    fetchAction: 'users/search',
    multiple: false,
    placeholder: 'Search for users...',
    disabled: false,
    allowSearch: true,
    allowAddNew: true,
    searchField: 'name',
    debounce: 300,
    createAction: 'users/create',
    resultMap: [
      { label: 'displayName', value: 'id' }
    ]
  }
})
userId!: string;
```

**LookupTypeProperties:**
- `fetchAction: string` - API endpoint for fetching options
- `multiple?: boolean` - Allow multiple selections
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Whether the field is disabled
- `allowSearch?: boolean` - Enable search functionality
- `allowAddNew?: boolean` - Allow creating new entries
- `searchField?: string` - Field to search on
- `debounce?: number` - Search debounce delay in ms
- `createAction?: string` - API endpoint for creating new entries
- `resultMap?: { label: string; value: string }[]` - Map API response to options

### Tree Select Field (`treeselect`)

Hierarchical tree selection.

```typescript
@FormField({
  label: 'Department',
  inputType: 'treeselect',
  required: true,
  properties: {
    treeData: [
      {
        title: 'Engineering',
        value: 'eng',
        children: [
          { title: 'Frontend', value: 'frontend' },
          { title: 'Backend', value: 'backend' }
        ]
      },
      {
        title: 'Marketing',
        value: 'marketing'
      }
    ],
    multiple: false,
    disabled: false,
    placeholder: 'Select department'
  }
})
department!: string;
```

**TreeSelectTypeProperties:**
- `treeData: TreeNode[]` - Hierarchical tree data
- `multiple?: boolean` - Allow multiple selections
- `disabled?: boolean` - Whether the field is disabled
- `placeholder?: string` - Placeholder text

### Switch Field (`switch`)

Boolean toggle switch.

```typescript
@FormField({
  label: 'Email Notifications',
  inputType: 'switch',
  required: false,
  properties: {
    checkedChildren: 'On',
    unCheckedChildren: 'Off',
    defaultChecked: true,
    disabled: false
  }
})
emailNotifications!: boolean;
```

**SwitchTypeProperties:**
- `checkedChildren?: string` - Text when checked
- `unCheckedChildren?: string` - Text when unchecked
- `defaultChecked?: boolean` - Default state
- `disabled?: boolean` - Whether the field is disabled

### Checkbox Field (`checkbox`)

Single or multiple checkbox options.

```typescript
@FormField({
  label: 'Skills',
  inputType: 'checkbox',
  required: false,
  properties: {
    options: [
      { label: 'JavaScript', value: 'js', checked: false },
      { label: 'TypeScript', value: 'ts', checked: true },
      { label: 'React', value: 'react', checked: false }
    ],
    fetchAction: 'skills/list', // Optional: fetch from API
    disabled: false
  }
})
skills!: string[];
```

**CheckboxTypeProperties:**
- `options?: CheckboxOption[]` - Checkbox options
- `fetchAction?: string` - API endpoint to fetch options
- `label?: string` - Single checkbox label
- `checked?: boolean` - Single checkbox state
- `disabled?: boolean` - Whether the field is disabled

### Nested Checkbox Field (`nestedcheckbox`)

Hierarchical checkbox tree structure.

```typescript
@FormField({
  label: 'Permissions',
  inputType: 'nestedcheckbox',
  required: false,
  properties: {
    options: [
      {
        label: 'User Management',
        value: 'users',
        children: [
          { label: 'Create Users', value: 'users.create' },
          { label: 'Edit Users', value: 'users.edit' },
          { label: 'Delete Users', value: 'users.delete' }
        ]
      }
    ],
    fetchAction: 'permissions/tree'
  }
})
permissions!: string[];
```

**NestedCheckboxTypeProperties:**
- `options?: NestedCheckboxOption[]` - Hierarchical checkbox options
- `fetchAction?: string` - API endpoint to fetch options

### Date Field (`date`)

Date picker with formatting options.

```typescript
@FormField({
  label: 'Birth Date',
  inputType: 'date',
  required: true,
  properties: {
    format: 'YYYY-MM-DD',
    showTime: false,
    disabledDate: (date: string) => new Date(date) > new Date(),
    disabled: false
  }
})
birthDate!: string;
```

**DateTypeProperties:**
- `format?: string` - Date format pattern
- `showTime?: boolean` - Include time picker
- `disabledDate?: (date: string) => boolean` - Function to disable specific dates
- `disabled?: boolean` - Whether the field is disabled

### Textarea Field (`textarea`)

Multi-line text input.

```typescript
@FormField({
  label: 'Description',
  inputType: 'textarea',
  required: false,
  properties: {
    rows: 4,
    maxLength: 500,
    placeholder: 'Enter description...',
    disabled: false
  }
})
description!: string;
```

**TextareaTypeProperties:**
- `rows?: number` - Number of visible rows
- `maxLength?: number` - Maximum character length
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Whether the field is disabled

### Button Field (`button`)

Interactive button with action handlers.

```typescript
@FormField({
  label: 'Submit Form',
  inputType: 'button',
  required: false,
  properties: {
    text: 'Submit',
    type: 'primary',
    disabled: false,
    onClickAction: 'form.submit'
  }
})
submitButton!: void;
```

**ButtonTypeProperties:**
- `text: string` - Button display text
- `type?: ButtonView` - Button style ('primary' | 'default' | 'dashed' | 'link' | 'text')
- `disabled?: boolean` - Whether the button is disabled
- `onClickAction?: string` - Action handler identifier

### Object Field (`object`)

Nested object with sub-fields.

```typescript
@FormField({
  label: 'Address',
  inputType: 'object',
  required: true,
  properties: {
    fields: [
      {
        name: 'street',
        label: 'Street',
        inputType: 'input',
        required: true,
        properties: { maxLength: 100 }
      },
      {
        name: 'city',
        label: 'City',
        inputType: 'input',
        required: true,
        properties: { maxLength: 50 }
      },
      {
        name: 'zipCode',
        label: 'ZIP Code',
        inputType: 'input',
        required: true,
        properties: { maxLength: 10 }
      }
    ]
  }
})
address!: {
  street: string;
  city: string;
  zipCode: string;
};
```

**ObjectFieldProperties:**
- `fields: FieldMeta[]` - Array of nested field definitions

### Object Array Field (`object[]`)

Array of objects with repeatable sub-fields.

```typescript
@FormField({
  label: 'Phone Numbers',
  inputType: 'object[]',
  required: false,
  properties: {
    itemFields: [
      {
        name: 'type',
        label: 'Type',
        inputType: 'select',
        required: true,
        properties: {
          options: [
            { label: 'Mobile', value: 'mobile' },
            { label: 'Home', value: 'home' },
            { label: 'Work', value: 'work' }
          ]
        }
      },
      {
        name: 'number',
        label: 'Number',
        inputType: 'input',
        required: true,
        properties: { maxLength: 20 }
      }
    ]
  }
})
phoneNumbers!: Array<{
  type: string;
  number: string;
}>;
```

**ObjectListFieldProperties:**
- `itemFields: FieldMeta[]` - Array of field definitions for each item

## Detail Input Types

Detail fields are used for read-only data display. Here are the available types:

### Text Detail (`text`)
```typescript
@DetailField({
  label: 'User Name',
  inputType: 'text',
  properties: {
    placeholder: 'No name provided'
  }
})
name!: string;
```

### Date Detail (`date`)
```typescript
@DetailField({
  label: 'Created At',
  inputType: 'date',
  properties: {
    format: 'MMMM DD, YYYY'
  }
})
createdAt!: string;
```

### Badge Detail (`badge`)
```typescript
@DetailField({
  label: 'Status',
  inputType: 'badge',
  properties: {
    status: 'success', // 'success' | 'processing' | 'error' | 'default' | 'warning'
    text: 'Active'
  }
})
status!: string;
```

### Tag Detail (`tag`)
```typescript
@DetailField({
  label: 'Category',
  inputType: 'tag',
  properties: {
    color: 'blue'
  }
})
category!: string;
```

## Validation

Xingine provides built-in validation utilities:

```typescript
import { validateFormField, FieldValidationError, FormValidationResult } from 'xingine';

class UserDto {
  @FormField({
    label: 'Email',
    inputType: 'input',
    required: true,
    properties: {
      email: true,
      minLength: 5,
      maxLength: 100
    }
  })
  email!: string;
}

const user = new UserDto();
user.email = 'invalid-email';

const result: FormValidationResult = validateFormField(user);

if (!result.isValid) {
  result.errors.forEach((error: FieldValidationError) => {
    console.log(`${error.field}: ${error.message}`);
  });
}
```

## Component Renderers

Xingine supports multiple component renderers:

### FormRenderer
Renders forms based on `@FormField` decorators.

### TableRenderer  
Renders data tables based on `@ColumnProperty` decorators.

### DetailRenderer
Renders read-only detail views based on `@DetailField` decorators.

### TabRenderer
Renders tabbed interfaces with nested components.

### ChartRenderer
Renders charts and data visualizations.

## Advanced Usage

### Using with Decoders

```typescript
import { formMetaDecoder, componentMetaDecoder } from 'xingine';

// Decode form metadata from JSON
const formMeta = formMetaDecoder.verify(jsonData);

// Decode component metadata
const componentMeta = componentMetaDecoder().verify(componentData);
```

### Runtime Form Generation

```typescript
import { generateFormMeta } from 'xingine';

const formMeta = generateFormMeta(UserDto);
console.log(formMeta.fields); // Array of field metadata
```

### Custom Validation Messages

```typescript
@FormField({
  label: 'Username',
  inputType: 'input',
  required: true,
  properties: {
    validationRegex: '^[a-zA-Z0-9_]{3,20}$',
    regexValidationMessage: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
  }
})
username!: string;
```

## API Reference

### Core Types

- `FieldMeta<T>` - Form field metadata interface
- `DetailFieldMeta<T>` - Detail field metadata interface  
- `ColumnMeta` - Table column metadata interface
- `FieldInputTypeProperties` - Union type of all form input properties
- `DetailInputTypeProperties` - Union type of all detail input properties

### Validation Types

- `FieldValidationError` - Validation error structure
- `FormValidationResult` - Validation result structure

### Component Types

- `FormMeta` - Form component metadata
- `TableMeta` - Table component metadata  
- `DetailMeta` - Detail component metadata
- `TabMeta` - Tab component metadata
- `ChartMeta` - Chart component metadata

## TypeScript Configuration

Make sure to include the following in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
