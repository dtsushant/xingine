import { Decoder, exact, lazy, optional, oneOf, string } from "decoders";
import { WrapInMeta } from "../component/wrap-in-meta";
import { styleDecoder } from "./style.decoder";
import { eventBindingsDecoder } from "./action.decoder";

const wrapWithDecoder = oneOf([
    "div",
    "p", 
    "pre",
    "section",
    "article",
    "main",
    "aside",
    "header",
    "footer",
    "nav",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
    "ul",
    "ol"
]);

export const wrapInMetaDecoder: Decoder<WrapInMeta> = exact({
    wrapWith: wrapWithDecoder,
    style: optional(styleDecoder),
    event: optional(eventBindingsDecoder),
    wrap: optional(lazy(() => wrapInMetaDecoder)),  // Recursive support
    scope: optional(string)
});
