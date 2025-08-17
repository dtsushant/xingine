import {
    ActionContext,
    ActionExecutionContext,
    ActionResult,
    ComponentStateStore,
    ConditionalChain, FormActionArgs, FormFieldSetterMeta,
    SerializableAction
} from "../operators";
import {evaluateCondition, resolvePath, resolveSluggedPath} from "../../utils";
import {serializableActionDecoderList} from "../../decoders";
import {resolveContextValue} from "../expression.utils";

export interface ApiCallMeta{
    url: string;
    method?: string;
    body?: unknown;
}

export interface NavigateMeta{
    path:string;
    params?: Record<string, unknown>;
}

export type PageActionArgs = {
    makeApiCall: ApiCallMeta;
    navigate: NavigateMeta;
    setState: { key: string; value: unknown; componentId?: string };
    getState: { key: string; stateKey?: string; componentId?: string };
    toggleState: { key: string; componentId?: string };
    clearState: { key?: string; componentId?: string };
    showToast: { message: string; type?: 'success' | 'error' | 'info' | 'warning' };
    logout: void;
    error: { message: string; details?: unknown };
    login: { username: string; password: string };
    loginUser: { username: string; password: string };
    logoutUser: void;
    setLocalStorage: { key: string; value: unknown };
    getLocalStorage: { key: string; stateKey?: string };
    removeLocalStorage: { key: string };
    clearLocalStorage: void;
    incrementCounter: { componentId?: string };
    decrementCounter: { componentId?: string };
    updateContentState: { key: string; value: unknown };
    updateComponentInput: { componentId?: string; value: unknown };
    toggleComponent: { componentId?: string };
    toggleContentFilter: { key?: string };
    showHide: { condition: unknown; provider?: unknown; data?: Record<string, unknown> };
    evaluateFieldCondition: { condition: unknown; formData?: Record<string, unknown>; fieldName?: string };
    startHighFrequencyTest: void;
    stopHighFrequencyTest: void;
    incrementSelectorCounter: { counter?: string };
    createMassComponents: { count?: number };
    cleanupMassComponents: void;
    massUpdateComponents: void;
};

export type ActionHandler<T extends keyof PageActionArgs> = (
    args: PageActionArgs[T],
    context: ActionExecutionContext
) => ActionResult | Promise<ActionResult>;

export const ActionContextSubscribers = new WeakMap<
    ActionContext,
    Map<string, Set<() => void>>
>();


export const slugResolver = (url:string,ctx:ActionExecutionContext,body:Record<string,unknown>)=>{
    let resolvedUrl = url;
    if (resolvedUrl.includes(':')) {
        // First try to resolve from URL params directly
        resolvedUrl = resolveSluggedPath(resolvedUrl, body);

        // If still has unresolved slugs, try to resolve from context state
        if (resolvedUrl.includes(':')) {
            // Get all available state data for slug resolution
            const globalState = ctx.global.getAllState();
            const contentState = ctx.content.getAllContentState?.() || {};

            // Combine all available state data
            const allStateData = { ...globalState, ...contentState };

            // Attempt to resolve remaining slugs
            resolvedUrl = resolveSluggedPath(resolvedUrl, allStateData);
        }

        console.log(`🔗 URL slug resolution: ${url} -> ${resolvedUrl}`);
    }
    return resolvedUrl;
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

    // Use component state if componentId is explicitly specified
    if (componentId) {
        return context.content.getComponentStateStore(componentId);
    }

    // Default behavior: use global context
    // This is the expected behavior for most general actions
    return context.global;
}

export type pageActionRegistry = {
    [K in keyof PageActionArgs]: ActionHandler<K>
} & {
    [key: string]: (args: any, ctx: ActionExecutionContext) => ActionResult | Promise<ActionResult>;
};


