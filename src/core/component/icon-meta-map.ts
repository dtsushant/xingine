import {SvgMeta} from "./svg-meta-map";
import {EventBindings, StyleMeta} from "../expressions";
import { WithWrapIn } from "./wrap-in-meta";

export interface IconMeta extends WithWrapIn<{
    name?: string; // e.g. "UserOutlined"
    color?: string; // style.color
    size?: number | string; // style.fontSize
    spin?: boolean;
    rotate?: number;
    twoToneColor?: string;
    style?: StyleMeta;
    event?:EventBindings;
    svg?:SvgMeta;
    [key: string]: unknown;
}> {}