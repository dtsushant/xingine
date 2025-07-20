import {Decoder, object, optional, string} from "decoders";
import {LinkMeta} from "../component";
import {eventBindingsDecoder} from "./action.decoder";
import {styleDecoder} from "./style.decoder";
import {iconMetaDecoder} from "./icon.decoder";

export const linkDecoder:Decoder<LinkMeta> = object({
    path:string,
    event:optional(eventBindingsDecoder),
    style:optional(styleDecoder),
    icon:optional(iconMetaDecoder),
    label:optional(string)
});