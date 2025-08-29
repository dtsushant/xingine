import {EventBindings} from "../expressions";
import {IconMeta} from "./icon-meta-map";
import {StyleMeta} from "../expressions/style";

export interface ButtonMeta{
    name: string;
    content?: string | IconMeta;
    event?:EventBindings;
    style?:StyleMeta;
    [key: string]: unknown;
}