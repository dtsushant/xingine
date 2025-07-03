import {Decoder, object, optional, record, string} from "decoders";
import {StyleMeta} from "../expressions/style";
import {dynamicShapeDecoder} from "./shared.decoder";

export const styleDecoder:Decoder<StyleMeta> = object({
    className:optional(string),
    style:optional(record(dynamicShapeDecoder)),
})