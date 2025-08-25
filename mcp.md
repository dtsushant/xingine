# Xingine Framework MCP Reference

## Overview
Xingine is a TypeScript framework for building dynamic UI components through decorators and builders. It provides a declarative approach to component creation with built-in validation, type safety, and expression handling.

## Core Architecture

### Component System
- **@XingineComponent**: Main decorator for component classes
- **@ComponentDetail**: Decorator for component properties
- **MetaMap**: Configuration objects for component behavior

### Builder Pattern
- **Base Builders**: Foundation for component creation
- **Layout Builders**: For UI structure and positioning  
- **Template Builders**: For reusable component templates
- **Action Builders**: For event handling and business logic

### Expression System
- **Operators**: Logical and comparison operations
- **Providers**: Data source connections
- **Context**: Runtime state management
- **Actions**: Event handlers and side effects

## API-Based Component Rendering

### Overview
Xingine supports dynamic component rendering through API calls that return validated component structures. This enables server-side component generation and dynamic UI composition.

### Core API Rendering Pattern
```typescript
// API endpoint returns LayoutComponentDetail structure
const apiRenderer = new ApiRenderer({
  actionUrl: '/api/components/dynamic',
  method: 'GET',
  context: { userId: '123' }
});
```

### API Response Structure
API endpoints must return data that validates against `LayoutComponentDetail`:
```typescript
interface LayoutComponentDetail {
  component: ComponentDetail;
  layout?: LayoutDetail;
  metadata: MetaMap;
  children?: LayoutComponentDetail[];
}
```

### Error Handling States
- **API Error**: Server returns error response (4xx/5xx)
- **Decoding Error**: Invalid component structure (422)
- **Network Error**: Connection failure (503)
- **Validation Error**: Request data validation failure

### Implementation Examples

#### Basic API Component
```typescript
export const DynamicPage = () => {
  return (
    <ApiRenderer
      actionUrl="/api/page-components"
      method="GET"
      context={{ pageId: router.query.id }}
      onComponentLoad={(component) => console.log('Loaded:', component)}
      onError={(error) => console.error('Error:', error)}
    />
  );
};
```

#### With Custom Error Handling
```typescript
const CustomErrorComponent = ({ error }) => (
  <div className="custom-error">
    <h2>{error.type} Error</h2>
    <p>{error.message}</p>
  </div>
);

export const RobustApiRenderer = () => {
  return (
    <ApiRenderer
      actionUrl="/api/dynamic-form"
      errorComponent={CustomErrorComponent}
      loadingComponent={CustomSpinner}
      fallbackComponent={DefaultForm}
    />
  );
};
```

#### Programmatic API Component Loading
```typescript
const MyComponent = () => {
  const { component, isLoading, error, loadComponent } = useApiComponent({
    actionUrl: '/api/user-dashboard',
    method: 'POST'
  });

  const handleLoadDashboard = async () => {
    try {
      const dashboardComponent = await loadComponent({
        userId: currentUser.id,
        preferences: userPreferences
      });
      // Component loaded successfully
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div>
      <button onClick={handleLoadDashboard}>Load Dashboard</button>
      {component && <RenderComponent {...component} />}
    </div>
  );
};
```

### Server-Side API Implementation
API endpoints should return validated xingine component structures:

```typescript
// Example API endpoint (Next.js)
export default async function handler(req, res) {
  try {
    const { userId } = req.query;
    
    // Generate component structure
    const componentData = {
      component: {
        type: 'form',
        selector: 'user-profile-form'
      },
      metadata: {
        type: 'form',
        className: 'profile-form',
        validation: ['required']
      },
      children: [
        {
          component: { type: 'input', selector: 'username' },
          metadata: { 
            type: 'input', 
            inputType: 'text',
            label: 'Username',
            required: true 
          }
        }
      ]
    };

    // Validate with xingine decoder before sending
    const validatedComponent = layoutComponentDetailDecoder.verify(componentData);
    
    res.status(200).json({
      success: true,
      result: validatedComponent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

## Key Imports

### Primary Builder Imports
```typescript
import { 
  BaseComponentDetailBuilder,
  LayoutComponentDetailBuilder,
  LayoutRendererBuilder,
  TemplateBuilder,
  ActionBuilder,
  EventBuilder,
  MetaBuilder
} from './core/builder';
```

### API Action Imports
```typescript
import {
  Actions,
  runAction,
  ApiMetaMap,
  LayoutComponentDetail,
  layoutComponentDetailDecoder
} from 'xingine';
```

### Component Meta Maps
```typescript
import {
  ButtonMetaMap,
  FormMetaMap,
  InputMetaMap,
  DetailMetaMap,
  ApiMetaMap,
  IconMetaMap,
  LinkMetaMap,
  MenuMetaMap,
  SvgMetaMap
} from './core/component';
```

### Decorators
```typescript
import {
  XingineComponent,
  ComponentDetail,
  ActionHandler,
  EventListener
} from './core/decorators';
```

### Expression System
```typescript
import {
  Expression,
  Operator,
  Provider,
  ActionExpression,
  StyleExpression
} from './core/expressions';
```

### Decoders
```typescript
import {
  ActionDecoder,
  ButtonDecoder,
  FormDecoder,
  InputDecoder,
  DetailDecoder,
  ApiComponentDecoder,
  layoutComponentDetailDecoder
} from './core/decoders';
```

### Utilities
```typescript
import {
  classToComponent,
  layoutExposition,
  typeInference,
  validation,
  extrapolateString
} from './core/utils';
```

## Component Creation Pattern

### Basic Component Structure
```typescript
@XingineComponent({
  selector: 'my-component',
  template: 'component-template',
  metadata: MyComponentMetaMap
})
export class MyComponent {
  @ComponentDetail({
    type: 'input',
    validation: ['required'],
    binding: 'bidirectional'
  })
  property: string;
}
```

### Builder Usage
```typescript
const component = new BaseComponentDetailBuilder()
  .withSelector('my-component')
  .withTemplate(templateBuilder)
  .withMetadata(metaMap)
  .withValidation(validationRules)
  .build();
