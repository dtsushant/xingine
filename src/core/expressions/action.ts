import {evaluateCondition} from "../utils/type";
import { formActionRegistry,actionRegistry} from "./context";
import {
    ActionResult,
    SerializableAction,
    ConditionalChain,
    ActionExecutionContext,

} from "./operators";



const combinedActionHandler = {...actionRegistry, ...formActionRegistry}

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
        const handler = combinedActionHandler[name];
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
