import {Decoder, exact, object, optional, record, string} from "decoders";
import {SvgMeta} from "../component/svg-meta-map";
import {styleDecoder} from "./style.decoder";

export const svgMetaDecoder:Decoder<SvgMeta> = exact({
    svg:optional(string),
    style:optional(styleDecoder),
    title:optional(string),
    alt:optional(string)
})