import {Decoder, exact, optional, string, oneOf, either, number, boolean} from "decoders";
import {TextMeta} from "../component";
import {eventBindingsDecoder} from "./action.decoder";
import {styleDecoder} from "./style.decoder";
import {record, unknown} from "decoders";

const htmlTagDecoder = oneOf([
    "p", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "label", "strong", "em", "small"
]);

export const textMetaDecoder: Decoder<TextMeta> = exact({
    content: string,
    style: optional(styleDecoder),
    event: optional(eventBindingsDecoder),
    tag: optional(htmlTagDecoder),
    htmlAttributes: optional(record(either(string, either(number, boolean)))),
});
