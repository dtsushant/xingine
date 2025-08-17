/**
 * Builders for SerializableAction and ConditionalExpression
 * 
 * These builders provide a fluent API for creating complex actions and conditions
 * with better type safety and readability.
 */

import {
    SerializableAction,
    ConditionalChain,
    ConditionalExpression,
    Operator,
    SearchCondition,
    FormDataSetterMeta
} from '../expressions';

/**
 * Builder for creating ConditionalExpression objects with fluent API
 */
export class ConditionBuilder {
    private condition: ConditionalExpression;

    constructor(field: string, operator: Operator, value: unknown) {
        this.condition = { field, operator, value };
    }

    /**
     * Create a simple condition
     */
    static field(field: string): FieldBuilder {
        return new FieldBuilder(field);
    }

    /**
     * Create an AND condition
     */
    static and(...conditions: ConditionalExpression[]): ConditionBuilder {
        const builder = new ConditionBuilder('', 'eq', '');
        builder.condition = { and: conditions };
        return builder;
    }

    /**
     * Create an OR condition
     */
    static or(...conditions: ConditionalExpression[]): ConditionBuilder {
        const builder = new ConditionBuilder('', 'eq', '');
        builder.condition = { or: conditions };
        return builder;
    }

    /**
     * Build the condition
     */
    build(): ConditionalExpression {
        return this.condition;
    }
}

/**
 * Helper builder for field-based conditions
 */
export class FieldBuilder {
    constructor(private field: string) {}

    equals(value: unknown): ConditionBuilder {
        return new ConditionBuilder(this.field, 'eq', value);
    }

    notEquals(value: unknown): ConditionBuilder {
        return new ConditionBuilder(this.field, 'ne', value);
    }

    greaterThan(value: unknown): ConditionBuilder {
        return new ConditionBuilder(this.field, 'gt', value);
    }

    lessThan(value: unknown): ConditionBuilder {
        return new ConditionBuilder(this.field, 'lt', value);
    }

    greaterThanOrEqual(value: unknown): ConditionBuilder {
        return new ConditionBuilder(this.field, 'gte', value);
    }

    lessThanOrEqual(value: unknown): ConditionBuilder {
        return new ConditionBuilder(this.field, 'lte', value);
    }

    like(value: unknown): ConditionBuilder {
        return new ConditionBuilder(this.field, 'like', value);
    }

    in(values: unknown[]): ConditionBuilder {
        return new ConditionBuilder(this.field, 'in', values);
    }

    notIn(values: unknown[]): ConditionBuilder {
        return new ConditionBuilder(this.field, 'nin', values);
    }

    isNull(): ConditionBuilder {
        return new ConditionBuilder(this.field, 'eq', null);
    }

    isNotNull(): ConditionBuilder {
        return new ConditionBuilder(this.field, 'ne', null);
    }

    isTrue(): ConditionBuilder {
        return new ConditionBuilder(this.field, 'eq', true);
    }

    isFalse(): ConditionBuilder {
        return new ConditionBuilder(this.field, 'eq', false);
    }
}

/**
 * Builder for creating SerializableAction objects with fluent API
 */
export class ActionBuilder {
    private action: SerializableAction;

    constructor(actionName: string) {
        this.action = { action: actionName };
    }

    /**
     * Create a new ActionBuilder
     */
    static create(actionName: string): ActionBuilder {
        return new ActionBuilder(actionName);
    }

    /**
     * Add arguments to the action
     */
    withArgs(args: Record<string, unknown>): ActionBuilder {
        if (typeof this.action === 'string') {
            this.action = { action: this.action, args };
        } else {
            this.action.args = { ...this.action.args, ...args };
        }
        return this;
    }

    /**
     * Set a single argument
     */
    withArg(key: string, value: unknown): ActionBuilder {
        return this.withArgs({ [key]: value });
    }

    /**
     * Enable value from event
     */
    withValueFromEvent(enabled: boolean = true): ActionBuilder {
        if (typeof this.action === 'string') {
            this.action = { action: this.action, valueFromEvent: enabled };
        } else {
            this.action.valueFromEvent = enabled;
        }
        return this;
    }

    /**
     * Add conditional chains
     */
    withChains(...chains: ConditionalChain[]): ActionBuilder {
        if (typeof this.action === 'string') {
            this.action = { action: this.action, chains };
        } else {
            this.action.chains = [...(this.action.chains || []), ...chains];
        }
        return this;
    }

    /**
     * Add a single conditional chain
     */
    withChain(condition: ConditionalExpression, action: string | SerializableAction, args?: Record<string, unknown>): ActionBuilder {
        const chainAction = typeof action === 'string' 
            ? { action, args } 
            : action;
        const chain: ConditionalChain = { condition, action: [chainAction] };
        return this.withChains(chain);
    }

    /**
     * Add mapped actions (execute after main action succeeds)
     */
    then(...actions: SerializableAction[]): ActionBuilder {
        if (typeof this.action === 'string') {
            this.action = { action: this.action, then: actions };
        } else {
            this.action.then = [...(this.action.then || []), ...actions];
        }
        return this;
    }

    /**
     * Add a single mapped action
     */
    withMappedAction(action: SerializableAction): ActionBuilder {
        return this.then(action);
    }

    /**
     * Build the SerializableAction
     */
    build(): SerializableAction {
        return this.action;
    }
}

/**
 * Builder for creating ConditionalChain objects
 */
