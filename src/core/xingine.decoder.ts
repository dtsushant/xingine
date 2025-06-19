import {
  ExpositionRule,
  GenericErrors,
  LayoutMandate,
  ModuleProperties,
  ModulePropertyOptions,
  Panel,
  Permission,
  UIComponent,
} from "./xingine.type";
import {
  array, boolean,
  Decoder, dict,
  either, exact, number,
  object,
  optional,
  record,
  string,
  unknown,
} from "decoders";
import {
  ColumnMeta,
  ComponentMeta,
  ComponentMetaMap,
  TableMeta,
  TabMeta,
} from "./component/component-meta-map";
import { formMetaDecoder } from "./decoders/form.decoder";
import { detailMetaDecoder } from "./decoders/detail.decoder";
import { tableMetaDecoder } from "./decoders/table.decoder";
import { chartMetaDecoder } from "./decoders/chart.decoder";
import {conditionalExpressionDecoder} from "./decoders/expression.decoder";

const tabMetaDecoder: Decoder<TabMeta> = object({
  tabs: array(
    object({
      label: string,
      component: string,
      meta: unknown,
    }),
  ),
}).transform(
  (tabMeta) =>
    ({
      tabs: tabMeta.tabs.map((tab) => ({
        label: tab.label,
        component: tab.component,
        meta: decodeMetaByComponent(tab.component, tab.meta),
      })),
    }) as TabMeta,
);

function decodeMetaByComponent(component: string, input: unknown): object {
  switch (component) {
    case "FormRenderer":
      return formMetaDecoder.verify(input);
    case "TableRenderer":
      return tableMetaDecoder.verify(input);
    case "TabRenderer":
      return tabMetaDecoder.verify(input);
    case "DetailRenderer":
      return detailMetaDecoder.verify(input);
    case "ChartRenderer":
      return chartMetaDecoder.verify(input);
    default:
      throw new Error(
        `Unknown component type '${component}' for meta decoding`,
      );
  }
}

const componentMetaDecoderBase = object({
  component: string,
  properties: unknown,
});

export function componentMetaDecoder(): Decoder<ComponentMeta> {
  return componentMetaDecoderBase.transform((baseComponentMeta) => {
    const strictMeta = decodeMetaByComponent(
      baseComponentMeta.component,
      baseComponentMeta.properties,
    ) as ComponentMetaMap[keyof ComponentMetaMap];

    return { ...baseComponentMeta, properties: strictMeta } as ComponentMeta;
  });
}

export const iconMetaDecoder = exact({
  name: optional(string),
  color: optional(string),
  size: optional(either(number, string)),
  spin: optional(boolean),
  rotate: optional(number),
  twoToneColor: optional(string),
  className: optional(string),
});
export const expositionRuleDecoder:Decoder<ExpositionRule> = exact({
  visible: optional(either(boolean, conditionalExpressionDecoder)),
  disabled: optional(either(boolean, conditionalExpressionDecoder)),
  className: optional(string),
  style: optional(dict(string)),
  icon: optional(iconMetaDecoder),
  tooltip: optional(string),
  order: optional(number),
  tag: optional(string),
  wrapper: optional(string),
  section: optional(string),
});

export const panelDecoder: Decoder<Panel> = object({
  presidium: string,
  assembly: string,
  doctrine: string,
});

export const LayoutMandateDecoder: Decoder<LayoutMandate> = object({
  layout: string,
  structure: panelDecoder,
  clearanceRequired: optional(array(string)),
});

export const uiComponentDecoder: Decoder<UIComponent> = object({
  component: string,
  path: string,
  layout: optional(string),
  expositionRule: optional(expositionRuleDecoder),
  roles: optional(array(string)),
  permissions: optional(array(string)),
  meta: optional(componentMetaDecoder()),
});

/*export function uiComponentDecoder(): Decoder<UIComponent> {
  return uiComponentDecoderBase.transform((uiComponentDecoderBase) => {
    const base = uiComponentDecoderBase;
    const defaultLayout: LayoutMandate = {
      layout:'people',
      structure: {
        presidium: "people",
        assembly: "people",
        doctrine: "people",
      },
      clearanceRequired: [],
    };

    return {
      ...base,
      layout: base.layout ?? defaultLayout,
    };
  });
}*/

const permissionDecoder: Decoder<Permission> = object({
  name: string,
  description: string,
});

export const genericErrorsDecoder: Decoder<GenericErrors> = record(
  either(string, record(string)),
);

// ModulePropertyOptions decoder
const modulePropertyOptionsDecoder: Decoder<ModulePropertyOptions> = object({
  description: optional(string),
  uiComponent: optional(array(uiComponentDecoder)),
  permissions: array(permissionDecoder),
});

export const modulePropertyOptionsListDecoder: Decoder<
  ModulePropertyOptions[]
> = array(modulePropertyOptionsDecoder);

export const modulePropertiesDecoder: Decoder<ModuleProperties> = object({
  name: string,
  uiComponent: optional(array(uiComponentDecoder)),
  permissions: array(permissionDecoder),
  description: optional(string),
});

export const modulePropertiesListDecoder: Decoder<ModuleProperties[]> = array(
  modulePropertiesDecoder,
);

export * from "./decoders/shared.decoder";
export * from "./decoders/form.decoder";
export * from "./decoders/detail.decoder";
