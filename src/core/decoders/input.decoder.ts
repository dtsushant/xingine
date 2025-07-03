import {Decoder,  exact, optional, string} from "decoders";
import {eventBindingsDecoder} from "./action.decoder";
import {styleDecoder} from "./style.decoder";
import {InputMeta} from "../component/input-meta-map";
import {iconMetaDecoder} from "./icon.decoder";

export const inputMetaDecoder : Decoder<InputMeta> = exact({
    name: string,
    placeholder:optional(string),
    event:optional(eventBindingsDecoder),
    style:optional(styleDecoder),
    icon:optional(iconMetaDecoder)
});