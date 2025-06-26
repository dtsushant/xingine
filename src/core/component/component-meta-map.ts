import {
  FieldInputTypeProperties,
  FieldMeta,
} from "../component/form-meta-map";
import { DetailFieldMeta } from "../component/detail-meta-map";
import { Operator } from "../expressions/operators";
import {Renderer} from "../xingine.type";

export type Method = "POST" | "GET";
export interface ColumnMeta {
  title?: string;
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

export interface FormMeta {
  fields: FieldMeta[];
  action: string;
  dispatch?: FormDispatchProperties;
}

export interface DetailMeta {
  fields: DetailFieldMeta[];
  action: string;
  dispatch?: DetailDispatchProperties;
}

export interface TableMeta {
  columns: ColumnMeta[];
  dataSourceUrl: string;
  rowKey?: string;
  dispatch?: TableDispatchProperties;
}

export interface StyleMeta{
    className?: string;
    style?: Record<string, unknown>;
}



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
  labels?: string[];
  datasets?: ChartDataset[];
  options?: Record<string, unknown>;
  dataSourceUrl?: string;
  /**
   * Renderer configuration for this specific chart.
   */
  renderer?: Renderer;
}

export interface ChartMeta {
  charts: ChartConfig[];
  /**
   * Global renderer configuration for all charts in this meta.
   * Individual chart renderers will override these settings.
   */
  renderer?: Renderer;
}


export * from "./form-meta-map";
