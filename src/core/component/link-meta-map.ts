import {IconMeta} from "./icon-meta-map";
import {EventBindings, StyleMeta} from "../expressions";

export interface LinkMeta {
    path: string;
    event?: EventBindings;
    style?: StyleMeta;
    icon?: IconMeta;
    label?: string;
}