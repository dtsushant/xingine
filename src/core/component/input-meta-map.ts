import {EventBindings, StyleMeta} from "../expressions";
import {IconMeta} from "./icon-meta-map";

export interface InputMeta{
    name: string;
    placeholder?: string;
    event?:EventBindings;
    style?: StyleMeta;
    icon?:IconMeta;
}