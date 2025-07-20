export type SerializableAction =
    | string // shorthand: "toggleDarkMode"
    | {
    action: string;            // e.g., "setState", "navigate"
    args?: Record<string, unknown>; // optional arguments
    valueFromEvent?: boolean;  // useful for input/change handlers
};


type StateSetter<T> = (value: T | ((prev: T) => T)) => void;

export interface ColorPalette {
    [key: string]: string;
}

export interface PartySeal {
    emblemUrl: string;
    motto: string;
    colorPalette: ColorPalette;
    issuedBy: string;
}

export interface PanelControlContext {
    collapsed: boolean;
    setCollapsed: StateSetter<boolean>;
    darkMode: boolean;
    setDarkMode: StateSetter<boolean>;
    mobileMenuVisible: boolean;
    setMobileMenuVisible: StateSetter<boolean>;
    partySeal: PartySeal;
    layoutLoading: boolean;
    panelProps: Record<string,unknown>;
    headerActionContext: Record<string, unknown>;
    setHeaderActionContext: StateSetter<Record<string, unknown>>;
}

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
    /** INTERNAL: Do not use outside ActionContextRegistry */
    __state?:Record<string, unknown>;
}

type ActionHandler = (
    args: Record<string, unknown> | undefined,
    ctx: ActionContext,
    event?: unknown
) => void | Promise<void>;

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
    navigate: (args, ctx) => {
        if (!args || typeof args.path !== 'string') {
            throw new Error('navigate requires args.path to be a string');
        }
        ctx.navigate(args.path);
    },

    setState: (args, ctx) => {
        if (!args || typeof args.key !== 'string') {
            throw new Error('Invalid setState args');
        }
        ctx.setState(args.key, args.value);
    },

    makeApiCall: async (params, ctx) => {
        if (!params || typeof (params as any).url !== 'string') {
            throw new Error('Invalid makeApiCall args');
        }
        await ctx.makeApiCall(params as {
            url: string;
            method?: string;
            body?: unknown;
        });
    },

    toggleState: (args, ctx) => {
        if (!args || typeof args.key !== 'string') {
            throw new Error('navigate requires args.path to be a string');
        }
        ctx.setState<boolean>(args.key, (prev: boolean) => !prev);
    },




};

export function runAction(
    action: SerializableAction | undefined,
    context: ActionContext,
    event?: unknown
): void {
    if (!action) return;

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

    const handler = actionRegistry[name];
    if (handler) {
        handler(args, context);
    } else if (context.dynamic) {
        context.dynamic(name, args, event);
    } else {
        throw new Error(`Unknown action: ${name}`);
    }
}
