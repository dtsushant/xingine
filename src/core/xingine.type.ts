import {
  ChartMeta,
  DetailDispatchProperties, DetailMeta,
  FormDispatchProperties, FormMeta,
  TabDispatchProperties,
  TableDispatchProperties, TableMeta,
} from "./component/component-meta-map";
import {ConditionalExpression, EventBindings} from "./expressions";
import {ButtonMeta, IconMeta, InputMeta} from "./component";
import {StyleMeta} from "./expressions/style";
import {SvgMeta} from "./component/svg-meta-map";





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


export interface LayoutComponentDetail {
  meta?: ComponentMeta; // For xingine component meta - more flexible typing
}

export interface PathProperties {
  path?:string;
  overrideLayout?: string; // If this component should override the layout
}

export interface Commissar extends LayoutComponentDetail {
  path: string | PathProperties;
  permission?: string[];
}


export interface LayoutRenderer {
  type: string;
  style?: StyleMeta;
  header?: {
    style?: StyleMeta;
    meta?: LayoutComponentDetail;
  };
  content: {
    style?:StyleMeta;
    meta: Commissar[];
  };
  sider?: {
    style?: StyleMeta;
    meta?: LayoutComponentDetail;
  };
  footer?: {
    style?: StyleMeta;
    meta?: LayoutComponentDetail;
  };
}



export interface TabMeta {
  event?:EventBindings;
  tabs: {
    label: string;
    component: keyof ComponentMetaMap;
    meta: ComponentMetaMap[keyof ComponentMetaMap];
  }[];
  dispatch?: TabDispatchProperties;
  [key: string]: unknown;
}

export interface WrapperMeta {
  [key:string] : unknown;
  event?:EventBindings;
  content?:string;
  style?:StyleMeta;
  children?:LayoutComponentDetail[];
}

export type SiderMeta = WrapperMeta;

export interface ConditionalMeta{
    condition: ConditionalExpression;
    trueComponent: LayoutComponentDetail;
    falseComponent?: LayoutComponentDetail;
    [key: string]: unknown;
}

export type ComponentMetaMap = {
  FormRenderer: FormMeta;
  TableRenderer: TableMeta;
  TabRenderer: TabMeta;
  DetailRenderer: DetailMeta;
  ChartRenderer: ChartMeta;
  WrapperRenderer: WrapperMeta;
  LayoutRenderer: Record<string, unknown>;
  HeaderRenderer: WrapperMeta;
  SiderRenderer: SiderMeta;
  ContentRenderer: WrapperMeta;
  FooterRenderer: WrapperMeta;
  ConditionalRenderer: ConditionalMeta;
  // UI components
  IconRenderer: IconMeta;
  SvgRenderer:SvgMeta;
  ButtonRenderer: ButtonMeta;
  InputRenderer: InputMeta;
  SwitchRenderer: Record<string, unknown>;
  BadgeRenderer: Record<string, unknown>;
  DropdownRenderer: Record<string, unknown>;
  AvatarRenderer: Record<string, unknown>;
  MenuRenderer: Record<string, unknown>;
  TitleRenderer: Record<string, unknown>;
  CardRenderer: Record<string, unknown>;
  TextRenderer: Record<string, unknown>;
  LinkRenderer: Record<string, unknown>;
  PopupRenderer: Record<string, unknown>;
} & {
  [K:string]:Record<string, unknown>;
};
export interface ComponentMeta<
    T extends keyof ComponentMetaMap = keyof ComponentMetaMap,
> {
  component: T;
  properties: ComponentMetaMap[T];
}

export interface LayoutExpositionMap {
  [key: string]: LayoutComponentDetail | Commissar;
}


/**
 * Alternative generic version if you need type safety for specific layouts
 * Maps directly to LayoutRenderer structure
 */
export interface TypedLayoutExposition<
  TPresidium extends keyof LayoutExpositionMap = keyof LayoutExpositionMap,
  TAssembly extends keyof LayoutExpositionMap = keyof LayoutExpositionMap,
  TSider extends keyof LayoutExpositionMap = keyof LayoutExpositionMap,
  TDoctrine extends keyof LayoutExpositionMap = keyof LayoutExpositionMap
> {
  type: string;                    // Layout type identifier (maps to LayoutRenderer.type)
  presidium?: TPresidium;          // Header component key (maps to LayoutRenderer.header)
  assembly: TAssembly[];           // Content component keys (maps to LayoutRenderer.content)  
  sider?: TSider;                  // Sidebar component key (maps to LayoutRenderer.sider)
  doctrine?: TDoctrine;            // Footer component key (maps to LayoutRenderer.footer)
}

/**
 * Registry for managing layout component definitions
 */
export interface LayoutComponentRegistry {
  register(key: string, component: LayoutComponentDetail | Commissar): void;
  get(key: string): LayoutComponentDetail | Commissar | undefined;
  has(key: string): boolean;
  getAll(): LayoutExpositionMap;
  clear(): void;
  delete(key: string): boolean;
  size(): number;
  getKeys(): string[];
}

/**
 * Layout builder utility type for creating LayoutRenderer from TypedLayoutExposition
 */
export interface LayoutExpositionBuilder {
  build<T extends TypedLayoutExposition>(exposition: T, registry: LayoutExpositionMap): LayoutRenderer;
}

/**
 * Factory function type for building LayoutRenderer from TypedLayoutExposition
 */
export type LayoutExpositionFactory = <T extends TypedLayoutExposition>(
  exposition: T, 
  registry: LayoutExpositionMap,
  options?: {
    style?: StyleMeta;
  }
) => LayoutRenderer;


export type GenericErrors = Record<string, string | Record<string, string>>;

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


export interface FieldValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
}
