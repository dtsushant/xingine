import {
    ComponentMeta, ComponentMetaMap, ConditionalMeta,
    ExpositionRule,
    GenericErrors, LayoutComponentDetail,
    LayoutMandate, LayoutRenderer,
    ModuleProperties,
    ModulePropertyOptions,
    Panel,
    Permission, Renderer, SiderMeta, TabMeta,
    UIComponent, UIComponentDetail, WrapperMeta,
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
import {isRenderer, isUIComponentDetail} from "./xingine.util";
import {dynamicShapeDecoder, inputMetaDecoder} from "./decoders";
import {eventBindingsDecoder} from "./decoders/action.decoder";
import {iconMetaDecoder} from "./decoders/icon.decoder";
import {styleDecoder} from "./decoders/style.decoder";

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
    meta: layoutComponentDetailDecoder,
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

export const uiComponentDetailDecoder: Decoder<UIComponentDetail> = object({
  component: string,
  path: string,
  layout: optional(string),
  expositionRule: optional(expositionRuleDecoder),
  roles: optional(array(string)),
  permissions: optional(array(string)),
  meta: optional(componentMetaDecoder()),
});

export const rendererDecoder: Decoder<Renderer> = lazy(()=>object({
  componentDetail: uiComponentDecoder,
  mode: optional(string),

  layout: optional(
      exact({
        display: optional(string),
        columns: optional(number),
        spacing: optional(either(string, number)),
        alignment: optional(string),
      })
  ),

  interaction: optional(
      exact({
        clickable: optional(boolean),
        hoverable: optional(boolean),
        draggable: optional(boolean),
        keyboardNavigable: optional(boolean),
      })
  ),

  display: optional(
      exact({
        showBorder: optional(boolean),
        showShadow: optional(boolean),
        backgroundColor: optional(string),
        textColor: optional(string),
        borderRadius: optional(either(string, number)),
        opacity: optional(number),
      })
  ),



  animation: optional(
      exact({
        type: optional(string),
        duration: optional(number),
        easing: optional(string),
        animateOnMount: optional(boolean),
      })
  ),
  responsive: optional(
      exact({
          breakpoints: optional(
              exact({
                  mobile: optional(lazy(() => rendererDecoder)),
                  tablet: optional(lazy(() => rendererDecoder)),
                  desktop: optional(lazy(() => rendererDecoder)),
              })
          ),
        hiddenOn: optional(array(either(constant('mobile'), constant('tablet'), constant('desktop')))),
      })
  ),

  cssClasses: optional(array(string)),
  customStyles: optional(dict(either(string, number))),

  accessibility: optional(
      exact({
        role: optional(string),
        ariaLabel: optional(string),
        ariaDescription: optional(string),
        tabIndex: optional(number),
      })
  ),
}));


export const uiComponentDecoder: Decoder<UIComponent> = lazy(() =>
    unknown.transform((input) => {
        if (isUIComponentDetail(input as UIComponent)) {
            return uiComponentDetailDecoder.verify(input);
        } else if (isRenderer(input as UIComponent)) {
            return rendererDecoder.verify(input);
        } else {
            throw new Error("Invalid UIComponent: must be UIComponentDetail or Renderer");
        }
    })
);

export const uiComponentDecoderList:Decoder<UIComponent[]>= array(uiComponentDecoder);



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



