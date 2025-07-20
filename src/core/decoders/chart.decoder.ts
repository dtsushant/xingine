import {
  array,
  Decoder, number,
  object,
  oneOf,
  optional,
  string,
  unknown,
} from "decoders";
import {
  ButtonView,
  ChartConfig,
  ChartDataset,
  ChartMeta,
  ChartType,
} from "../component/component-meta-map";
import {eventBindingsDecoder} from "./action.decoder";
import {styleDecoder} from "./style.decoder";

const chartDatasetDecoderBase = object({
  label: string,
  data: array(unknown), // number[] or {x, y}[]
  backgroundColor: optional(string),
  borderColor: optional(string),
});

export function chartDatasetDecoder(): Decoder<ChartDataset> {
  return chartDatasetDecoderBase.transform((chartDatasetDecoderBase) => {
    return chartDatasetDecoderBase as ChartDataset;
  });
}

export const chartTypeDecoder: Decoder<ChartType> = oneOf([
  "bar",
  "line",
  "pie",
  "scatter",
]);
export const chartConfigDecoder: Decoder<ChartConfig> = object({
  type: chartTypeDecoder,
  title: optional(string),
  height:optional(number),
  width:optional(number),
  labels: optional(array(string)),
  datasets: optional(array(chartDatasetDecoder())),
  dataSourceUrl: optional(string),
  options: optional(object({})),
  event: optional(eventBindingsDecoder),
  style:optional(styleDecoder)
});

export const chartMetaDecoder: Decoder<ChartMeta> = object({
  charts: array(chartConfigDecoder),
  event: optional(eventBindingsDecoder)

});
