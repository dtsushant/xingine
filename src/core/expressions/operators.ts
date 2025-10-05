export const Operators = {
    eq: "Equals",
    ne: "Not Equals",
    like: "Like",
    ilike: "Case Insensitive Like",
    in: "In",
    nin: "Not In",
    gt: "Greater Than",
    gte: "Greater Than or Equal",
    lt: "Less Than",
    lte: "Less Than or Equal",
} as const;

/**
 * Field type to operator mapping based on form field types.
 * This defines which operators are available for each field type.
 */
export const FieldTypeOperators = {
    // Text-based fields - support all text operations
    input: ['eq', 'ne', 'like', 'ilike', 'in', 'nin'] as const,
    password: ['eq', 'ne'] as const, // Limited for security
    textarea: ['eq', 'ne', 'like', 'ilike', 'in', 'nin'] as const,
    
    // Number fields - support comparison and equality operations
    number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'] as const,
    
    // Boolean-like fields - only equality operations
    switch: ['eq', 'ne'] as const,
    checkbox: ['eq', 'ne', 'in', 'nin'] as const, // in/nin for multiple checkboxes
    
    // Selection fields - equality and membership operations
    select: ['eq', 'ne', 'in', 'nin'] as const,
    lookup: ['eq', 'ne', 'in', 'nin'] as const,
    treeselect: ['eq', 'ne', 'in', 'nin'] as const,
    nestedcheckbox: ['eq', 'ne', 'in', 'nin'] as const,
    
    // Date fields - support all comparison operations
    date: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'] as const,
    
    // Complex fields - primarily equality operations
    file: ['eq', 'ne'] as const, // File existence or specific file
    object: ['eq', 'ne'] as const, // Object comparison
    'object[]': ['eq', 'ne', 'in', 'nin'] as const, // Array operations
    
    // Layout fields - not typically used in conditions
    grouper: [] as const, // No operators for layout grouper
    button: [] as const, // No operators for buttons
    
    // Special fields
    conditionbuilder: ['eq', 'ne'] as const, // Condition existence
} as const;

/**
 * Get available operators for a specific field type
 */
export const getOperatorsForFieldType = (fieldType: keyof typeof FieldTypeOperators): readonly string[] => {
    return FieldTypeOperators[fieldType] || [];
};

/**
 * Check if an operator is valid for a field type
 */
export const isOperatorValidForFieldType = (
    fieldType: keyof typeof FieldTypeOperators, 
    operator: string
): boolean => {
    const validOperators = FieldTypeOperators[fieldType];
    return (validOperators as readonly string[]).includes(operator);
};

// 👇 keys of the mapping become the union

export const GroupConditions = {and:"And", or:"Or"} as const;

export type Operator = keyof typeof Operators;

/**
 * Type for valid operators based on field type
 */
export type ValidOperatorForFieldType<T extends keyof typeof FieldTypeOperators> = 
    typeof FieldTypeOperators[T][number];

/**
 * Field types that support text-based operations
 */
export type TextFieldTypes = 'input' | 'textarea';

/**
 * Field types that support numeric operations
 */
export type NumericFieldTypes = 'number' | 'date';

/**
 * Field types that support boolean operations
 */
export type BooleanFieldTypes = 'switch';

/**
 * Field types that support selection operations
 */
export type SelectionFieldTypes = 'select' | 'lookup' | 'treeselect' | 'checkbox' | 'nestedcheckbox';

/**
 * Get operator display names for a field type
 */
export const getOperatorLabelsForFieldType = (fieldType: keyof typeof FieldTypeOperators): Record<string, string> => {
    const availableOperators = getOperatorsForFieldType(fieldType);
    const labels: Record<string, string> = {};
    
    availableOperators.forEach(op => {
        if (op in Operators) {
            labels[op] = Operators[op as Operator];
        }
    });
    
    return labels;
};

/**
 * Get suggested default operator for a field type
 */
