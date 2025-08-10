import {ActionResult, SerializableAction} from "../operators";

export interface FormFieldSetterMeta {
    fieldName: string;
    value: unknown;
}

// FormActionContext is now an interface that defines the actual form context/implementation
export interface FormActionContext {
    form:unknown;
    // Form data management
    setFormData: (data: Record<string, unknown>) => void;
    getFormData: () => Record<string, unknown>;

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
    setFormData: Record<string, unknown>;
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

// Generic action handler type that ensures args match the specific action key
export type FormActionHandler<T extends keyof FormActionArgs> = (
    args: FormActionArgs[T] | undefined,
    context: any
) => ActionResult | Promise<ActionResult | void> | void;

// Registry type that maps each action to its specific handler
export type FormActionRegistry = {
    [K in keyof FormActionArgs]: FormActionHandler<K>
} & Record<string, any>;

export const formActionRegistry: FormActionRegistry = {
    setFormData: (args, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            ctx.setFormData(args as Record<string, unknown>);
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    },

    getFormData: (_, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            const formData = ctx.getFormData();
            return { success: true, result: formData };
        } catch (error) {
            return { success: false, error };
        }
    },

    setFormField: (args, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            ctx.setFormField(args as { fieldName: string; value: unknown });
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    },

    getFormField: (args, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            const a = args as { fieldName: string };
            const value = ctx.getFormField(a.fieldName);
            return { success: true, result: { fieldName: a.fieldName, value } };
        } catch (error) {
            return { success: false, error };
        }
    },

    validateForm: (_, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            const isValid = ctx.validateForm();
            return { success: true, result: { isValid } };
        } catch (error) {
            return { success: false, error };
        }
    },

    validateField: (args, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            const a = args as { fieldName: string };
            const isValid = ctx.validateField(a.fieldName);
            return { success: true, result: { fieldName: a.fieldName, isValid } };
        } catch (error) {
            return { success: false, error };
        }
    },

    getFormErrors: (_, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            const errors = ctx.getFormErrors();
            return { success: true, result: errors };
        } catch (error) {
            return { success: false, error };
        }
    },

    setFormErrors: (args, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            ctx.setFormErrors(args as Record<string, string[]>);
            return { success: true, result: { errors: args } };
        } catch (error) {
            return { success: false, error };
        }
    },

    clearFormErrors: (_, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            ctx.clearFormErrors();
            return { success: true, result: { cleared: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    resetForm: (_, context): ActionResult => {
        const ctx = (context as any).formActionContext;
        try {
            ctx.resetForm();
            return { success: true, result: { reset: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    submitForm: async (_, context): Promise<ActionResult> => {
        const ctx = (context as any).formActionContext;
        try {
            const result = await ctx.submitForm();
            return result;
        } catch (error) {
            return { success: false, error };
        }
    },

    onLoad: async (_, context): Promise<ActionResult> => {
        return { success: true, result: { message: 'Delegating execution to then of the SerializableAction' } };
    },
}