export const actionRegistry: pageActionRegistry = {
    navigate: (args, ctx): ActionResult => {
        if (!args || typeof args.path !== 'string') {
            return { success: false, error: new Error('navigate requires args.path to be a string') };
        }
        // Resolve the path using slug resolver if it contains slugs
        const resolvedPath = slugResolver(args.path, ctx, args.params || {});

        try {
            ctx.global.navigate(resolvedPath);
            return { success: true, result: { path: resolvedPath } };
        } catch (error) {
            return { success: false, error };
        }
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
        console.log("calling makeAPI call with args",params);
        if (!params || typeof (params as any).url !== 'string') {
            return { success: false, error: new Error('Invalid makeApiCall args') };
        }

        try {
            const componentId = (params as any).componentId as string;
                       // Create resolved params with the new URL
            const resolvedUrl = slugResolver(params.url, ctx, params.body as Record<string, unknown> || {});
            const resolvedParams = {
                ...params,
                url: resolvedUrl
            };

            // If componentId is provided, try to use component-level API call
            if (componentId) {
                try {
                    const componentStore = ctx.content.getComponentStateStore(componentId) as any;
                    if (componentStore && componentStore.makeApiCall) {
                        const result = await componentStore.makeApiCall(resolvedParams);
                        return { success: true, result };
                    }
                } catch (error) {
                    // Component-level API call failed, return the error
                    return { success: false, error };
                }
            }

            // Fallback to global context for API calls
            const globalCtx = ctx.global as any;
            if (!globalCtx.makeApiCall) {
                return { success: false, error: new Error('makeApiCall not available in global context') };
            }

            const result = await globalCtx.makeApiCall(resolvedParams);
            console.log("API call result:", result);

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

    clearState: (args, ctx): ActionResult => {
        try {
            const key = (args as any)?.key;
            const componentId = (args as any)?.componentId;

            if (key) {
                // Clear specific key
                const stateStore = getStateStore(ctx, args);
                let targetKey = key;

                // Strip prefixes from the key for actual storage
                if (targetKey.startsWith('GLOBAL.')) {
                    targetKey = targetKey.substring('GLOBAL.'.length);
                } else if (targetKey.startsWith('CONTENT.')) {
                    targetKey = targetKey.substring('CONTENT.'.length);
                }

                stateStore.setState(targetKey, undefined);
                return { success: true, result: { key: key, cleared: true } };
            } else if (componentId) {
                // Clear all state for specific component
                const componentStore = ctx.content.getComponentStateStore(componentId);
                const allState = componentStore.getAllState();
                Object.keys(allState).forEach(k => componentStore.setState(k, undefined));
                return { success: true, result: { componentId, cleared: Object.keys(allState).length } };
            } else {
                // Clear all global state (dangerous!)
                const allGlobalState = ctx.global.getAllState();
                Object.keys(allGlobalState).forEach(k => ctx.global.setState(k, undefined));
                return { success: true, result: { cleared: Object.keys(allGlobalState).length } };
            }
        } catch (error) {
            return { success: false, error };
        }
    },

    /**
     * Show/Hide action for conditional field rendering
     * Evaluates a condition using the provided data provider and returns visibility status
     */
    showHide: (args, ctx): ActionResult => {
        try {
            const { condition, provider, data } = args as any || {};

            if (!condition) {
                return { success: false, error: new Error('showHide requires condition parameter') };
            }

            let evaluationData: Record<string, unknown> = {};

            if(ctx.formActionContext)
            {
                // If formActionContext is available, use its data
                evaluationData = ctx.formActionContext.getFormData() || {};
            }

            // If a data provider is specified, use its data
            if (provider && typeof provider.getData === 'function') {
                evaluationData = {...evaluationData, ...provider.getData()};
            }
            // If direct data is provided, use it
            else if (data && typeof data === 'object') {
                evaluationData = {...evaluationData,...data as Record<string, unknown>};
            }
            // Fallback to global state
            else {
                evaluationData = ctx.global.getAllState();
            }

            // Evaluate the condition
            const shouldShow = evaluateCondition(condition, evaluationData);

            console.log(`🔍 showHide evaluated:`, {
                condition,
                data: evaluationData,
                result: shouldShow
            });

            return { success: true, result: shouldShow };
        } catch (error) {
            console.error('❌ showHide error:', error);
            return { success: false, error, result: false }; // Default to hidden on error
        }
    },

    /**
     * Evaluate conditional expression for form field visibility
     * Specifically designed for form field conditional rendering
     */
    evaluateFieldCondition: (args, ctx): ActionResult => {
        try {
            const { condition, formData, fieldName } = args as any || {};

            if (!condition) {
                return { success: false, error: new Error('evaluateFieldCondition requires condition parameter') };
            }

            // Get evaluation data from form data or global state
            const evaluationData = formData || ctx.global.getAllState();

            // Evaluate the condition
            const shouldShow = evaluateCondition(condition, evaluationData);

            console.log(`📝 Field condition evaluated for ${fieldName}:`, {
                condition,
                data: evaluationData,
                result: shouldShow
            });

            return { success: true, result: shouldShow };
        } catch (error) {
            console.error('❌ evaluateFieldCondition error:', error);
            return { success: false, error, result: true }; // Default to visible on error
        }
    },

    // Performance Demo Actions
    startHighFrequencyTest: (args, ctx): ActionResult => {
        try {
            const globalStore = getStateStore(ctx, { key: 'GLOBAL.highFrequencyTest' });

            // Clear any existing interval
            const existingInterval = globalStore.getState('highFrequencyInterval');
            if (existingInterval) {
                clearInterval(existingInterval as any);
            }

            // Start new high-frequency updates
            let counter = 0;
            const interval = setInterval(() => {
                counter++;
                globalStore.setState('highFrequencyCounter', counter);

                // Auto-stop after 1000 updates to prevent infinite loop
                if (counter >= 1000) {
                    clearInterval(interval);
                    globalStore.setState('highFrequencyInterval', null);
                }
            }, 16); // ~60fps updates

            globalStore.setState('highFrequencyInterval', interval);
            globalStore.setState('highFrequencyCounter', 0);

            console.log('🚀 High frequency test started');
            return { success: true, result: { started: true, counter: 0 } };
        } catch (error) {
            return { success: false, error };
        }
    },

    stopHighFrequencyTest: (args, ctx): ActionResult => {
        try {
            const globalStore = getStateStore(ctx, { key: 'GLOBAL.highFrequencyTest' });
            const interval = globalStore.getState('highFrequencyInterval');

            if (interval) {
                clearInterval(interval as any);
                globalStore.setState('highFrequencyInterval', null);
            }

            console.log('⏹️ High frequency test stopped');
            return { success: true, result: { stopped: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    incrementSelectorCounter: (args, ctx): ActionResult => {
        try {
            const { counter } = args as any || { counter: 'A' };
            const stateKey = `selectorCounter${counter}`;

            const globalStore = getStateStore(ctx, { key: `GLOBAL.${stateKey}` });
            const currentValue = globalStore.getState(stateKey) as number || 0;
            const newValue = currentValue + 1;
            globalStore.setState(stateKey, newValue);

            console.log(`📊 Selector counter ${counter} incremented: ${newValue}`);
            return { success: true, result: { counter, value: newValue } };
        } catch (error) {
            return { success: false, error };
        }
    },

    createMassComponents: (args, ctx): ActionResult => {
        try {
            const { count = 100 } = args as any || {};
            const globalStore = getStateStore(ctx, { key: 'GLOBAL.massComponents' });

            // Create component data
            const components = Array.from({ length: count }, (_, i) => ({
                id: `component-${Date.now()}-${i}`,
                name: `Component ${i + 1}`,
                status: 'active',
                created: Date.now()
            }));

            globalStore.setState('massComponents', components);
            globalStore.setState('massComponentCount', count);

            console.log(`🏗️ Created ${count} mass components`);
            return { success: true, result: { count, components: components.length } };
        } catch (error) {
            return { success: false, error };
        }
    },

    cleanupMassComponents: (args, ctx): ActionResult => {
        try {
            const globalStore = getStateStore(ctx, { key: 'GLOBAL.massComponents' });

            globalStore.setState('massComponents', []);
            globalStore.setState('massComponentCount', 0);

            console.log('🧹 Mass components cleaned up');
            return { success: true, result: { cleaned: true } };
        } catch (error) {
            return { success: false, error };
        }
    },

    massUpdateComponents: (args, ctx): ActionResult => {
        try {
            const globalStore = getStateStore(ctx, { key: 'GLOBAL.massComponents' });
            const components = globalStore.getState('massComponents') as any[] || [];

            // Update all components with new timestamp
            const updatedComponents = components.map(comp => ({
                ...comp,
                lastUpdated: Date.now(),
                status: Math.random() > 0.5 ? 'active' : 'updating'
            }));

            globalStore.setState('massComponents', updatedComponents);
            globalStore.setState('lastMassUpdate', Date.now());

            console.log(`🔄 Mass updated ${updatedComponents.length} components`);
            return { success: true, result: { updated: updatedComponents.length } };
        } catch (error) {
            return { success: false, error };
        }
    }
};
