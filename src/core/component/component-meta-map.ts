import {
  FieldInputTypeProperties,
  FieldMeta,
} from "../component/form-meta-map";
import { DetailFieldMeta } from "../component/detail-meta-map";
import {Operator, SerializableAction} from "../expressions/operators";
import {EventBindings} from "../expressions";
import {StyleMeta} from "../expressions";
import { WrapInMeta, WithWrapIn } from "./wrap-in-meta";

export type Method = "POST" | "GET";
export interface ColumnMeta {
  title?: string;
  event?:EventBindings;
  dataIndex?: string;
  key?: string;
  render?: string; // optional: string name of render function
  width?: number | string;
  sortable?: boolean;
  filterable?: {
    apply?: boolean;
    operator?: Operator;
    inputType?: keyof FieldInputTypeProperties;
    searchFieldKey?: string;
  };
}

export interface FormDispatchProperties {
  formSubmissionResponse: unknown;
  onSuccessRedirectTo?: {
    component: string;
    payloadNamePath?: Record<string, string>;
  };
}

export interface TableDispatchProperties {
  onRowClickNavigateTo?: {
    component: string;
  };
  refreshAfterAction?: boolean;
}

export interface TabDispatchProperties {
  activateTab?: string;
}

export interface DetailDispatchProperties {
  scrollToField?: string;
}

export interface FormMeta extends WithWrapIn<{
  fields: FieldMeta[];
  action: string;
  event?:EventBindings;
  showJsonEditor?: boolean;
  /**
   * optional Wrapper to wrap the children fields in
   */
  childWrapper?:WrapInMeta;
  [key: string]: unknown;
}> {}

export interface DetailMeta extends WithWrapIn<{
  fields: DetailFieldMeta[];
  event?:EventBindings;
  action: string;
  dispatch?: DetailDispatchProperties;
  [key: string]: unknown;
}> {}

export interface TableMeta extends WithWrapIn<{
  columns: ColumnMeta[];
  dataSourceUrl: string;
  rowKey?: string;
  event?:EventBindings;
  handleRowClick?: SerializableAction; // optional: string name of row click handler function
  [key: string]: unknown;
}> {}





export type ChartType = "bar" | "line" | "pie" | "scatter";



export interface ChartDataset {
  label: string;
  data: number[] | { x: number | string; y: number }[];
  backgroundColor?: string;
  borderColor?: string;
}

export interface ChartConfig {
  type: ChartType;
  title?: string;
  width?:number;
  height?: number;
  labels?: string[];
  datasets?: ChartDataset[];
  options?: Record<string, unknown>;
  dataSourceUrl?: string;
  event?:EventBindings;
  style?:StyleMeta;
}

export interface ChartMeta extends WithWrapIn<{
  charts: ChartConfig[];
  event?:EventBindings;
  [key: string]: unknown;
}> {}


export * from "./form-meta-map";
