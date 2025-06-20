import {
  array,
  boolean,
  date,
  Decoder,
  either,
  lazy,
  number,
  object,
  oneOf,
  optional,
  record,
  string,
} from "decoders";
import { Renderer } from "../component/component-meta-map";

export const dynamicShapeDecoder: Decoder<unknown> = lazy(() =>
  either(
    string,
    either(
      number,
      either(
        boolean,
        either(
          date,
          either(array(dynamicShapeDecoder), record(dynamicShapeDecoder)),
        ),
      ),
    ),
  ),
);

export const dynamicShapeListDecoder: Decoder<unknown[]> =
  array(dynamicShapeDecoder);

export const rendererDecoder = object({
  mode: optional(string),
  layout: optional(object({
    display: optional(string),
    columns: optional(number),
    spacing: optional(either(string, number)),
    alignment: optional(string),
  })),
  interaction: optional(object({
    clickable: optional(boolean),
    hoverable: optional(boolean),
    draggable: optional(boolean),
    keyboardNavigable: optional(boolean),
  })),
  display: optional(object({
    showBorder: optional(boolean),
    showShadow: optional(boolean),
    backgroundColor: optional(string),
    textColor: optional(string),
    borderRadius: optional(either(string, number)),
    opacity: optional(number),
  })),
  responsive: optional(object({
    breakpoints: optional(object({
      mobile: optional(object({})),
      tablet: optional(object({})),
      desktop: optional(object({})),
    })),
    hiddenOn: optional(array(string)),
  })),
  animation: optional(object({
    type: optional(string),
    duration: optional(number),
    easing: optional(string),
    animateOnMount: optional(boolean),
  })),
  cssClasses: optional(array(string)),
  customStyles: optional(record(either(string, number))),
  accessibility: optional(object({
    role: optional(string),
    ariaLabel: optional(string),
    ariaDescription: optional(string),
    tabIndex: optional(number),
  })),
}) as Decoder<Renderer>;