export const getDefaultOperatorForFieldType = (fieldType: keyof typeof FieldTypeOperators): string | null => {
    const operators = FieldTypeOperators[fieldType];
    if (operators.length === 0) return null;
    
    // Prefer 'eq' as default, fallback to first available
    return operators.includes('eq' as any) ? 'eq' : operators[0];
};

/**
 * Operator categories for UI grouping
 */
export const OperatorCategories = {
    equality: ['eq', 'ne'] as const,
    comparison: ['gt', 'gte', 'lt', 'lte'] as const,
    text: ['like', 'ilike'] as const,
    membership: ['in', 'nin'] as const,
} as const;

/**
 * Get operators grouped by category for a field type
 */
export const getCategorizedOperatorsForFieldType = (fieldType: keyof typeof FieldTypeOperators) => {
    const availableOperators = new Set(getOperatorsForFieldType(fieldType));
    const categorized: Partial<Record<keyof typeof OperatorCategories, string[]>> = {};
    
    Object.entries(OperatorCategories).forEach(([category, operators]) => {
        const availableInCategory = operators.filter(op => availableOperators.has(op));
        if (availableInCategory.length > 0) {
            categorized[category as keyof typeof OperatorCategories] = availableInCategory;
        }
    });
    
    return categorized;
};

/**
 * Validate a condition based on field type and operator
 */
export const validateCondition = (
    fieldType: keyof typeof FieldTypeOperators,
    operator: string,
    value: unknown
): { valid: boolean; error?: string } => {
    // Check if operator is valid for field type
    if (!isOperatorValidForFieldType(fieldType, operator)) {
        return {
            valid: false,
            error: `Operator '${operator}' is not valid for field type '${fieldType}'`
        };
    }
    
    // Check value requirements for specific operators
    if (['in', 'nin'].includes(operator)) {
        if (!Array.isArray(value) || value.length === 0) {
            return {
                valid: false,
                error: `Operator '${operator}' requires a non-empty array value`
            };
        }
    }
    
    // Check value requirements for comparison operators
    if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
        if (fieldType === 'number' && (typeof value !== 'number' && !Number.isFinite(Number(value)))) {
            return {
                valid: false,
                error: `Operator '${operator}' requires a numeric value for number fields`
            };
        }
        if (fieldType === 'date' && !value) {
            return {
                valid: false,
                error: `Operator '${operator}' requires a valid date value for date fields`
            };
        }
    }
    
    // Check boolean field values
    if (fieldType === 'switch' && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return {
            valid: false,
            error: `Switch field requires a boolean value (true/false)`
        };
    }
    
    return { valid: true };
};

export interface BaseFilterCondition {
  field: string;
  operator: Operator;
  value: unknown;
}

export interface GroupCondition {
  and?: SearchCondition[];
  or?: SearchCondition[];
}

export type SearchCondition = BaseFilterCondition | GroupCondition;

export type SearchQuery = GroupCondition;
export type ConditionalExpression = SearchCondition;

export type ConditionalChain = {
    condition: ConditionalExpression;
    action: SerializableAction[]; // Array of actions to execute when condition is met
};

export type ActionResult = {
    success: boolean;
    result?: unknown;
    error?: unknown;
};

export type SerializableAction =
    | string // shorthand: "toggleDarkMode"
    | {
    action: string;            // e.g., "setState", "navigate"
    args?: Record<string, unknown>; // optional arguments
    valueFromEvent?: boolean;  // useful for input/change handlers
    chains?: ConditionalChain[]; // conditional chains based on result
    then?: SerializableAction[]; // unconditional action sequence - executes after main action
};


type StateSetter<T> = (value: T | ((prev: T) => T)) => void;

export interface EventActionContext {
    onClick?: (...args: unknown[]) => void;
    onHover?: (...args: unknown[]) => void;
    onInit?: (...args:unknown[])=>void;
    onChange?: (value: unknown, event?: unknown) => void;
    onInput?: (value: unknown, event?: unknown) => void;
    onFocus?: (event?: unknown) => void;
    onBlur?: (event?: unknown) => void;
    onSubmit?: (event?: unknown) => void;
    onClear?: (event?: unknown) => void;
    onKeyDown?: (event?: unknown) => void;
    onKeyUp?: (event?: unknown) => void;
}

