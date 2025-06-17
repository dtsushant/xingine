import {
  ComponentMeta,
  ComponentMetaMap,
  DetailDispatchProperties,
  FormDispatchProperties,
  TabDispatchProperties,
  TableDispatchProperties,
} from "./component/component-meta-map";
import {ConditionalExpression} from "./expressions/operators";

export interface IconMeta {
  name?: string; // e.g. "UserOutlined"
  color?: string; // style.color
  size?: number | string; // style.fontSize
  spin?: boolean;
  rotate?: number;
  twoToneColor?: string;
  className?: string;
}

export interface ExpositionRule {
  /**
   * Whether the component/property should be visible.
   * Can be a static boolean or a condition to evaluate.
   */
  visible?: boolean | ConditionalExpression;

  /**
   * Whether the component/property should be disabled (read-only).
   */
  disabled?: boolean | ConditionalExpression;

  /**
   * Optional CSS class name(s).
   */
  className?: string;

  /**
   * Optional inline style (key-value pairs as string).
   */
  style?: Record<string, string>;

  /**
   * Icon key, to be looked up from a predefined icon map.
   */
  icon?: IconMeta;


  /**
   * Tooltip text to show on hover.
   */
  tooltip?: string;

  /**
   * Display order among sibling components.
   */
  order?: number;


  /**
   * Optional badge/tag like "beta", "recommended", etc.
   */
  tag?: string;

  /**
   * Name of the wrapper element or layout type (e.g., 'div', 'card', 'fieldset').
   */
  wrapper?: string;


  /**
   * Logical group/section this component belongs to.
   */
  section?: string;


}

export interface Panel {
  presidium: string;
  assembly: string;
  doctrine: string;
}

export interface LayoutMandate {
  layout: string;
  structure: Panel;
  clearanceRequired?: string[];
}

export type UIComponent = {
  component: string;
  path: string;
  expositionRule?: ExpositionRule;
  layout?: string;
  roles?: string[];
  permissions?: string[];
  meta?: ComponentMeta;
};

export interface Comrade {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
}

export interface Permission {
  name: string;
  description: string;
}

export interface GroupedPermission {
  [key: string]: Permission[];
}

export interface ModulePropertyOptions {
  uiComponent?: UIComponent[];
  permissions: Permission[];
  description?: string;
}

export interface ModuleProperties extends ModulePropertyOptions {
  name: string;
}

export interface ProvisioneerProperties {
  name: string;
  description?: string;
  layoutMandate: LayoutMandate;
  clearance: Permission[];
}

export type GenericErrors = Record<string, string | Record<string, string>>;

export type ProvisioneerProps = Partial<ProvisioneerProperties> & { name: string };

export type ComponentDispatchByComponent<T extends keyof ComponentMetaMap> =
  T extends "FormRenderer"
    ? FormDispatchProperties
    : T extends "TableRenderer"
      ? TableDispatchProperties
      : T extends "TabRenderer"
        ? TabDispatchProperties
        : T extends "DetailRenderer"
          ? DetailDispatchProperties
          : never;

export type ComponentDispatchMap = {
  [K in keyof ComponentMetaMap]: ComponentDispatchByComponent<K>;
};

export interface CommissarProperties<
  TReq = unknown,
  TOperative extends keyof ComponentMetaMap = keyof ComponentMetaMap,
> {
  layout?: string;
  expositionRule?: ExpositionRule;
  component: string;
  operative: TOperative;
  meta?: ComponentMetaMap[TOperative];
  directive: new () => TReq;
  dispatch?: ComponentDispatchMap[TOperative];
  preAction?: string;
  postAction?: string;
}
