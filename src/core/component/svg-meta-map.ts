import {StyleMeta} from "../expressions";
import { WithWrapIn } from "./wrap-in-meta";

export interface SvgMeta extends WithWrapIn<{
    /**
     * The raw SVG markup string.
     * This must be a valid, sanitized SVG starting with `<svg>...</svg>`.
     */
    svg?: string;

    style?:StyleMeta;

    /**
     * Optional title/label for accessibility or tooltip.
     */
    title?: string;

    /**
     * Optional alt text or semantic label (used for a11y enhancement).
     */
    alt?: string;

    [key: string]: unknown;
}> {}