# Xingine

A powerful TypeScript library that provides decorators, types, and utilities to dynamically generate and manage UI components from backend metadata. Xingine enables you to build data-driven user interfaces with comprehensive form rendering, validation, and component management capabilities.

## Features

- 🎯 **Decorator-based Configuration** - Define UI components using TypeScript decorators
- 🔧 **Rich Form Components** - Support for 14+ input types with comprehensive properties
- ✅ **Built-in Validation** - Form field validation with customizable rules
- 🏗️ **Component Rendering** - FormRenderer, TableRenderer, DetailRenderer, TabRenderer, and ChartRenderer
- 📝 **Type Safety** - Full TypeScript support with runtime type checking
- 🔄 **Runtime Decoding** - Robust decoders for runtime validation and type safety
- 🏗️ **Fluent Builder API** - Intuitive builder pattern for creating complex layouts with recursive nesting support

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

### File Input Field (`file`)

File upload input with comprehensive validation and configuration options.

```typescript
@FormField({
  label: 'Profile Picture',
  inputType: 'file',
  required: true,
  properties: {
    allowedFileTypes: ['.jpg', '.jpeg', '.png'],
    maxFileSizeMB: 5,
    maxFileCount: 1,
    captureFilename: true,
    captureUploadPath: true,
    allowDragDrop: true,
    placeholder: 'Upload your profile picture',
    fileTypeValidationMessage: 'Only JPG, JPEG, and PNG files are allowed',
    fileSizeValidationMessage: 'File size must be less than 5MB'
  }
})
profilePicture!: string;

@FormField({
  label: 'Supporting Documents',
  inputType: 'file',
  required: false,
  properties: {
    allowedFileTypes: ['application/pdf', '.doc', '.docx', '.txt'],
    maxFileSize: 10485760, // 10MB in bytes
    minFileCount: 0,
    maxFileCount: 5,
    captureFilename: true,
    captureUploadPath: true,
    allowDragDrop: true,
    placeholder: 'Upload supporting documents (optional)',
    fileCountValidationMessage: 'You can upload up to 5 documents'
  }
})
documents!: string[];
```

**FileInputProperties:**
- `allowedFileTypes?: string[]` - Array of allowed file extensions (e.g., ['.jpg', '.png']) or MIME types (e.g., ['image/jpeg', 'application/pdf'])
- `maxFileSize?: number` - Maximum file size in bytes (e.g., 5242880 for 5MB)
- `maxFileSizeMB?: number` - Maximum file size in megabytes (alternative to maxFileSize)
- `minFileCount?: number` - Minimum number of files required (defaults to 0)
- `maxFileCount?: number` - Maximum number of files allowed (defaults to 1)
- `required?: boolean` - Whether at least one file must be uploaded
- `disabled?: boolean` - Whether the input field is disabled
- `placeholder?: string` - Placeholder text when no files are selected
- `captureFilename?: boolean` - Whether to capture and store the original filename
- `captureUploadPath?: boolean` - Whether to capture and store the uploaded file path/URL
- `allowDragDrop?: boolean` - Whether to enable drag and drop functionality
- `fileTypeValidationMessage?: string` - Custom validation message for file type restrictions
- `fileSizeValidationMessage?: string` - Custom validation message for file size restrictions
- `fileCountValidationMessage?: string` - Custom validation message for file count restrictions

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

Xingine supports multiple component renderers with comprehensive rendering behavior customization:

### FormRenderer
Renders forms based on `@FormField` decorators.

### TableRenderer  
Renders data tables based on `@ColumnProperty` decorators.

### DetailRenderer
Renders read-only detail views based on `@DetailField` decorators.

### TabRenderer
Renders tabbed interfaces with nested components.

### ChartRenderer
Renders charts and data visualizations with enhanced rendering capabilities.

## Renderer Interface

The `Renderer` interface provides comprehensive control over UI element rendering behavior. It's fully serializable and can be used across all component types.

### Basic Renderer Configuration

