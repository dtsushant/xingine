import {boolean, Decoder, either, object, optional, record, string} from "decoders";
import {EventActionContext, EventBindings, SerializableAction} from "../expressions/action";
import {dynamicShapeDecoder} from "./shared.decoder";

export const serializableActionDecoder: Decoder<SerializableAction> = either(string , object({
    action: string,
    args: optional(record(dynamicShapeDecoder)),
    valueFromEvent: optional(boolean),
}));

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
