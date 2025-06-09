import {
  array,
  boolean,
  Decoder,
  number,
  object,
  optional,
  string,
} from "decoders";
import {
  ColumnMeta,
  FieldInputTypeProperties,
  TableMeta,
} from "../component/component-meta-map";
import { operatorDecoder } from "../decoders/expression.decoder";
import { decodeFieldInputPropertiesByInputType } from "../decoders/form.decoder";

export const tableColumnDecoder: Decoder<ColumnMeta> = object({
  title: string,
  dataIndex: string,
  key: optional(string),
  render: optional(string),
  width: optional(number),
  sortable: optional(boolean),
  filterable: optional(
    object({
      apply: optional(boolean).transform((bool) => !!bool),
      searchFieldKey: optional(string),
      inputType: optional(string).transform((type) =>
        type ? (type as keyof FieldInputTypeProperties) : "input",
      ),
      operator: optional(operatorDecoder).transform((op) => op ?? "eq"),
    }),
  ),
});

export const tableMetaDecoder: Decoder<TableMeta> = object({
  columns: array(tableColumnDecoder),
  dataSourceUrl: string,
  rowKey: optional(string),
  pagination: optional(boolean),
});
