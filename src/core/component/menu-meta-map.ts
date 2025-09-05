import {IconMeta} from "./icon-meta-map";
import {EventBindings} from "../expressions";
import { WrapInMeta, WithWrapIn } from "./wrap-in-meta";

export interface MenuItems {
    key: string;
    label: string;
    icon?: IconMeta;
    path?: string;
    event?: EventBindings;
    children?: MenuItems[];
    wrapIn?: WrapInMeta;  // Support for wrapping individual menu items
}

export interface MenuMeta extends WithWrapIn<{
    menuItems?: MenuItems[];
    event?: EventBindings;
}> {}