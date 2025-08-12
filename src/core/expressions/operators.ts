export type Operator =
  | "eq"
  | "ne"
  | "like"
  | "ilike"
  | "in"
  | "nin"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

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
    submitForm: () => Promise<ActionResult>;

    // Lifecycle methods
    onLoad: (actions: SerializableAction[]) => Promise<ActionResult[]>;

}

// Action argument types for each form action
export type FormActionArgs = {
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
    submitForm: void;
    onLoad: SerializableAction[];
}



export interface ActionExecutionContext {
    global: ActionContext;
    content: ActiveContentContext;
    formActionContext?:FormActionContext;
}