```typescript
import { Renderer, ChartMeta } from 'xingine';

const basicRenderer: Renderer = {
  mode: 'detailed',
  layout: {
    display: 'grid',
    columns: 3,
    spacing: 16,
    alignment: 'center'
  },
  interaction: {
    clickable: true,
    hoverable: true,
    keyboardNavigable: true
  }
};
```

### Chart Renderer Integration

```typescript
const chartMeta: ChartMeta = {
  charts: [
    {
      type: 'bar',
      title: 'Sales Performance',
      datasets: [{
        label: 'Revenue',
        data: [100, 200, 150, 300]
      }],
      renderer: {
        mode: 'interactive',
        animation: {
          type: 'scale',
          duration: 400,
          animateOnMount: true
        },
        interaction: {
          clickable: true,
          hoverable: true
        }
      }
    }
  ],
  renderer: {
    layout: {
      display: 'grid',
      columns: 2,
      spacing: 20
    },
    display: {
      showBorder: true,
      borderRadius: 8,
      showShadow: true
    }
  }
};
```

### Responsive Renderer Configuration

```typescript
const responsiveRenderer: Renderer = {
  mode: 'adaptive',
  layout: {
    display: 'grid',
    columns: 4,
    spacing: 16
  },
  responsive: {
    breakpoints: {
      mobile: {
        mode: 'compact',
        layout: { 
          display: 'block',
          columns: 1 
        }
      },
      tablet: {
        layout: { columns: 2 }
      },
      desktop: {
        layout: { columns: 4 },
        display: { showBorder: true }
      }
    },
    hiddenOn: ['mobile'] // Hide on mobile devices
  }
};
```

### File Input Renderer Example

```typescript
@FormField({
  label: 'Document Upload',
  inputType: 'file',
  properties: {
    allowedFileTypes: ['.pdf', '.doc'],
    maxFileSizeMB: 10,
    renderer: {
      mode: 'dropzone',
      layout: {
        display: 'flex',
        alignment: 'center'
      },
      interaction: {
        draggable: true,
        hoverable: true
      },
      display: {
        showBorder: true,
        borderRadius: 8,
        backgroundColor: '#f9f9f9'
      },
      animation: {
        type: 'fade',
        duration: 200
      }
    }
  }
})
documents!: string[];
```

**Renderer Properties:**

- `mode?: string` - Rendering mode ('default', 'compact', 'detailed', 'interactive', etc.)
- `layout?: object` - Layout configuration
  - `display?: string` - Display type ('block', 'flex', 'grid', etc.)
  - `columns?: number` - Number of columns for grid layouts
  - `spacing?: string | number` - Spacing between elements
  - `alignment?: string` - Content alignment
- `interaction?: object` - Interaction behavior
  - `clickable?: boolean` - Whether element is clickable
  - `hoverable?: boolean` - Whether element supports hover effects
  - `draggable?: boolean` - Whether element supports drag and drop
  - `keyboardNavigable?: boolean` - Whether element supports keyboard navigation
- `display?: object` - Visual display properties
  - `showBorder?: boolean` - Whether to show borders
  - `showShadow?: boolean` - Whether to show shadows
  - `backgroundColor?: string` - Background color
  - `textColor?: string` - Text color
  - `borderRadius?: string | number` - Border radius for rounded corners
  - `opacity?: number` - Opacity level (0-1)
- `responsive?: object` - Responsive behavior configuration
  - `breakpoints?: object` - Responsive breakpoints for different screen sizes
  - `hiddenOn?: string[]` - Screen sizes where element should be hidden
- `animation?: object` - Animation and transition settings
  - `type?: string` - Animation type ('fade', 'slide', 'scale', 'none')
  - `duration?: number` - Animation duration in milliseconds
  - `easing?: string` - Animation easing function
  - `animateOnMount?: boolean` - Whether to animate on initial render
- `cssClasses?: string[]` - Custom CSS classes to apply
- `customStyles?: Record<string, string | number>` - Custom inline styles
- `accessibility?: object` - Accessibility configuration
  - `role?: string` - ARIA role
  - `ariaLabel?: string` - ARIA label for screen readers
  - `ariaDescription?: string` - ARIA description
  - `tabIndex?: number` - Tab index for keyboard navigation

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
- `FileInputProperties` - File input field properties with upload configuration
- `Renderer` - UI element rendering behavior configuration interface