export class ChainBuilder {
    private chain: Partial<ConditionalChain> = {};

    constructor() {}

    /**
     * Create a new ChainBuilder
     */
    static create(): ChainBuilder {
        return new ChainBuilder();
    }

    /**
     * Set the condition
     */
    when(condition: ConditionalExpression): ChainBuilder {
        this.chain.condition = condition;
        return this;
    }

    /**
     * Set the condition using ConditionBuilder
     */
    whenCondition(conditionBuilder: ConditionBuilder): ChainBuilder {
        this.chain.condition = conditionBuilder.build();
        return this;
    }

    /**
     * Set the action (string form)
     */
    thenAction(action: string, args?: Record<string, unknown>): ChainBuilder {
        this.chain.action = [{ action, args }];
        return this;
    }

    /**
     * Set multiple actions (string forms)
     */
    thenActions(...actions: string[]): ChainBuilder {
        this.chain.action = actions.map(action => ({ action }));
        return this;
    }

    /**
     * Set the action (SerializableAction form)
     */
    thenSerializableAction(action: SerializableAction): ChainBuilder {
        this.chain.action = [action];
        return this;
    }

    /**
     * Set multiple actions (SerializableAction forms)
     */
    thenSerializableActions(...actions: SerializableAction[]): ChainBuilder {
        this.chain.action = actions;
        return this;
    }

    /**
     * Set the action using ActionBuilder
     */
    thenActionBuilder(actionBuilder: ActionBuilder): ChainBuilder {
        this.chain.action = [actionBuilder.build()];
        return this;
    }

    /**
     * Set multiple actions using ActionBuilders
     */
    thenActionBuilders(...actionBuilders: ActionBuilder[]): ChainBuilder {
        this.chain.action = actionBuilders.map(builder => builder.build());
        return this;
    }

    /**
     * Build the ConditionalChain
     */
    build(): ConditionalChain {
        if (!this.chain.condition || !this.chain.action) {
            throw new Error('ConditionalChain requires both condition and action');
        }
        return this.chain as ConditionalChain;
    }
}

/**
 * Predefined condition builders for common scenarios
 */
export const Conditions = {
    // Success/failure conditions
    onSuccess: () => ConditionBuilder.field('__success').isTrue(),
    onError: () => ConditionBuilder.field('__hasError').isTrue(),
    onResult: (field: string, operator: Operator, value: unknown) => 
        new ConditionBuilder(`__result.${field}`, operator, value),

    // Authentication conditions
    onLoginSuccess: () => ConditionBuilder.field('__result.user.token').isNotNull(),
    onLoginFailure: () => ConditionBuilder.field('__result.user').isNull(),
    onValidationError: () => ConditionBuilder.and(
        ConditionBuilder.field('__result.message').equals('Input data validation failed').build(),
        ConditionBuilder.field('__result.errors').isNotNull().build()
    ),

    // Common field conditions
    fieldExists: (field: string) => ConditionBuilder.field(field).isNotNull(),
    fieldEquals: (field: string, value: unknown) => ConditionBuilder.field(field).equals(value),
    fieldNotEquals: (field: string, value: unknown) => ConditionBuilder.field(field).notEquals(value),
};

/**
 * Predefined action builders for common scenarios
 */
export const Actions = {
    // Navigation actions
    navigate: (path: string) => ActionBuilder.create('navigate').withArg('path', path),
    
    // State management actions
    setState: (key: string, value: unknown) => ActionBuilder.create('setState').withArgs({ key, value }),
    toggleState: (key: string) => ActionBuilder.create('toggleState').withArg('key', key),
    
    // Storage actions
    setStorage: (key: string, value: string) => ActionBuilder.create('setLocalStorage').withArgs({ key, value }),
    getStorage: (key: string, stateKey?: string) => ActionBuilder.create('getLocalStorage').withArgs({ key, stateKey }),
    removeStorage: (key: string) => ActionBuilder.create('removeLocalStorage').withArg('key', key),
    
    // UI actions
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => 
        ActionBuilder.create('showToast').withArgs({ message, type }),
    
    // API actions
    apiCall: (url: string, method: string = 'GET', body?: unknown) => 
        ActionBuilder.create('makeApiCall').withArgs({ url, method, body }),
    
    // Auth actions
    login: (username: string, password: string) => 
        ActionBuilder.create('login').withArgs({ username, password }),
    logout: () => ActionBuilder.create('logout'),
    showHide:(dataProvider:Record<string,unknown>,condition:ConditionalExpression) => ActionBuilder.create('showHide').withArgs({data: dataProvider, condition: condition}),
    setFormData: (formDataSetterMeta:FormDataSetterMeta) =>
        ActionBuilder.create('setFormData').withArgs(formDataSetterMeta as unknown as Record<string, unknown>),
    setFormLoadAction: (action: string) =>
        ActionBuilder.create('setFormLoadAction').withArg('action', action),
    setFormSubmitAction: (action: string) =>
        ActionBuilder.create('setFormSubmitAction').withArg('action', action),
    setFormSubmissionSuccessRedirectionPath: (path: string) =>
        ActionBuilder.create('setFormSubmissionSuccessRedirectionPath').withArg('path', path),
    setFormSubmissionFailureAction: (path: string) =>
        ActionBuilder.create('setFormSubmissionAction').withArg('path', path),
};

export default {
    ConditionBuilder,
    FieldBuilder,
    ActionBuilder,
    ChainBuilder,
    Conditions,
    Actions
};
