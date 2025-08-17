import {boolean, Decoder, either, object, optional, record, string, array, lazy} from "decoders";
import {
    EventActionContext,
    EventBindings,
    SerializableAction,
    ConditionalChain,
    FormActionEventMeta
} from "../expressions";
import {dynamicShapeDecoder} from "./shared.decoder";
import {conditionalExpressionDecoder} from "./expression.decoder";

// Add decoder for ConditionalChain
const conditionalChainDecoder: Decoder<ConditionalChain> = object({
    condition: conditionalExpressionDecoder, // Accepts any valid ConditionalExpression
    action: array(lazy(() => serializableActionDecoder)),
});

export const serializableActionDecoder: Decoder<SerializableAction> = either(
    string,
    object({
        action: string,
        args: optional(record(dynamicShapeDecoder)),
        valueFromEvent: optional(boolean),
        chains: optional(array(conditionalChainDecoder)),
        then: optional(array(lazy(() => serializableActionDecoder))),
    })
);

export const serializableActionDecoderList:Decoder<SerializableAction[]> = array(serializableActionDecoder);
export const formActionEventMetaDecoder:Decoder<FormActionEventMeta> = object({
    actionsToExecute: optional(serializableActionDecoderList)
});

export const eventActionKeys = [
    'onClick',
    'onHover',
    'onChange',
    'onInput',
    'onFocus',
    'onBlur',
    'onSubmit',
    'onClear',
    'onKeyDown',
    'onKeyUp',
] as const satisfies ReadonlyArray<keyof EventActionContext>;

export const eventBindingsDecoder:Decoder<EventBindings> = object(
    Object.fromEntries(
        eventActionKeys.map((key) => [key, optional(serializableActionDecoder)])
    ) as Record<keyof  EventActionContext , Decoder<SerializableAction | undefined>>
);