### Validation Types

- `FieldValidationError` - Validation error structure
- `FormValidationResult` - Validation result structure

## Fluent Builder API

The Xingine library provides powerful fluent builder APIs for creating complex layouts with recursive nesting support. The builder pattern allows you to construct `LayoutComponentDetail` and `LayoutRenderer` instances with intuitive, chainable methods.

### Basic Usage

#### Creating Layout Components

```typescript
import { LayoutComponentDetailBuilder, LayoutRendererBuilder, TemplateBuilders } from 'xingine';

// Create a simple button
const button = LayoutComponentDetailBuilder.create()
  .button()
  .name('myButton')
  .content('Click Me')
  .className('btn btn-primary')
  .build();

// Create an input field
const input = LayoutComponentDetailBuilder.create()
  .input()
  .name('userInput')
  .placeholder('Enter your name...')
  .className('form-control')
  .build();

// Create a wrapper with children
const wrapper = LayoutComponentDetailBuilder.create()
  .wrapper()
  .className('container')
  .addChild(button)
  .addChild(input)
  .build();
```

#### Creating Layout Renderers

```typescript
// Create a complete layout
const layout = LayoutRendererBuilder.create()
  .type('tailwind')
  .className('min-h-screen bg-gray-100')
  .withHeader(headerComponent)
  .withContent(contentComponent)
  .withFooter(footerComponent)
  .build();

// Using fluent section builders
const fluentLayout = LayoutRendererBuilder.create()
  .type('dashboard')
  .header()
  .className('header-style')
  .wrapper()
  .className('nav-wrapper')
  .addChild(navButton)
  .build()
  .content()
  .className('main-content')
  .wrapper()
  .className('content-wrapper')
  .addChildren([contentElements])
  .build()
  .build();
```

### Recursive and Nested Support

The builder supports arbitrary depth and combinations of components:

```typescript
// Create deeply nested structure
const complexLayout = LayoutComponentDetailBuilder.create()
  .wrapper()
  .className('outer-container')
  .addChild(
    LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('middle-container')
      .addChild(
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('inner-container')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('deepButton')
              .content('Deep Button')
              .build()
          )
          .build()
      )
      .build()
  )
  .build();
```

### Dashboard Example

Create a complete dashboard layout with charts, forms, and tables:

```typescript
// Create chart component
const chartComponent = LayoutComponentDetailBuilder.create()
  .withMeta('ChartRenderer', {
    charts: [
      {
        type: 'bar',
        height: 300,
        width: 300,
        title: 'Sales Performance',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales',
            data: [4000, 3000, 2000, 2780, 1890, 2390],
            backgroundColor: '#1890ff',
          },
        ],
      },
    ],
  })
  .build();

// Create form component
const formComponent = LayoutComponentDetailBuilder.create()
  .withMeta('FormRenderer', {
    action: 'createUser',
    fields: [
      {
        name: 'name',
        label: 'Name',
        inputType: 'input',
        required: true,
        properties: {}
      },
      {
        name: 'email',
        label: 'Email',
        inputType: 'input',
        required: true,
        properties: {}
      }
    ]
  })
  .build();

// Create dashboard content with nested layout
const dashboardContent = LayoutComponentDetailBuilder.create()
  .wrapper()
  .className('grid grid-cols-1 lg:grid-cols-2 gap-6')
  .addChild(
    LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('chart-section')
      .style({
        background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
        padding: '16px',
        borderRadius: '8px',
      })
      .addChild(chartComponent)
      .build()
  )
  .addChild(
    LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('form-section')
      .addChild(formComponent)
      .build()
  )
  .build();

// Create complete dashboard
const dashboard = LayoutRendererBuilder.create()
  .type('tailwind')
  .className('min-h-screen')
  .withHeader(headerComponent)
  .withContent(dashboardContent)
  .build();
```

### Template Builders

Use pre-built templates for common layouts:

