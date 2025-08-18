import {
    ComponentMeta, ComponentMetaMap, ConditionalMeta,
    GenericErrors, LayoutComponentDetail,
     LayoutRenderer,
    Permission,  SiderMeta, TabMeta,
      WrapperMeta, Commissar, PathProperties,
} from "./xingine.type";
import {
  array, boolean, constant,
  Decoder, dict,
  either, exact, lazy, number,
  object,
  optional,
  record,
  string,
  unknown,
} from "decoders";

import { formMetaDecoder } from "./decoders/form.decoder";
import { detailMetaDecoder } from "./decoders/detail.decoder";
import { tableMetaDecoder } from "./decoders/table.decoder";
import { chartMetaDecoder } from "./decoders/chart.decoder";
import {conditionalExpressionDecoder} from "./decoders/expression.decoder";
import {dynamicShapeDecoder, inputMetaDecoder} from "./decoders";
import {eventBindingsDecoder} from "./decoders/action.decoder";
import {iconMetaDecoder} from "./decoders/icon.decoder";
import {styleDecoder} from "./decoders/style.decoder";
import {apiComponentDecoder} from "./decoders/api-component.decoder";

const tabMetaDecoder: Decoder<TabMeta> = object({
  tabs: array(
    object({
      label: string,
      component: string,
      meta: unknown,
    }),
  ),
  event: optional(eventBindingsDecoder)
}).transform(
  (tabMeta) =>
    ({
      event: tabMeta.event,
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
    case "WrapperRenderer":
        return wrapperMetaDecoder.verify(input);
  case "ConditionalRenderer":
      return conditionalMetaDecoder.verify(input);
    case "LayoutRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "HeaderRenderer":
        return wrapperMetaDecoder.verify(input);
    case "SiderRenderer":
        return siderMetaDecoder.verify(input);
    case "ContentRenderer":
        return wrapperMetaDecoder.verify(input);
    case "FooterRenderer":
        return wrapperMetaDecoder.verify(input);
    case "ButtonRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "InputRenderer":
        return inputMetaDecoder.verify(input);
    case "SwitchRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "BadgeRenderer:":
        return record(dynamicShapeDecoder).verify(input);
    case "DropdownRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "AvatarRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "MenuRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "TitleRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "CardRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "TextRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "LinkRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "PopupRenderer":
        return record(dynamicShapeDecoder).verify(input);
    case "APIRenderer":
        return apiComponentDecoder.verify(input);
    default:
      return record(dynamicShapeDecoder).verify(input);
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



export const layoutComponentDetailDecoder:Decoder<LayoutComponentDetail>= object({
    meta: componentMetaDecoder(),
})

export const layoutComponentDetailListDecoder:Decoder<LayoutComponentDetail[]> = array(layoutComponentDetailDecoder);

export const pathPropertiesDecoder:Decoder<PathProperties> = object({
    path: optional(string),
    overrideLayout: optional(string),
})

export const commissarDecoder: Decoder<Commissar> = object({
  path: either(string, pathPropertiesDecoder),
  permission: optional(array(string)),
  meta: componentMetaDecoder(),
});

export const layoutRendererDecoder: Decoder<LayoutRenderer> = object({
  type: string,
  header: optional(
    exact({
      style: optional(styleDecoder),
      meta: optional(layoutComponentDetailDecoder),
    })
  ),
  content: exact({
    style: optional(styleDecoder),
    meta: array(commissarDecoder),
  }),
  sider: optional(
    exact({
      style: optional(styleDecoder),
      meta: optional(layoutComponentDetailDecoder),
    })
  ),
  footer: optional(
    exact({
      style: optional(styleDecoder),
      meta: optional(layoutComponentDetailDecoder),
    })
  ),
});

export const layoutRendererListDecoder: Decoder<LayoutRenderer[]> = array(layoutRendererDecoder);

export const wrapperMetaDecoder: Decoder<WrapperMeta> = lazy(() =>
    unknown.transform((input) => {
        const base = dict(unknown).verify(input);
        if (!base.ok) return base;

        const obj = base as Record<string, unknown>;
        const output: WrapperMeta = {};

        try {
            if('event' in obj){
                output.event = eventBindingsDecoder.verify(obj.event)
            }
            if ('style' in obj) {
                output.style = styleDecoder.verify(obj.style);
            }
            if ('children' in obj) {
                output.children = layoutComponentDetailListDecoder.verify(obj.children);
            }
            if ('content' in obj) {
                output.content = string.verify(obj.content);
            }

            for (const key in obj) {
                if (key !== 'className' && key !== 'style' && key !== 'children') {
                    output[key] = dynamicShapeDecoder.verify(obj[key]);
                }
            }

            return { ok: true, value: output };
        } catch (e) {
            return { ok: false, error: (e as Error).message };
        }
    })
);

export const siderMetaDecoder: Decoder<SiderMeta> = wrapperMetaDecoder;

export const conditionalMetaDecoder:Decoder<ConditionalMeta>=exact({
    condition: conditionalExpressionDecoder,
    trueComponent: layoutComponentDetailDecoder,
    falseComponent:optional(layoutComponentDetailDecoder)
})

const permissionDecoder: Decoder<Permission> = object({
  name: string,
  description: string,
});

export const genericErrorsDecoder: Decoder<GenericErrors> = record(
  either(string, record(string)),
);
