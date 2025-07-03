import {SvgMeta} from "./svg-meta-map";
import {EventBindings, StyleMeta} from "../expressions";

export interface IconMeta {
    name?: string; // e.g. "UserOutlined"
    color?: string; // style.color
    size?: number | string; // style.fontSize
    spin?: boolean;
    rotate?: number;
    twoToneColor?: string;
    style?: StyleMeta;
    event?:EventBindings;
    svg?:SvgMeta;
}