```typescript
// Create dashboard using templates
const dashboardLayout = TemplateBuilders.dashboardLayout()
  .withHeader(TemplateBuilders.defaultHeader())
  .withContent(TemplateBuilders.gridContentWrapper())
  .build();

// Create components using templates
const primaryButton = TemplateBuilders.primaryButton('action', 'Primary Action');
const secondaryButton = TemplateBuilders.secondaryButton('cancel', 'Cancel');
const standardInput = TemplateBuilders.standardInput('search', 'Search...');
const cardWrapper = TemplateBuilders.cardWrapper();
const alertMessage = TemplateBuilders.alert('success', 'Operation completed!');

// Create responsive grid
const responsiveGrid = TemplateBuilders.responsiveGrid(3); // 3 columns on large screens

// Create flex container
const flexContainer = TemplateBuilders.flexContainer('row', 'center');
```

### Available Builder Methods

#### LayoutComponentDetailBuilder

- `button()` - Creates a ButtonRenderer
- `input()` - Creates an InputRenderer  
- `wrapper()` - Creates a WrapperRenderer
- `form()` - Creates a FormRenderer
- `table()` - Creates a TableRenderer
- `chart()` - Creates a ChartRenderer
- `detailRenderer()` - Creates a DetailRenderer
- `conditional()` - Creates a ConditionalRenderer
- `popup()` - Creates a PopupRenderer
- `dynamic(componentName)` - Creates a dynamic/custom component with user-defined type
- `withMeta(component, properties)` - Sets custom component metadata

#### WrapperRendererBuilder

- `className(className)` - Sets CSS class
- `style(styles)` - Sets inline styles
- `content(content)` - Sets content text
- `addChild(child)` - Adds a single child component
- `addChildren(children)` - Adds multiple child components
- `addWrapper()` - Adds a nested wrapper
- `addButton()` - Adds a button child
- `addInput()` - Adds an input child

#### LayoutRendererBuilder

- `type(type)` - Sets layout type
- `className(className)` - Sets root CSS class
- `style(style)` - Sets root styles
- `header()` - Configures header section
- `content()` - Configures content section
- `sider()` - Configures sidebar section
- `footer()` - Configures footer section
- `withHeader(meta, style?)` - Sets header with pre-built component
- `withContent(meta, style?)` - Sets content with pre-built component
- `withSider(meta, style?)` - Sets sidebar with pre-built component
- `withFooter(meta, style?)` - Sets footer with pre-built component

#### Template Builders

- `TemplateBuilders.dashboardLayout()` - Creates dashboard layout
- `TemplateBuilders.defaultHeader()` - Creates default header
- `TemplateBuilders.primaryButton(name, content)` - Creates primary button
- `TemplateBuilders.secondaryButton(name, content)` - Creates secondary button
- `TemplateBuilders.standardInput(name, placeholder?)` - Creates standard input
- `TemplateBuilders.cardWrapper()` - Creates card wrapper
- `TemplateBuilders.gridContentWrapper()` - Creates grid wrapper
- `TemplateBuilders.responsiveGrid(columns)` - Creates responsive grid
- `TemplateBuilders.flexContainer(direction, justify)` - Creates flex container
- `TemplateBuilders.alert(type, message)` - Creates alert component
- `TemplateBuilders.loadingSpinner()` - Creates loading spinner

### Advanced Features

#### Conditional Rendering

```typescript
const conditionalComponent = LayoutComponentDetailBuilder.create()
  .withMeta('ConditionalRenderer', {
    condition: {
      field: 'user.isAdmin',
      operator: 'eq',
      value: true
    },
    trueComponent: adminButton,
    falseComponent: regularButton
  })
  .build();
```

#### Event Handling

```typescript
const interactiveButton = LayoutComponentDetailBuilder.create()
  .button()
  .name('actionButton')
  .content('Click Me')
  .event({
    onClick: 'handleButtonClick',
    onHover: 'handleHover'
  })
  .build();
```

#### Styling

```typescript
const styledComponent = LayoutComponentDetailBuilder.create()
  .wrapper()
  .className('custom-wrapper')
  .style({
    backgroundColor: '#f0f0f0',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  })
  .build();
```

### Recreating the Issue Sample Dashboard

