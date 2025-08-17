import {
    ActionExecutionContext,
    ActionResult,
    FormActionArgs,
} from "../operators";
// Generic action handler type that ensures args match the specific action key
export type FormActionHandler<T extends keyof FormActionArgs> = (
    args: FormActionArgs[T] | undefined,
    context: ActionExecutionContext
) => ActionResult | Promise<ActionResult | void> | void;

// Registry type that maps each action to its specific handler
export type FormActionRegistry = {
    [K in keyof FormActionArgs]: FormActionHandler<K>
} & Record<string, any>;

export const formActionRegistry: FormActionRegistry = {
    setFormData: (args, actionContext): ActionResult => {
        const { formActionContext: ctx } = actionContext;
        if (!ctx || typeof ctx.setFormData !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have setFormData method") };
        }
        let initialFormData = args?.data as Record<string, unknown> || {};
        if(args && args.setFromResult) {

            initialFormData = {...initialFormData,
                ...actionContext.content.chainContext?.result as Record<string, unknown> || {}
                }
            console.info("setting the inital formdata", initialFormData);
            ctx.setInitialFormData(initialFormData);
        };

        try {
            ctx.setFormData(initialFormData);
            // Update the form update timestamp for optimized conditional rendering

            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    },

    getFormData: (_, {formActionContext:ctx}): ActionResult => {
        if (!ctx || typeof ctx.getFormData !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have getFormData method") };
        }
        try {
            console.log("getting the form action context", ctx);
            const formData = ctx.getFormData();
            console.log("getting the form data", formData);
            return { success: true, result: formData };
        } catch (error) {
            return { success: false, error };
        }
    },

    setFormField: (args, {formActionContext:ctx}): ActionResult => {
        if (!ctx || typeof ctx.setFormField !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have setFormField method") };
        }
        try {
            ctx.setFormField(args as { fieldName: string; value: unknown });
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    },

    getFormField: (args, {formActionContext:ctx}): ActionResult => {
        if( !ctx || typeof ctx.getFormField !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have getFormField method")}
        }

        try {
            const a = args as { fieldName: string };
            const value = ctx.getFormField(a.fieldName);
            return { success: true, result: { fieldName: a.fieldName, value } };
        } catch (error) {
            return { success: false, error };
        }
    },

    validateForm: (_, {formActionContext:ctx}): ActionResult => {
        if( !ctx || typeof ctx.validateForm !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have validateForm method") };
        }
        try {
            const isValid = ctx.validateForm();
            return { success: true, result: { isValid } };
        } catch (error) {
            return { success: false, error };
        }
    },

    validateField: (args, {formActionContext:ctx}): ActionResult => {
        if( !ctx || typeof ctx.validateField !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have validateField method") };
        }
        try {
            const a = args as { fieldName: string };
            const isValid = ctx.validateField(a.fieldName);
            return { success: true, result: { fieldName: a.fieldName, isValid } };
        } catch (error) {
            return { success: false, error };
        }
    },

    getFormErrors: (_, {formActionContext:ctx}): ActionResult => {
        if( !ctx || typeof ctx.getFormErrors !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have getFormErrors method") };
        }
        try {
            const errors = ctx.getFormErrors();
            return { success: true, result: errors };
        } catch (error) {
            return { success: false, error };
        }
    },

    setFormErrors: (args, {formActionContext:ctx}): ActionResult => {
        if( !ctx || typeof ctx.setFormErrors !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have setFormErrors method") };
        }
        try {
            ctx.setFormErrors(args as Record<string, string[]>);
            return { success: true, result: { errors: args } };
        } catch (error) {
            return { success: false, error };
        }
    },

    clearFormErrors: (_, {formActionContext:ctx}): ActionResult => {
        if( !ctx || typeof ctx.clearFormErrors !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have clearFormErrors method") };
        }
        try {
            ctx.clearFormErrors();
            return { success: true, result: { cleared: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    setInitialFormData: (_, {formActionContext:ctx}): ActionResult => {
        if( !ctx ) {
            return { success: false, error: new Error("FormActionContext is not set or does not have initialFormData method") };
        }
        try {
            ctx.setInitialFormData(_||{});
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    },

    resetForm: (_, {formActionContext:ctx}): ActionResult => {
        if( !ctx || typeof ctx.resetForm !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have resetForm method") };
        }
        try {
            ctx.resetForm();
            return { success: true, result: { reset: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    submitForm: async (_, {formActionContext:ctx}): Promise<ActionResult> => {
        if (!ctx || typeof ctx.submitForm !== 'function') {
            return { success: false, error: new Error("FormActionContext is not set or does not have submitForm method") };
        }
        try {
            if(!_){
                console.warn("No events to submit, using empty object");
                return {success: false, error: new Error("No events defined for submission")}
            }
            const result = await ctx.submitForm(_);
            return result;
        } catch (error) {
            return { success: false, error };
        }
    },

    onLoad: async (_, __): Promise<ActionResult> => {
        return { success: true, result: { message: 'Delegating execution to then of the SerializableAction' } };
    },
}