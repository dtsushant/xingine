import { Decoder, array, boolean, number, object, optional, string } from "decoders";
import { SliderMeta } from "../xingine.type";
import { layoutComponentDetailListDecoder } from "../xingine.decoder";
import { styleDecoder } from "./style.decoder";
import { eventBindingsDecoder } from "./action.decoder";

/**
 * Decoder for SliderMeta objects
 * Validates slide configuration for presentation/slideshow components
 */
export const sliderMetaDecoder: Decoder<SliderMeta> = object({
  // Required: Array of slides (LayoutComponentDetail)
  slides: layoutComponentDetailListDecoder,
  
  // Optional presentation settings
  autoPlay: optional(boolean),
  autoPlayInterval: optional(number),
  showNavigation: optional(boolean),
  showDots: optional(boolean),
  infinite: optional(boolean),
  startIndex: optional(number),
  
  // Optional styling and events
  style: optional(styleDecoder),
  event: optional(eventBindingsDecoder),
});