Here's how to recreate the exact dashboard layout from the issue using the fluent builder:

```typescript
import { LayoutComponentDetailBuilder, LayoutRendererBuilder } from 'xingine';

// Create the complete dashboard layout
const createTailwindDashboardLayout = () => {
  // Create chart component with multiple charts
  const chartComponent = LayoutComponentDetailBuilder.create()
    .chart()
    .charts([
      {
        type: 'bar',
        height: 300,
        width: 300,
        title: 'Sales Performance',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sales',
            data: [4000, 3000, 2000, 2780, 1890, 2390],
            backgroundColor: '#1890ff',
          },
        ],
      },
      {
        type: 'line',
        title: 'User Growth',
        height: 300,
        width: 300,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Users',
            data: [240, 221, 229, 200, 218, 250],
            borderColor: '#52c41a',
          },
        ],
      },
      // ... more charts
    ])
    .build();

  // Create form component
  const formComponent = LayoutComponentDetailBuilder.create()
    .form()
    .action('handleUserCreate')
    .fields([
      { name: 'name', label: 'Name', inputType: 'input', required: true, properties: {} },
      { name: 'email', label: 'Email', inputType: 'input', required: true, properties: {} },
      { name: 'role', label: 'Role', inputType: 'select', required: true, properties: {} }
    ])
    .build();

  // Create table component
  const tableComponent = LayoutComponentDetailBuilder.create()
    .table()
    .dataSourceUrl('/api/users')
    .columns([
      { title: 'Name', dataIndex: 'name', sortable: true },
      { title: 'Email', dataIndex: 'email', sortable: true },
      { title: 'Role', dataIndex: 'role', sortable: true },
      { title: 'Status', dataIndex: 'active' },
      { title: 'Created', dataIndex: 'createdAt' },
    ])
    .build();

  // Create dashboard content with nested structure
  const dashboardContent = LayoutComponentDetailBuilder.create()
    .wrapper()
    .className('min-h-full max-w-full w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8')
    .addChild(
      // Charts Row
      LayoutComponentDetailBuilder.create()
        .wrapper()
        .className('grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8')
        .style({
          background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
          color: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
        })
        .addChild(chartComponent)
        .build()
    )
    .addChild(
      // Form and Table Row
      LayoutComponentDetailBuilder.create()
        .wrapper()
        .className('grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8')
        .addChild(tableComponent)
        .addChild(formComponent)
        .build()
    )
    .build();

  // Create header with navigation
  const headerComponent = LayoutComponentDetailBuilder.create()
    .wrapper()
    .className('h-16 px-4 flex items-center justify-between')
    .addChild(
      // Left section with menu buttons
      LayoutComponentDetailBuilder.create()
        .wrapper()
        .className('flex items-center space-x-4')
        .addChild(
          LayoutComponentDetailBuilder.create()
            .button()
            .name('collapseButton')
            .content('☰')
            .event({ onClick: 'headerActionContext.handleToggleCollapsed' })
            .className('p-2 rounded-md hover:bg-gray-100 transition-colors')
            .build()
        )
        .addChild(
          LayoutComponentDetailBuilder.create()
            .button()
            .name('HomeButton')
            .content('🏠')
            .className('p-2 rounded-md hover:bg-gray-100 transition-colors')
            .build()
        )
        .build()
    )
    .addChild(
      // Search section
      LayoutComponentDetailBuilder.create()
        .wrapper()
        .className('flex-1 max-w-md mx-4')
        .addChild(
          LayoutComponentDetailBuilder.create()
            .input()
            .name('search')
            .placeholder('Search with Icon...')
            .className('w-full h-10 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500')
            .build()
        )
        .build()
    )
    .build();

  // Create complete layout
  return LayoutRendererBuilder.create()
    .type('tailwind')
    .className('min-h-screen')
    .withHeader(headerComponent, {
      className: 'fixed top-0 left-0 right-0 h-16 z-50 shadow-sm'
    })
    .withContent(dashboardContent)
    .build();
};

// Usage
const dashboardLayout = createTailwindDashboardLayout();
console.log('Dashboard created:', dashboardLayout);
```

