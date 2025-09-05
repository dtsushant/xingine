import { StyleMeta } from "../expressions/style";
import { EventBindings } from "../expressions";
import { WithWrapIn } from "./wrap-in-meta";

export interface TextMeta extends WithWrapIn<{
  content: string;
  style?: StyleMeta;
  event?: EventBindings;
  tag?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'em' | 'small';
  htmlAttributes?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}> {}
