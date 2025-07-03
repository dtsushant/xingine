import {boolean, Decoder, either, exact, number, optional, string} from "decoders";
import {IconMeta} from "../component/icon-meta-map";
import {styleDecoder} from "./style.decoder";
import {svgMetaDecoder} from "./svg.decoder";
import {eventBindingsDecoder} from "./action.decoder";

export const iconMetaDecoder : Decoder<IconMeta> = exact({
    name: optional(string),
    color: optional(string),
    size: optional(either(number, string)),
    spin: optional(boolean),
    rotate: optional(number),
    twoToneColor: optional(string),
    style: optional(styleDecoder),
    svg:optional(svgMetaDecoder),
    event:optional(eventBindingsDecoder)
});