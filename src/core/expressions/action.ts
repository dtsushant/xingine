import {ConditionalExpression} from "./operators";
import {evaluateCondition} from "../utils/type";
import {resolvePath} from "../utils/type";

export type ConditionalChain = {
    condition: ConditionalExpression;
    action: string | SerializableAction; // can be string or full action object
    args?: Record<string, unknown>; // optional args when action is string
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
    navigate: (path: string) => void;
    setState: <T>(key: string, setter: T | ((prev: T) => T)) => void;
    getState: (key: string) => unknown;
    getAllState:()=>Record<string,unknown>;
    makeApiCall: (params: {
        url: string;
        method?: string;
        body?: unknown;
    }) => Promise<unknown>;
    dynamic?: (name: string, args?:  Record<string, unknown>, event?: unknown) => void;
    toggleState?: (key: string) => void;
    // UI/Auth control methods - provided by xingine-react
    login?: (credentials: { username: string; password: string }) => Promise<{ success: boolean; user?: any; error?: string }>;
    logout?: () => Promise<void>;
    error?: (message: string, details?: unknown) => void;
    // Storage methods
    setLocalStorage?: (key: string, value: unknown) => void;
    getLocalStorage?: (key: string) => string | null;
    removeLocalStorage?: (key: string) => void;
    clearLocalStorage?:()=>void;
    // Toast/notification methods
    showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    /** INTERNAL: Do not use outside ActionContextRegistry */
    __state?:Record<string, unknown>;
}

type ActionHandler = (
    args: Record<string, unknown> | undefined,
    ctx: ActionContext,
    event?: unknown,
    chainContext?: { error?: unknown; result?: unknown; success?: boolean }
) => ActionResult | Promise<ActionResult | void> | void;

const contextMap = new Map<string, ActionContext>();
export const ActionContextRegistry = {
    get(key: string): ActionContext | undefined {
        return contextMap.get(key);
    },

    set(key: string, ctx: ActionContext) {
        contextMap.set(key, ctx);
    },

    clear(key?: string) {
        if (key) contextMap.delete(key);
        else contextMap.clear();
    },
};

export const ActionContextSubscribers = new WeakMap<
    ActionContext,
    Map<string, Set<() => void>>
>();


