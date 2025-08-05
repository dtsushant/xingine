import {ConditionalExpression} from "./operators";
import {evaluateCondition} from "../utils/type";
import {resolvePath} from "../utils/type";

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

export interface ActionExecutionContext {
    global: ActionContext;
    content: ActiveContentContext;
}

export type ActionHandler = (
    args: Record<string, unknown> | undefined,
    context: ActionExecutionContext
) => ActionResult | Promise<ActionResult | void> | void;

export const ActionContextSubscribers = new WeakMap<
    ActionContext,
    Map<string, Set<() => void>>
>();

// Helper functions for path resolution with new context structure
function resolveContextValue(path: string, context: ActionExecutionContext, chainContext?: { result?: unknown }, componentId?: string): unknown {
    if (path.startsWith('__global.')) {
        const globalPath = path.substring('__global.'.length);
        return resolvePath(context.global.getAllState(), globalPath);
    } else if (path.startsWith('GLOBAL.')) {
        // Special keyword to access global state from component context
        const globalPath = path.substring('GLOBAL.'.length);
        return resolvePath(context.global.getAllState(), globalPath);
    } else if (path.startsWith('__current.')) {
        const currentPath = path.substring('__current.'.length);
        // Use the provided componentId, or fall back to 'default'
        const targetComponentId = componentId || 'default';
        const componentStore = context.content.getComponentStateStore(targetComponentId);
        return resolvePath(componentStore?.getAllState() || {}, currentPath);
    } else if (path.startsWith('__result.')) {
        const resultPath = path.substring('__result.'.length);
        return resolvePath(chainContext?.result || {}, resultPath);
    } else if (path.startsWith('result.')) {
        // Handle legacy result paths like 'result.user.name'
        const resultPath = path.substring('result.'.length);
        return resolvePath(chainContext?.result || {}, resultPath);
    } else {
        // Default behavior - try result first (for backward compatibility), then global
        // Only fallback if chainContext doesn't exist, not if resolvePath returns undefined
        if (chainContext?.result !== undefined) {
            return resolvePath(chainContext.result, path);
        } else {
            return resolvePath(context.global.getAllState(), path);
        }
    }
}

function getStateStore(context: ActionExecutionContext, args: Record<string, unknown> | undefined): ComponentStateStore | ActionContext {
    const componentId = args?.componentId as string;
    const key = args?.key as string;
    
    // Check if key starts with GLOBAL to force global state access
    if (key?.startsWith('GLOBAL.')) {
        return context.global;
    }
    
    // Check if key starts with CONTENT to force content-level state access
    if (key?.startsWith('CONTENT.')) {
        // Create a wrapper that implements ComponentStateStore interface for content state
        return {
            componentId: 'content',
            getState: (k: string) => context.content.getContentState?.(k),
            setState: (k: string, v: unknown) => context.content.setContentState?.(k, v),
            getAllState: () => context.content.getAllContentState?.() || {}
        };
    }
    
    // Use component state if componentId is specified
    if (componentId) {
        return context.content.getComponentStateStore(componentId);
    }
    
    // Default to component state (component-first approach)
    // If no componentId is provided, try to use default component context
    try {
        return context.content.getComponentStateStore('default');
    } catch {
        // Fallback to global context if no component context available
        return context.global;
    }
}


