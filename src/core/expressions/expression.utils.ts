import {ActionExecutionContext, SerializableAction} from "./operators";
import {resolvePath} from "../utils";

export function resolveContextValue(path: string, context: ActionExecutionContext, chainContext?: { result?: unknown }, componentId?: string): unknown {
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

export const fetchFromActionArgs = (action: SerializableAction, key: string): unknown | undefined => {
    // If action is a string, return undefined
    if (typeof action === 'string') {
        return undefined;
    }

    // If action is an object with args containing the specified key
    if (typeof action === 'object' && 'args' in action && action.args) {
        const args = action.args as Record<string, unknown>;

        // Return the value for the specified key if it exists
        if (args[key]) {
            return args[key];
        }
    }

    // Return undefined if no handler found for the key
    return undefined;
}

