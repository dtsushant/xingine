import { runAction, ActionExecutionContext, SerializableAction } from '../../core/expressions';
import { FormActionContext } from '../../core/expressions';

describe('formActionRegistry with runAction', () => {
    let formData: Record<string, unknown>;
    let formFieldValues: Record<string, unknown>;
    let formErrors: Record<string, string[]>;
    let formContext: FormActionContext;
    let executionContext: ActionExecutionContext;

    beforeEach(() => {
        formData = {};
        formFieldValues = {};
        formErrors = {};

        formContext = {
            form:formData,
            lastFormUpdateTime: Date.now(),
            getLastFormUpdateTime: () => formContext.lastFormUpdateTime,
            setFormData: (data) => { formData = { ...data }; },
            setInitialFormData: (data) => { formData = { ...data }; },
            getFormData: () => ({ ...formData }),
            getInitialFormData: { ...formData },
            setFormField: ({ fieldName, value }) => { formFieldValues[fieldName] = value; },
            getFormField: (fieldName) => formFieldValues[fieldName],
            validateForm: () => Object.keys(formErrors).length === 0,
            validateField: (fieldName) => !(formErrors[fieldName] && formErrors[fieldName].length > 0),
            getFormErrors: () => ({ ...formErrors }),
            setFormErrors: (errors) => { formErrors = { ...errors }; },
            clearFormErrors: () => { formErrors = {}; },
            resetForm: () => { formData = {}; formFieldValues = {}; formErrors = {}; },
            submitForm: async () => ({ success: true, result: { submitted: true } }),
            onLoad: async (actions: SerializableAction[]) => {
                const results = [];
                for (const action of actions) {
                    const res = await runAction(action, executionContext);
                    // Handle the case where runAction might return void
                    if (res) {
                        results.push(res);
                    } else {
                        // If void, create a default success result
                        results.push({ success: true, result: undefined });
                    }
                }
                return results;
            }
        };

        executionContext = {
            global: {} as any,
            content: {} as any,
            formActionContext: formContext
        };
    });

    test('setFormData and getFormData', async () => {
        const data = { foo: 'bar', count: 5 };
        const setAction: SerializableAction = { action: 'setFormData', args: data };
        const setResult = await runAction(setAction, executionContext);
        expect(setResult?.success).toBe(true);
        expect(formData).toEqual(data);

        const getAction: SerializableAction = { action: 'getFormData' };
        const getResult = await runAction(getAction, executionContext);
        expect(getResult?.success).toBe(true);
        expect(getResult?.result).toEqual(data);
    });

    test('setFormField and getFormField', async () => {
        const meta = { fieldName: 'username', value: 'alice' };
        const setField: SerializableAction = { action: 'setFormField', args: meta };
        const setRes = await runAction(setField, executionContext);
        expect(setRes?.success).toBe(true);
        expect(formFieldValues.username).toBe('alice');

        const getField: SerializableAction = { action: 'getFormField', args: { fieldName: 'username' } };
        const getRes = await runAction(getField, executionContext);
        expect(getRes?.success).toBe(true);
        expect(getRes?.result).toEqual({ fieldName: 'username', value: 'alice' });
    });

    test('validateForm and validateField', async () => {
        // no errors initially
        const validForm: SerializableAction = { action: 'validateForm' };
        const vfRes = await runAction(validForm, executionContext);
        expect(vfRes?.success).toBe(true);
        expect(vfRes?.result).toEqual({ isValid: true });

        // set an error
        formErrors['age'] = ['required'];
        const invalidField: SerializableAction = { action: 'validateField', args: { fieldName: 'age' } };
        const vfFieldRes = await runAction(invalidField, executionContext);
        expect(vfFieldRes?.success).toBe(true);
        expect(vfFieldRes?.result).toEqual({ fieldName: 'age', isValid: false });
    });

    test('getFormErrors, setFormErrors and clearFormErrors', async () => {
        const errors = { name: ['too short'], email: ['invalid'] };
        const setErr: SerializableAction = { action: 'setFormErrors', args: errors };
        const sr = await runAction(setErr, executionContext);
        expect(sr?.success).toBe(true);
        expect(formErrors).toEqual(errors);

        const getErr: SerializableAction = { action: 'getFormErrors' };
        const gr = await runAction(getErr, executionContext);
        expect(gr?.success).toBe(true);
        expect(gr?.result).toEqual(errors);

        const clearErr: SerializableAction = { action: 'clearFormErrors' };
        const cr = await runAction(clearErr, executionContext);
        expect(cr?.success).toBe(true);
        expect(formErrors).toEqual({});
        expect(cr?.result).toEqual({ cleared: true });
    });

    test('resetForm', async () => {
        formData = { a: 1 };
        formFieldValues = { x: 'y' };
        formErrors = { f: ['err'] };
        const reset: SerializableAction = { action: 'resetForm' };
        const rr = await runAction(reset, executionContext);
        expect(rr?.success).toBe(true);
        expect(formData).toEqual({});
        expect(formFieldValues).toEqual({});
        expect(formErrors).toEqual({});
        expect(rr?.result).toEqual({ reset: true });
    });

    test('submitForm', async () => {
        const submit: SerializableAction = { action: 'submitForm' };
        const res = await runAction(submit, executionContext);
        expect(res?.success).toBe(true);
        expect(res?.result).toEqual({ submitted: true });
    });

    test('onLoad executes all actions', async () => {
        const actions: SerializableAction[] = [
            { action: 'setFormData', args: { k: 'v' } },
            { action: 'setFormField', args: { fieldName: 'f1', value: 10 } }
        ];
        const onLoadAction: SerializableAction = { action: 'onLoad', args: actions as any };
        const res = await runAction(onLoadAction, executionContext);
        expect(res?.success).toBe(true);
        // result.executedActions should match actions length
        expect((res?.result as any)?.executedActions).toBe(actions.length);
        // verify states updated
        expect(formData).toEqual({ k: 'v' });
        expect(formFieldValues.f1).toBe(10);
    });
});
