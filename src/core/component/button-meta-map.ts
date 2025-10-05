import {EventBindings} from "../expressions";
import {IconMeta} from "./icon-meta-map";
import {StyleMeta} from "../expressions/style";
import { WithWrapIn } from "./wrap-in-meta";

export interface ButtonMeta extends WithWrapIn<{
    name: string;
    content?: string | IconMeta;
    text?: string; // If Icon and text both are required pass the data to text
    event?:EventBindings;
    style?:StyleMeta;
    [key: string]: unknown;
}> {}