export const actionRegistry: Record<string, ActionHandler> = {
    navigate: (args, ctx): void => {
        if (!args || typeof args.path !== 'string') {
            throw new Error('navigate requires args.path to be a string');
        }
        ctx.navigate(args.path);
    },

    setState: (args, ctx,event,result): ActionResult => {
        if (!args || typeof args.key !== 'string') {
            return { success: false, error: new Error('Invalid setState args') };
        }
        if(result === undefined || result === null) {
            ctx.setState(args.key, args.value);
            return { success: true, result: { key: args.key, value: args.value } };
        }

        try {
            let value = args.value;
            // If value is a string that contains path expressions, resolve it
            const resolvedValue = resolvePath(result, String(value));
            
            ctx.setState(args.key, resolvedValue);
            return { success: true, result: { key: args.key, value: resolvedValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    makeApiCall: async (params, ctx): Promise<ActionResult> => {
        if (!params || typeof (params as any).url !== 'string') {
            return { success: false, error: new Error('Invalid makeApiCall args') };
        }
        
        try {
            const result = await ctx.makeApiCall(params as {
                url: string;
                method?: string;
                body?: unknown;
            });
            
            return { success: true, result };
        } catch (error) {
            return { success: false, error };
        }
    },

    toggleState: (args, ctx): ActionResult => {
        if (!args || typeof args.key !== 'string') {
            return { success: false, error: new Error('toggleState requires args.key to be a string') };
        }
        
        try {
            const currentValue = ctx.getState(args.key) as boolean;
            const newValue = !currentValue;
            ctx.setState<boolean>(args.key, newValue);
            return { success: true, result: { key: args.key, value: newValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // UI/Auth control actions - delegate to context methods
    login: async (args, ctx): Promise<ActionResult> => {
        if (!ctx.login) {
            return { success: false, error: new Error('Login action requires login method to be provided in ActionContext') };
        }
        const { username, password } = (args as any) || {};
        if (!username || !password) {
            return { success: false, error: new Error('Login requires username and password') };
        }
        
        try {
            const result = await ctx.login({ username, password });
            return { success: result.success, result, error: result.success ? undefined : new Error(result.error || 'Login failed') };
        } catch (error) {
            return { success: false, error };
        }
    },

    logout: async (args, ctx): Promise<ActionResult> => {
        if (!ctx.logout) {
            return { success: false, error: new Error('Logout action requires logout method to be provided in ActionContext') };
        }
        
        try {
            await ctx.logout();
            return { success: true, result: { success: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    error: (args, ctx, event, chainContext?: { error?: unknown }): ActionResult => {
        const providedMessage = (args as any)?.message;
        const details = (args as any)?.details;
        
        // Use provided message, or extract from chain context, or default
        let message = providedMessage;
        if (!message && chainContext?.error) {
            const errorObj = chainContext.error;
            message = errorObj instanceof Error ? errorObj.message : String(errorObj);
        }
        if (!message) {
            message = 'An error occurred';
        }
        
        try {
            if (!ctx.error) {
                // Fallback implementation if no error method provided
                ctx.setState('errorMessage', message);
                ctx.setState('hasError', true);
                console.error('Action error:', message);
            } else {
                ctx.error(message, details || chainContext?.error);
            }
            return { success: true, result: { message, details } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Storage actions
    setLocalStorage: (args, ctx,event,result): ActionResult => {
        if (!ctx.setLocalStorage) {
            return { success: false, error: new Error('setLocalStorage action requires setLocalStorage method to be provided in ActionContext') };
        }
        const { key, value } = (args as any) || {};
        if (!key || value === undefined) {
            return { success: false, error: new Error('setLocalStorage requires key and value') };
        }
        
        try {
            // Resolve value using current state context
            const resolvedValue = resolvePath(result, value);
            ctx.setLocalStorage(key, resolvedValue);
            return { success: true, result: { key, value: resolvedValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    getLocalStorage: (args, ctx): ActionResult => {
        if (!ctx.getLocalStorage) {
            return { success: false, error: new Error('getLocalStorage action requires getLocalStorage method to be provided in ActionContext') };
        }
        const { key, stateKey } = (args as any) || {};
        if (!key) {
            return { success: false, error: new Error('getLocalStorage requires key') };
        }
        
        try {
            const value = ctx.getLocalStorage(key);
            
            // Store result in state if stateKey provided
            if (stateKey) {
                ctx.setState(stateKey, value);
            }
            
            return { success: true, result: value };
        } catch (error) {
            return { success: false, error };
        }
    },

    removeLocalStorage: (args, ctx): ActionResult => {
        if (!ctx.removeLocalStorage) {
            return { success: false, error: new Error('removeLocalStorage action requires removeLocalStorage method to be provided in ActionContext') };
        }
        const { key } = (args as any) || {};
        if (!key) {
            return { success: false, error: new Error('removeLocalStorage requires key') };
        }
        
        try {
            ctx.removeLocalStorage(key);
            return { success: true, result: { key } };
        } catch (error) {
            return { success: false, error };
        }
    },

    clearLocalStorage:(args,ctx)=>{
        if(!ctx.clearLocalStorage){
            throw new Error('clearLocalStorage action requires clearLocalStorage method to be provided in ActionContext');
        }
        ctx.clearLocalStorage();
    },

    // Toast/notification actions
    showToast: (args, ctx): ActionResult => {
        const { message, type = 'info' } = (args as any) || {};
        if (!message) {
            return { success: false, error: new Error('showToast requires message') };
        }
        
        try {
            if (!ctx.showToast) {
                // Fallback: use setState for basic toast handling
                ctx.setState('toastMessage', message);
                ctx.setState('toastType', type);
                ctx.setState('showToast', true);
                console.log(`Toast [${type}]:`, message);
            } else {
                ctx.showToast(message, type);
            }
            return { success: true, result: { message, type } };
        } catch (error) {
            return { success: false, error };
        }
    },
};

export async function runAction(
    action: SerializableAction | undefined,
    context: ActionContext,
    event?: unknown,
    chainContext?: { error?: unknown; result?: unknown; success?: boolean }
): Promise<ActionResult | void> {
    if (!action) {
        return { success: true, result: undefined };
    }

    const name = typeof action === 'string' ? action : action.action;
    const args =
        typeof action === 'string'
            ? undefined
            : action.valueFromEvent
                ? {
                    ...action.args,
                    value:
                        typeof event === 'object' && event !== null && 'target' in event
                            ? (event as any).target?.value
                            : event,
                }
                : action.args;

    const chains = typeof action === 'string' ? undefined : action.chains;
    const thenActions = typeof action === 'string' ? undefined : action.then;

    try {
        const handler = actionRegistry[name];
        let result: ActionResult ;
        
        if (handler) {
            const res = await handler(args, context, event, chainContext);
            if(res)
                result = res as ActionResult;
            else
                result = { success: true };
        } else if (context.dynamic) {
            try {
                await context.dynamic(name, args, event);
                result = { success: true, result: { action: name, args } };
            } catch (error) {
                result = { success: false, error };
            }
        } else {
            result = { success: false, error: new Error(`Unknown action: ${name}`) };
        }

        // Execute mapped actions unconditionally after main action (success or failure)
        if (thenActions && thenActions.length > 0) {
            await processThenActions(thenActions, context, result, event);
        }

        // Process conditional chains if present
        if (chains && chains.length > 0) {
            await processConditionalChains(chains, context, result, event);
        }

        return result;
    } catch (error) {
        const errorResult: ActionResult = { success: false, error };
        
        // Process conditional chains even on error - let conditions decide
        if (chains && chains.length > 0) {
            await processConditionalChains(chains, context, errorResult, event);
        }
        
        return errorResult;
    }
}

async function processThenActions(
    mappedActions: SerializableAction[],
    context: ActionContext,
    mainResult: ActionResult,
    event?: unknown
): Promise<void> {
    // Create context for value resolution including main action result
    const valueContext = {
        ...context.getAllState(),
        __result: mainResult.result,
        __error: mainResult.error,
        __hasError: !mainResult.success,
        __success: mainResult.success
    };

    // Update resolveValue context temporarily
    const originalGetAllState = context.getAllState;
    context.getAllState = () => valueContext;

    try {
        // Execute mapped actions in sequence
        for (const mappedAction of mappedActions) {
            try {
                const result = await runAction(mappedAction, context, event,mainResult);
                // Don't overwrite the original __result from the main action
                // The mapped actions should only use the original result for resolution
                // Each mapped action's result is not part of the chain context
            } catch (error) {
                // Continue with remaining actions even on error
                console.warn('Mapped action error:', error);
            }
        }
    } finally {
        // Restore original getAllState
        context.getAllState = originalGetAllState;
    }
}

async function processConditionalChains(
    chains: ConditionalChain[],
    context: ActionContext,
    mainResult: ActionResult,
    event?: unknown
): Promise<void> {
    // Create evaluation context from current state and main action result
    const evaluationContext = {
        ...context.getAllState(),
        __result: mainResult.result,
        __error: mainResult.error,
        __hasError: !mainResult.success,
        __success: mainResult.success
    };

    // Process each chain in order
    for (const chain of chains) {
        try {
            // Evaluate the condition
            const conditionMet = evaluateCondition(chain.condition, evaluationContext);
            console.log("has the condition met", conditionMet)
            if (conditionMet) {
                // Create SerializableAction from chain
                let chainAction: SerializableAction;
                
                if (typeof chain.action === 'string') {
                    // Action is a string, use args from chain
                    chainAction = {
                        action: chain.action,
                        args: chain.args
                    };
                } else {
                    // Action is already a SerializableAction object
                    chainAction = chain.action;
                }
                
                // Execute the chained action
                const chainContext = {
                    error: mainResult.error,
                    result: mainResult.result,
                    success: mainResult.success
                };
                
                const chainResult = await runAction(chainAction, context, event, mainResult);
                // Update evaluation context with new results for subsequent chains
                if(chainResult){
                    evaluationContext.__result = chainResult.result;
                    evaluationContext.__error = chainResult.error;
                    evaluationContext.__hasError = !chainResult.success;
                    evaluationContext.__success = chainResult.success;

                    // Update actual state context for subsequent chains
                    Object.assign(evaluationContext, context.getAllState());
                }

            }
        } catch (error) {
            // Update evaluation context to reflect the error
            evaluationContext.__error = error;
            evaluationContext.__hasError = true;
            evaluationContext.__success = false;
            
            // Continue processing remaining chains - they might handle the error
        }
    }
}
