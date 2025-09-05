import {array, Decoder, exact, lazy, optional, string} from "decoders";
import {MenuMeta, MenuItems} from "../component";
import {iconMetaDecoder} from "./icon.decoder";
import {eventBindingsDecoder} from "./action.decoder";
import {wrapInMetaDecoder} from "./wrap-in-meta.decoder";

export const menuItemsDecoder: Decoder<MenuItems> = exact({
    key: string,
    label: string,
    icon: optional(iconMetaDecoder),
    path: optional(string),
    event: optional(eventBindingsDecoder),
    children: optional(array(lazy(() => menuItemsDecoder))),
    wrapIn: optional(wrapInMetaDecoder)
});

export const menuMetaDecoder: Decoder<MenuMeta> = exact({
    menuItems: optional(array(menuItemsDecoder)),
    event: optional(eventBindingsDecoder),
    wrapIn: optional(wrapInMetaDecoder)  // Support wrapIn at menu level
});