export const actionRegistry: Record<string, ActionHandler> = {
    navigate: (args, ctx): void => {
        if (!args || typeof args.path !== 'string') {
            throw new Error('navigate requires args.path to be a string');
        }
        ctx.global.navigate(args.path);
    },

    setState: (args, ctx): ActionResult => {
        if (!args || typeof args.key !== 'string') {
            return { success: false, error: new Error('Invalid setState args') };
        }

        try {
            let value = args.value;
            let key = args.key;
            
            // Only attempt path resolution if it's a string and we have chainContext
            if (typeof value === 'string' && ctx.content.chainContext) {
                // Check if the string looks like a path
                const startsWithPathPrefix = value.startsWith('__') || value.startsWith('result.') || value.startsWith('GLOBAL.');
                const containsDots = value.includes('.');
                const looksLikeComplexPath = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)+/.test(value);
                
                const looksLikePath = startsWithPathPrefix || containsDots || looksLikeComplexPath;
                
                if (looksLikePath) {
                    try {
                        const resolvedValue = resolveContextValue(String(value), ctx, ctx.content.chainContext, args.componentId as string);
                        value = resolvedValue;
                    } catch (error) {
                        console.warn('Path resolution failed for:', value, error);
                    }
                }
            }
            
            // Get the appropriate state store (component-level, content-level, or global)
            const stateStore = getStateStore(ctx, args);
            
            // Strip prefixes from the key for actual storage
            if (key.startsWith('GLOBAL.')) {
                key = key.substring('GLOBAL.'.length);
            } else if (key.startsWith('CONTENT.')) {
                key = key.substring('CONTENT.'.length);
            }
            
            stateStore.setState(key, value);
            
            return { success: true, result: { key: args.key, value } }; // Return original key for reference
        } catch (error) {
            return { success: false, error };
        }
    },

    getState: (args, ctx): ActionResult => {
        if (!args || typeof args.key !== 'string') {
            return { success: false, error: new Error('Invalid getState args') };
        }

        try {
            let key = args.key;
            
            // Get the appropriate state store (component-level, content-level, or global)
            const stateStore = getStateStore(ctx, args);
            
            // Strip prefixes from the key for actual storage
            if (key.startsWith('GLOBAL.')) {
                key = key.substring('GLOBAL.'.length);
            } else if (key.startsWith('CONTENT.')) {
                key = key.substring('CONTENT.'.length);
            }
            
            const value = stateStore.getState(key);
            
            // Optionally store result in another state key
            const stateKey = args.stateKey as string;
            if (stateKey) {
                const targetStore = getStateStore(ctx, { ...args, key: stateKey });
                let targetKey = stateKey;
                if (targetKey.startsWith('GLOBAL.')) {
                    targetKey = targetKey.substring('GLOBAL.'.length);
                } else if (targetKey.startsWith('CONTENT.')) {
                    targetKey = targetKey.substring('CONTENT.'.length);
                }
                targetStore.setState(targetKey, value);
            }
            
            return { success: true, result: value };
        } catch (error) {
            return { success: false, error };
        }
    },

    makeApiCall: async (params, ctx): Promise<ActionResult> => {
        if (!params || typeof (params as any).url !== 'string') {
            return { success: false, error: new Error('Invalid makeApiCall args') };
        }
        
        try {
            // Always use global context for API calls - simplified architecture
            const globalCtx = ctx.global as any;
            if (!globalCtx.makeApiCall) {
                return { success: false, error: new Error('makeApiCall not available in global context') };
            }
            
            const result = await globalCtx.makeApiCall(params as {
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
            let key = args.key;
            
            // Get the appropriate state store (component-level, content-level, or global)
            const stateStore = getStateStore(ctx, args);
            
            // Strip prefixes from the key for actual storage
            if (key.startsWith('GLOBAL.')) {
                key = key.substring('GLOBAL.'.length);
            } else if (key.startsWith('CONTENT.')) {
                key = key.substring('CONTENT.'.length);
            }
            
            const currentValue = stateStore.getState(key) as boolean;
            const newValue = !currentValue;
            stateStore.setState(key, newValue);
            
            return { success: true, result: { key: args.key, value: newValue } }; // Return original key for reference
        } catch (error) {
            return { success: false, error };
        }
    },

    // UI/Auth control actions - delegate to context methods
    login: async (args, ctx): Promise<ActionResult> => {
        // These auth methods should be available on global context
        const globalCtx = ctx.global as any;
        if (!globalCtx.login) {
            return { success: false, error: new Error('Login action requires login method to be provided in global ActionContext') };
        }
        const { username, password } = (args as any) || {};
        if (!username || !password) {
            return { success: false, error: new Error('Login requires username and password') };
        }
        
        try {
            const result = await globalCtx.login({ username, password });
            return { success: result.success, result, error: result.success ? undefined : new Error(result.error || 'Login failed') };
        } catch (error) {
            return { success: false, error };
        }
    },

    logout: async (args, ctx): Promise<ActionResult> => {
        const globalCtx = ctx.global as any;
        if (!globalCtx.logout) {
            return { success: false, error: new Error('Logout action requires logout method to be provided in global ActionContext') };
        }
        
        try {
            await globalCtx.logout();
            return { success: true, result: { success: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    error: (args, ctx): ActionResult => {
        const providedMessage = (args as any)?.message;
        const details = (args as any)?.details;
        const chainContext = ctx.content.chainContext;
        
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
            const globalCtx = ctx.global as any;
            if (!globalCtx.error) {
                // Fallback implementation if no error method provided
                const stateStore = getStateStore(ctx, args);
                stateStore.setState('errorMessage', message);
                stateStore.setState('hasError', true);
                console.error('Action error:', message);
            } else {
                globalCtx.error(message, details || chainContext?.error);
            }
            return { success: true, result: { message, details } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Storage actions
    setLocalStorage: (args, ctx): ActionResult => {
        if (!ctx.global.setLocalStorage) {
            return { success: false, error: new Error('setLocalStorage action requires setLocalStorage method to be provided in global ActionContext') };
        }
        const { key, value } = (args as any) || {};
        if (!key || value === undefined) {
            return { success: false, error: new Error('setLocalStorage requires key and value') };
        }
        
        try {
            // Only attempt path resolution if it's a string and we have chainContext
            let resolvedValue = value;
            if (typeof value === 'string' && ctx.content.chainContext) {
                try {
                    // Check if the string looks like a path
                    const startsWithPathPrefix = value.startsWith('__') || value.startsWith('result.');
                    const containsDots = value.includes('.');
                    const looksLikeComplexPath = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)+/.test(value);
                    
                    const looksLikePath = startsWithPathPrefix || containsDots || looksLikeComplexPath;
                    
                    if (looksLikePath) {
                        const pathResolvedValue = resolveContextValue(String(value), ctx, ctx.content.chainContext, (args as any)?.componentId);
                        resolvedValue = pathResolvedValue;
                    }
                } catch (error) {
                    // If path resolution fails, keep original value
                    console.warn('Path resolution failed for localStorage value:', value, error);
                }
            }
            
            ctx.global.setLocalStorage(key, resolvedValue);
            return { success: true, result: { key, value: resolvedValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    getLocalStorage: (args, ctx): ActionResult => {
        if (!ctx.global.getLocalStorage) {
            return { success: false, error: new Error('getLocalStorage action requires getLocalStorage method to be provided in global ActionContext') };
        }
        const { key, stateKey } = (args as any) || {};
        if (!key) {
            return { success: false, error: new Error('getLocalStorage requires key') };
        }
        
        try {
            const value = ctx.global.getLocalStorage(key);
            
            // Store result in state if stateKey provided
            if (stateKey) {
                const stateStore = getStateStore(ctx, args);
                stateStore.setState(stateKey, value);
            }
            
            return { success: true, result: value };
        } catch (error) {
            return { success: false, error };
        }
    },

    removeLocalStorage: (args, ctx): ActionResult => {
        if (!ctx.global.removeLocalStorage) {
            return { success: false, error: new Error('removeLocalStorage action requires removeLocalStorage method to be provided in global ActionContext') };
        }
        const { key } = (args as any) || {};
        if (!key) {
            return { success: false, error: new Error('removeLocalStorage requires key') };
        }
        
        try {
            ctx.global.removeLocalStorage(key);
            return { success: true, result: { key } };
        } catch (error) {
            return { success: false, error };
        }
    },

    clearLocalStorage: (args, ctx): ActionResult => {
        if (!ctx.global.clearLocalStorage) {
            return { success: false, error: new Error('clearLocalStorage action requires clearLocalStorage method to be provided in global ActionContext') };
        }
        
        try {
            ctx.global.clearLocalStorage();
            return { success: true, result: { cleared: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Toast/notification actions
    showToast: (args, ctx): ActionResult => {
        const { message, type = 'info' } = (args as any) || {};
        if (!message) {
            return { success: false, error: new Error('showToast requires message') };
        }
        
        try {
            if (!ctx.global.showToast) {
                // Fallback: use setState for basic toast handling
                const stateStore = getStateStore(ctx, args);
                stateStore.setState('toastMessage', message);
                stateStore.setState('toastType', type);
                stateStore.setState('showToast', true);
                console.log(`Toast [${type}]:`, message);
            } else {
                ctx.global.showToast(message, type);
            }
            return { success: true, result: { message, type } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Counter actions for state management demos
    incrementCounter: (args, ctx): ActionResult => {
        try {
            console.log('🔧 incrementCounter called with args:', args, 'ctx:', ctx);
            const stateStore = getStateStore(ctx, args);
            console.log('🔧 getStateStore returned:', stateStore);
            const componentId = (args as any)?.componentId || 'default';
            console.log('🔧 componentId:', componentId);
            
            // Strip componentId from args when getting state store to avoid confusion
            const currentValue = stateStore.getState(componentId) as number || 0;
            console.log('🔧 currentValue:', currentValue);
            const newValue = currentValue + 1;
            console.log('🔧 newValue:', newValue);
            stateStore.setState(componentId, newValue);
            console.log('🔧 setState called with:', componentId, newValue);
            
            console.log(`📈 Counter incremented: ${componentId} = ${newValue}`);
            return { success: true, result: { key: componentId, value: newValue } };
        } catch (error) {
            console.error('🚨 incrementCounter error:', error);
            return { success: false, error };
        }
    },

    decrementCounter: (args, ctx): ActionResult => {
        try {
            const stateStore = getStateStore(ctx, args);
            const componentId = (args as any)?.componentId || 'default';
            
            // Strip componentId from args when getting state store to avoid confusion
            const currentValue = stateStore.getState(componentId) as number || 0;
            const newValue = Math.max(0, currentValue - 1); // Don't go below 0
            stateStore.setState(componentId, newValue);
            
            console.log(`📉 Counter decremented: ${componentId} = ${newValue}`);
            return { success: true, result: { key: componentId, value: newValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Content state actions
    updateContentState: (args, ctx): ActionResult => {
        if (!args || typeof (args as any).key !== 'string') {
            return { success: false, error: new Error('updateContentState requires args.key to be a string') };
        }
        
        try {
            const { key, value } = args as any;
            
            // Force content-level state by using CONTENT prefix
            const contentStore = getStateStore(ctx, { ...args, key: `CONTENT.${key}` });
            contentStore.setState(key, value);
            
            console.log(`📄 Content state updated: ${key} = ${value}`);
            return { success: true, result: { key, value } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Component input update action
    updateComponentInput: (args, ctx): ActionResult => {
        try {
            const componentId = (args as any)?.componentId || 'default';
            const value = (args as any)?.value || '';
            
            const stateStore = getStateStore(ctx, args);
            stateStore.setState(componentId, value);
            
            console.log(`⌨️ Component input updated: ${componentId} = "${value}"`);
            return { success: true, result: { key: componentId, value } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Toggle component state action
    toggleComponent: (args, ctx): ActionResult => {
        try {
            const componentId = (args as any)?.componentId || 'default';
            
            const stateStore = getStateStore(ctx, args);
            const currentValue = stateStore.getState(componentId) as boolean || false;
            const newValue = !currentValue;
            stateStore.setState(componentId, newValue);
            
            console.log(`🔄 Component toggled: ${componentId} = ${newValue}`);
            return { success: true, result: { key: componentId, value: newValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Toggle content filter action
    toggleContentFilter: (args, ctx): ActionResult => {
        try {
            const { key } = args as any || { key: 'filterActive' };
            
            // Force content-level state
            const contentStore = getStateStore(ctx, { ...args, key: `CONTENT.${key}` });
            const currentValue = contentStore.getState(key) as boolean || false;
            const newValue = !currentValue;
            contentStore.setState(key, newValue);
            
            console.log(`🔍 Content filter toggled: ${key} = ${newValue}`);
            return { success: true, result: { key, value: newValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Login action
    loginUser: async (args, ctx): Promise<ActionResult> => {
        const { username, password } = args as any || {};
        
        console.log('🔐 Login attempt:', { username });
        
        try {
            // Use makeApiCall for real API request
            if (ctx.global.makeApiCall) {
                const result = await ctx.global.makeApiCall({
                    url: 'auth/login',
                    method: 'POST',
                    body: { username, password }
                }) as any;

                console.log('🌐 API Response:', result);

                if (result?.success) {
                    // Store auth data from API response
                    if (ctx.global.setLocalStorage && result.token) {
                        ctx.global.setLocalStorage('auth_token', result.token);
                        ctx.global.setLocalStorage('user_data', JSON.stringify(result.user));
                    }
                    
                    // Update global state
                    ctx.global.setState('isAuthenticated', true);
                    ctx.global.setState('currentUser', result.user);
                    
                    console.log('✅ Login successful via API');
                    
                    // Show success toast and redirect
                    if (ctx.global.showToast) {
                        ctx.global.showToast(`Welcome back, ${result.user?.username || username}!`, 'success');
                    }
                    
                    setTimeout(() => {
                        if (ctx.global.navigate) {
                            ctx.global.navigate('/');
                        }
                    }, 1500);
                    
                    return { success: true, result: result };
                } else {
                    // API returned error
                    if (ctx.global.showToast) {
                        ctx.global.showToast(result?.message || 'Login failed', 'error');
                    }
                    console.log('❌ Login failed via API:', result?.message);
                    return { success: false, error: new Error(result?.message || 'Login failed') };
                }
            } else {
                // Fallback to mock validation when makeApiCall is not available
                console.log('⚠️ API not available, using mock validation');
                
                if (username === 'admin' && password === 'password') {
                    // Store auth data
                    if (ctx.global.setLocalStorage) {
                        ctx.global.setLocalStorage('auth_token', 'mock-jwt-token-12345');
                        ctx.global.setLocalStorage('user_data', JSON.stringify({
                            id: '1',
                            username: username,
                            email: 'admin@example.com',
                            role: 'admin'
                        }));
                    }
                    
                    // Update global state
                    ctx.global.setState('isAuthenticated', true);
                    ctx.global.setState('currentUser', {
                        id: '1',
                        username: username,
                        email: 'admin@example.com',
                        role: 'admin'
                    });
                    
                    console.log('✅ Mock login successful');
                    
                    // Show success toast and redirect
                    if (ctx.global.showToast) {
                        ctx.global.showToast(`Welcome back, ${username}!`, 'success');
                    }
                    
                    setTimeout(() => {
                        if (ctx.global.navigate) {
                            ctx.global.navigate('/');
                        }
                    }, 1500);
                    
                    return { success: true, result: { message: 'Login successful' } };
                } else if (username === 'user' && password === 'user123') {
                    // Store auth data for regular user
                    if (ctx.global.setLocalStorage) {
                        ctx.global.setLocalStorage('auth_token', 'mock-jwt-token-67890');
                        ctx.global.setLocalStorage('user_data', JSON.stringify({
                            id: '2',
                            username: username,
                            email: 'user@example.com',
                            role: 'user'
                        }));
                    }
                    
                    // Update global state
                    ctx.global.setState('isAuthenticated', true);
                    ctx.global.setState('currentUser', {
                        id: '2',
                        username: username,
                        email: 'user@example.com',
                        role: 'user'
                    });
                    
                    console.log('✅ Mock login successful');
                    
                    // Show success toast and redirect
                    if (ctx.global.showToast) {
                        ctx.global.showToast(`Welcome back, ${username}!`, 'success');
                    }
                    
                    setTimeout(() => {
                        if (ctx.global.navigate) {
                            ctx.global.navigate('/');
                        }
                    }, 1500);
                    
                    return { success: true, result: { message: 'Login successful' } };
                } else {
                    // Show error toast
                    if (ctx.global.showToast) {
                        ctx.global.showToast('Invalid username or password', 'error');
                    }
                    console.log('❌ Mock login failed: Invalid credentials');
                    return { success: false, error: new Error('Invalid username or password') };
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
            if (ctx.global.showToast) {
                ctx.global.showToast(errorMessage, 'error');
            }
            console.error('💥 Login error:', error);
            return { success: false, error };
        }
    },

    // Logout action
    logoutUser: async (args, ctx): Promise<ActionResult> => {
        try {
            // Clear auth data
            if (ctx.global.removeLocalStorage) {
                ctx.global.removeLocalStorage('auth_token');
                ctx.global.removeLocalStorage('user_data');
            }
            
            // Update global state
            ctx.global.setState('isAuthenticated', false);
            ctx.global.setState('currentUser', null);
            
            if (ctx.global.showToast) {
                ctx.global.showToast('You have been logged out', 'info');
            }
            
            // Redirect to login
            setTimeout(() => {
                if (ctx.global.navigate) {
                    ctx.global.navigate('/login');
                }
            }, 1000);
            
            return { success: true, result: { message: 'Logout successful' } };
        } catch (error) {
            return { success: false, error };
        }
    },
};

export async function runAction(
    action: SerializableAction | undefined,
    context: ActionExecutionContext,
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

    // Update content context with current chain context
    const executionContext: ActionExecutionContext = {
        ...context,
        content: {
            ...context.content,
            event,
            chainContext
        }
    };

    try {
        const handler = actionRegistry[name];
        let result: ActionResult ;
        
        if (handler) {
            const res = await handler(args, executionContext);
            if(res)
                result = res as ActionResult;
            else
                result = { success: true };
        } else {
            // Check if global context has dynamic method
            const globalCtx = context.global as any;
            if (globalCtx.dynamic) {
                try {
                    await globalCtx.dynamic(name, args, event);
                    result = { success: true, result: { action: name, args } };
                } catch (error) {
                    result = { success: false, error };
                }
            } else {
                result = { success: false, error: new Error(`Unknown action: ${name}`) };
            }
        }

        // Execute mapped actions unconditionally after main action (success or failure)
        if (thenActions && thenActions.length > 0) {
            await processThenActions(thenActions, executionContext, result, event);
        }

        // Process conditional chains if present
        if (chains && chains.length > 0) {
            await processConditionalChains(chains, executionContext, result, event);
        }

        return result;
    } catch (error) {
        const errorResult: ActionResult = { success: false, error };
        
        // Process conditional chains even on error - let conditions decide
        if (chains && chains.length > 0) {
            await processConditionalChains(chains, executionContext, errorResult, event);
        }
        
        return errorResult;
    }
}

async function processThenActions(
    mappedActions: SerializableAction[],
    context: ActionExecutionContext,
    mainResult: ActionResult,
    event?: unknown
): Promise<void> {
    // Create context for value resolution including main action result
    const valueContext:Record<string, unknown> = {
        ...context.global.getAllState(),
        __result: mainResult.result,
        __error: mainResult.error,
        __hasError: !mainResult.success,
        __success: mainResult.success
    };

    // Create updated execution context for chain context
    const chainContext = {
        error: mainResult.error,
        result: mainResult.result,
        success: mainResult.success
    };

    try {
        // Execute mapped actions in sequence
        for (const mappedAction of mappedActions) {
            try {
                const executionContext: ActionExecutionContext = {
                    ...context,
                    content: {
                        ...context.content,
                        chainContext
                    }
                };
                
                const result = await runAction(mappedAction, executionContext, event, chainContext);
                // Don't overwrite the original __result from the main action
                // The mapped actions should only use the original result for resolution
                // Each mapped action's result is not part of the chain context
            } catch (error) {
                // Continue with remaining actions even on error
                console.warn('Mapped action error:', error);
            }
        }
    } finally {
        // No cleanup needed as we're not modifying the original context
    }
}

async function processConditionalChains(
    chains: ConditionalChain[],
    context: ActionExecutionContext,
    mainResult: ActionResult,
    event?: unknown
): Promise<void> {
    // Create evaluation context from current state and main action result
    const evaluationContext = {
        ...context.global.getAllState(),
        __result: mainResult.result,
        __error: mainResult.error,
        __hasError: !mainResult.success,
        __success: mainResult.success
    };

    // Process each chain in order
    for (const chain of chains) {
        try {
            // Evaluate the condition using new path resolution
            const conditionMet = evaluateCondition(chain.condition, evaluationContext);
            if (conditionMet) {
                // Execute each action in the chain sequentially
                for (const chainAction of chain.action) {
                    const chainContext = {
                        error: mainResult.error,
                        result: mainResult.result,
                        success: mainResult.success
                    };
                    
                    const executionContext: ActionExecutionContext = {
                        ...context,
                        content: {
                            ...context.content,
                            chainContext
                        }
                    };
                    
                    const chainResult = await runAction(chainAction, executionContext, event, chainContext);
                    // Update evaluation context with new results for subsequent actions in this chain
                    if(chainResult){
                        evaluationContext.__result = chainResult.result;
                        evaluationContext.__error = chainResult.error;
                        evaluationContext.__hasError = !chainResult.success;
                        evaluationContext.__success = chainResult.success;

                        // Update actual state context for subsequent actions
                        Object.assign(evaluationContext, context.global.getAllState());
                    }
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