export type EventBindings = {
    [K in keyof EventActionContext]?: SerializableAction;
};

export interface ActionContext {
    // Global state - available everywhere (header, sidebar, content, footer)
    getAllState: () => Record<string, unknown>;
    getState: (key: string) => unknown;
    setState: (key: string, value: unknown) => void;
    navigate: (path: string) => void;

    // Storage methods
    setLocalStorage?: (key: string, value: unknown) => void;
    getLocalStorage?: (key: string) => string | null;
    removeLocalStorage?: (key: string) => void;
    clearLocalStorage?: () => void;

    // API calls - always global
    makeApiCall: (params: {
        url: string;
        method?: string;
        body?: unknown;
    }) => Promise<unknown>;

    // Toast/notification methods
    showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

    // Error handling
    error?: (message: string, details?: unknown) => void;

    // Dynamic action handler
    dynamic?: (name: string, args: any, event?: any) => void;

    // Auth methods
    logout?: () => Promise<void>;
}

export interface ComponentStateStore {
    // Component-local state - scoped to specific component instance
    getState: (key: string) => unknown;
    setState: (key: string, value: unknown) => void;
    getAllState: () => Record<string, unknown>;

    // Component ID for debugging/tracking
    componentId: string;
}

export interface ActiveContentContext {
    event?: unknown;
    chainContext?: { error?: unknown; result?: unknown; success?: boolean };

    // Content-specific state management
    getComponentStateStore: (componentId: string) => ComponentStateStore;

    // Content-level state - shared within content area but not global
    getContentState?: (key: string) => unknown;
    setContentState?: (key: string, value: unknown) => void;
    getAllContentState?: () => Record<string, unknown>;
}

export interface FormFieldSetterMeta {
    fieldName: string;
    value: unknown;
}

export interface FormDataSetterMeta{
    data?: Record<string, unknown>;
    setFromResult?: boolean; // If true, will set the form data from the result of the action
}

export interface FormActionEventMeta {
    actionsToExecute?:SerializableAction[]
}

// FormActionContext is now an interface that defines the actual form context/implementation
export interface FormActionContext {
    form:unknown;
    // Form data management
    setFormData: (data: Record<string, unknown>) => void;
    getFormData: () => Record<string, unknown>;

    // Form update tracking for optimized conditional rendering
    lastFormUpdateTime: number;
    getLastFormUpdateTime: () => number;

    // Field management
    setFormField: (meta: FormFieldSetterMeta) => void;
    getFormField: (fieldName: string) => unknown;

    // Form validation
    validateForm: () => boolean;
    validateField: (fieldName: string) => boolean;

    // Form state
    getFormErrors: () => Record<string, string[]>;
    setFormErrors: (errors: Record<string, string[]>) => void;
    clearFormErrors: () => void;

    // Form actions
    resetForm: () => void;
    submitForm: (meta:FormActionEventMeta) => Promise<ActionResult>;
    setInitialFormData:(data: Record<string, unknown>) => void;
    getInitialFormData : Record<string, unknown>;
    // Lifecycle methods
    onLoad: (actions: SerializableAction[]) => Promise<ActionResult[]>;

}

// Action argument types for each form action
export type FormActionArgs = {
    setInitialFormData: Record<string, unknown>;
    setFormData: FormDataSetterMeta;
    getFormData: void;
    setFormField: FormFieldSetterMeta;
    getFormField: { fieldName: string };
    validateForm: void;
    validateField: { fieldName: string };
    getFormErrors: void;
    setFormErrors: Record<string, string[]>;
    clearFormErrors: void;
    resetForm: void;
    submitForm: FormActionEventMeta;
    onLoad: SerializableAction[];
}



export interface ActionExecutionContext {
    global: ActionContext;
    content: ActiveContentContext;
    formActionContext?:FormActionContext;
}