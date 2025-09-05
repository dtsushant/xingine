import {EventBindings, StyleMeta} from "../expressions";
import {IconMeta} from "./icon-meta-map";
import { WithWrapIn } from "./wrap-in-meta";

export interface InputMeta extends WithWrapIn<{
    name: string;
    placeholder?: string;
    event?:EventBindings;
    style?: StyleMeta;
    icon?:IconMeta;
    [key: string]: unknown;
}> {}