This example demonstrates:

- **Complex nesting**: Dashboard > Content > Rows > Sections > Components
- **Multiple component types**: Charts, Forms, Tables, Buttons, Inputs
- **Recursive structure**: Wrappers containing wrappers containing components
- **Flexible positioning**: Adding components at any level of the hierarchy
- **Rich styling**: CSS classes and inline styles
- **Event handling**: Button click handlers
- **Data binding**: Form fields, table columns, chart datasets

The fluent builder makes it easy to construct complex layouts that would otherwise require verbose JSON structures, while maintaining full type safety and IDE support.

### Component Types

- `FormMeta` - Form component metadata
- `TableMeta` - Table component metadata  
- `DetailMeta` - Detail component metadata
- `TabMeta` - Tab component metadata
- `ChartMeta` - Chart component metadata with enhanced renderer support
- `ChartConfig` - Individual chart configuration with optional renderer
- `ChartDataset` - Chart dataset structure
- `ChartType` - Supported chart types ('bar' | 'line' | 'pie' | 'scatter')

### Dynamic Components

The builder now supports creating dynamic/custom components that can be defined by end users. This allows for maximum flexibility in component creation while still maintaining the fluent API benefits.

#### Creating Dynamic Components

```typescript
import { LayoutComponentDetailBuilder } from 'xingine';

// Create a basic custom component
const customWidget = LayoutComponentDetailBuilder.create()
  .dynamic('MyCustomWidget')
  .name('widget1')
  .content('Custom Content')
  .className('custom-widget-style')
  .build();

// Add custom properties
const advancedComponent = LayoutComponentDetailBuilder.create()
  .dynamic('AdvancedDataGrid')
  .setProperties({
    columns: ['id', 'name', 'email', 'status'],
    dataSource: '/api/users',
    pagination: { pageSize: 20, showSizeChanger: true },
    sorting: { defaultSort: 'name', direction: 'asc' },
    filters: [
      { field: 'status', type: 'select', options: ['active', 'inactive'] },
      { field: 'name', type: 'text', placeholder: 'Search by name...' }
    ],
    customActions: ['export', 'import', 'bulk-edit']
  })
  .property('title', 'User Management Grid')
  .property('height', 600)
  .build();
```

#### Reusing Existing Component Types with Custom Properties

```typescript
// Use ButtonRenderer with additional custom properties
const enhancedButton = LayoutComponentDetailBuilder.create()
  .dynamic('ButtonRenderer')
  .setProperties({
    name: 'enhancedButton',
    content: 'Enhanced Click Me',
    customIcon: 'star',
    priority: 'high',
    analytics: {
      trackingId: 'btn_001',
      category: 'primary_actions',
      metadata: { source: 'dashboard', version: '2.1' }
    },
    accessibility: {
      ariaLabel: 'Enhanced action button',
      tabIndex: 1
    }
  })
  .className('enhanced-button')
  .build();
```

#### Dynamic Component Builder Methods

- `dynamic(componentName)` - Creates a dynamic component with the specified name
- `property(key, value)` - Sets a single property
- `setProperties(props)` - Sets multiple properties at once
- `name(name)` - Sets the name property (commonly used)
- `content(content)` - Sets the content property (commonly used)
- `className(className)` - Sets CSS class for styling
- `withEventBindings(eventBindings)` - Sets event bindings object
- `withStyleMeta(styleMeta)` - Sets style metadata object
- `eventBuilder()` - Returns EventBindingsBuilder for fluent event creation
- `styleBuilder()` - Returns StyleMetaBuilder for fluent style creation

#### Use Cases for Dynamic Components

1. **Custom UI Widgets**: Create specialized components not covered by built-in types
2. **Third-party Integrations**: Wrapper components for external libraries
3. **Business-specific Components**: Domain-specific components with custom properties
4. **Extended Built-ins**: Enhance existing component types with additional metadata
5. **Rapid Prototyping**: Quick component creation during development

The dynamic component feature leverages the `[K:string]:Record<string, unknown>` addition to `ComponentMetaMap`, allowing any string to be used as a component name while maintaining type safety for the properties.

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
