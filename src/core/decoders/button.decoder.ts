import {boolean, Decoder, either, exact, number, optional, string} from "decoders";
import {ButtonMeta, IconMeta} from "../component";
import {iconMetaDecoder} from "./icon.decoder";
import {eventBindingsDecoder} from "./action.decoder";
import {styleDecoder} from "./style.decoder";

export const buttonMetaDecoder : Decoder<ButtonMeta> = exact({
    name: string,
    content:optional(either(string,iconMetaDecoder)),
    event:optional(eventBindingsDecoder),
    style:optional(styleDecoder)
});