```

### API Action Builder
```typescript
const apiAction = Actions.apiCall('/api/endpoint', 'POST', { data: 'value' })
  .withHeaders({ 'Authorization': 'Bearer token' })
  .withTimeout(5000)
  .withRetry(3)
  .build();
```

## Common Patterns

### Dynamic Form Generation
```typescript
// API returns form structure based on user role
const DynamicForm = () => (
  <ApiRenderer
    actionUrl="/api/forms/user-form"
    context={{ userRole: currentUser.role }}
    onComponentLoad={(form) => {
      // Form structure received, can extract validation rules
      const validationRules = extractValidationFromMetadata(form.metadata);
    }}
  />
);
```

### Conditional Component Loading
```typescript
const ConditionalComponent = ({ condition }) => {
  const apiConfig = {
    actionUrl: condition 
      ? '/api/components/premium' 
      : '/api/components/basic',
    method: 'GET'
  };

  return <ApiRenderer {...apiConfig} />;
};
```

### Multi-Step Form API Rendering
```typescript
const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  return (
    <ApiRenderer
      actionUrl={`/api/forms/step-${currentStep}`}
      context={{ step: currentStep }}
      onComponentLoad={(component) => {
        // Handle step-specific logic
        if (component.metadata.isLastStep) {
          // Show submit button
        }
      }}
    />
  );
};
```

### Form Components
- Use FormMetaMap for form structure
- Apply InputMetaMap for form fields
- Implement validation through ComponentDetail decorator
- Handle form submission with ActionBuilder

### Button Components  
- Use ButtonMetaMap for button configuration
- Implement click handlers with ActionBuilder
- Support different button types (submit, button, reset)

### Data Display
- Use DetailMetaMap for read-only data display
- Implement ApiMetaMap for data fetching
- Support various display formats and styling

### Navigation
- Use LinkMetaMap for navigation elements
- Implement MenuMetaMap for menu structures
- Support routing and state management

## Expression Examples

### Conditional Rendering
```typescript
new Expression()
  .when(condition)
  .then(renderComponent)
  .else(renderAlternative)
```

### Data Binding
```typescript
new Provider()
  .from(dataSource)
  .select(properties)
  .where(conditions)
  .bind(component)
```

### Action Handling
```typescript
new ActionExpression()
  .on('click')
  .execute(handler)
  .withContext(context)
```

### API Action Chaining
```typescript
Actions.apiCall('/api/validate', 'POST', formData)
  .then(Actions.apiCall('/api/submit', 'POST'))
  .onSuccess((result) => showSuccess(result))
  .onError((error) => showError(error))
  .build()
```

## Best Practices

### API Component Rendering
1. **Validation**: Always validate API responses with layoutComponentDetailDecoder
2. **Error Boundaries**: Wrap API components in error boundaries
3. **Loading States**: Provide meaningful loading indicators
4. **Retry Logic**: Implement retry mechanisms for failed API calls
5. **Caching**: Cache component structures when appropriate
6. **Type Safety**: Use TypeScript interfaces for API responses

### General Framework Usage
1. **Type Safety**: Always use TypeScript types and interfaces
2. **Validation**: Implement proper validation rules for all inputs
3. **Error Handling**: Use try-catch blocks in action handlers
4. **Performance**: Lazy load components when possible
5. **Testing**: Write unit tests for all components and actions
6. **Documentation**: Document complex expressions and business logic

## Framework Features

- **Type Inference**: Automatic type detection and validation
- **Layout Exposition**: Dynamic layout generation
- **Component Mapping**: Automatic class-to-component conversion
- **Expression Evaluation**: Runtime expression parsing and execution
- **Metadata Management**: Centralized component configuration
- **Action Chaining**: Sequential and conditional action execution
- **API Integration**: Server-side component generation and validation
- **Dynamic Rendering**: Runtime component composition and rendering
- **Error Recovery**: Built-in error handling and retry mechanisms
