import {IconMeta} from "./icon-meta-map";
import {EventBindings} from "../expressions";

export interface MenuItems {
    key: string;
    label: string;
    icon?: IconMeta;
    path?: string;
    event?: EventBindings;
    children?: MenuItems[];
}
export interface MenuMeta {
    menuItems?: MenuItems[];
    event?:EventBindings;
}