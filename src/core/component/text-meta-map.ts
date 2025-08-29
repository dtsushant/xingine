import { StyleMeta } from "../expressions/style";
import { EventBindings } from "../expressions";

export interface TextMeta {
  content: string;
  style?: StyleMeta;
  event?: EventBindings;
  tag?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'em' | 'small';
  htmlAttributes?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}
