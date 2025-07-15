import {
  ChartMeta,
  DetailDispatchProperties, DetailMeta,
  FormDispatchProperties, FormMeta,
  TabDispatchProperties,
  TableDispatchProperties, TableMeta,
} from "./component/component-meta-map";
import {ConditionalExpression} from "./expressions/operators";
import {EventBindings} from "./expressions/action";
import {ButtonMeta, IconMeta, InputMeta} from "./component";
import {StyleMeta} from "./expressions/style";
import {SvgMeta} from "./component/svg-meta-map";



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

export type UIComponentDetail = {
  component: string;
  path: string;
  expositionRule?: ExpositionRule;
  layout?: string;
  roles?: string[];
  permissions?: string[];
  meta?: ComponentMeta;
};

/**
 * Interface for describing the rendering behavior of UI elements.
 * This interface is fully serializable for use in both UI and DTO contexts.
 */
export interface Renderer {

  /**
   * Detailed description of the UI component to render or the nested Renderer
   * This should include the component type
   */

  componentDetail : UIComponent;
  /**
   * The rendering mode or style to apply.
   * Examples: 'default', 'compact', 'minimal', 'detailed', 'card', 'list', 'grid'
   */
  mode?: string;

  /**
   * Layout configuration for the rendered element.
   */
  layout?: {
    /**
     * Display type: 'block', 'inline', 'flex', 'grid', etc.
     */
    display?: string;

    /**
     * Number of columns for grid layouts.
     */
    columns?: number;

    /**
     * Spacing between elements.
     */
    spacing?: string | number;

    /**
     * Alignment of content: 'left', 'center', 'right', 'justify'
     */
    alignment?: string;
  };

  /**
   * Interaction behavior configuration.
   */
  interaction?: {
    /**
     * Whether the element is clickable.
     */
    clickable?: boolean;

    /**
     * Whether the element supports hover effects.
     */
    hoverable?: boolean;

    /**
     * Whether the element supports drag and drop.
     */
    draggable?: boolean;

    /**
     * Whether the element supports keyboard navigation.
     */
    keyboardNavigable?: boolean;
  };

  /**
   * Display properties for visual customization.
   */
  display?: {
    /**
     * Whether to show borders.
     */
    showBorder?: boolean;

    /**
     * Whether to show shadows.
     */
    showShadow?: boolean;

    /**
     * Background color or theme.
     */
    backgroundColor?: string;

    /**
     * Text color or theme.
     */
    textColor?: string;

    /**
     * Border radius for rounded corners.
     */
    borderRadius?: string | number;

    /**
     * Opacity level (0-1).
     */
    opacity?: number;
  };

  /**
   * Responsive behavior configuration.
   */
  responsive?: {
    /**
     * Breakpoints for different screen sizes.
     */
    breakpoints?: {
      mobile?: Partial<Renderer>;
      tablet?: Partial<Renderer>;
      desktop?: Partial<Renderer>;
    };

    /**
     * Whether the element should be hidden on certain screen sizes.
     */
    hiddenOn?: ('mobile' | 'tablet' | 'desktop')[];
  };

  /**
   * Animation and transition settings.
   */
  animation?: {
    /**
     * Type of animation: 'fade', 'slide', 'scale', 'none'
     */
    type?: string;

    /**
     * Animation duration in milliseconds.
     */
    duration?: number;

    /**
     * Animation easing function.
     */
    easing?: string;

    /**
     * Whether to animate on initial render.
     */
    animateOnMount?: boolean;
  };

  /**
   * Custom CSS classes to apply.
   */
  cssClasses?: string[];

  /**
   * Custom inline styles.
   */
  customStyles?: Record<string, string | number>;

  /**
   * Accessibility configuration.
   */
  accessibility?: {
    /**
     * ARIA role for the element.
     */
    role?: string;

    /**
     * ARIA label for screen readers.
     */
    ariaLabel?: string;

    /**
     * ARIA description.
     */
    ariaDescription?: string;

    /**
     * Tab index for keyboard navigation.
     */
    tabIndex?: number;
  };
}

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

export type UIComponent = Renderer | UIComponentDetail ;

export interface LayoutComponentDetail {
  meta?: ComponentMeta; // For xingine component meta - more flexible typing
}

export interface Commissar extends LayoutComponentDetail {
  path: string;
  permission?: string[];
}

export interface LayoutRenderer {
  type: string;
  style?:StyleMeta;
  header?: {
    style?:StyleMeta;
    meta?: LayoutComponentDetail;
  };
  content: {
    style?:StyleMeta;
    meta: Commissar;
  };
  sider?: {
    style?:StyleMeta;
    meta?: LayoutComponentDetail;
  };
  footer?: {
    style?:StyleMeta;
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

export interface ModulePropertyOptions {
  uiComponent?: UIComponent[];
  permissions: Permission[];
  description?: string;
}

export interface ModuleProperties extends ModulePropertyOptions {
  name: string;
  isMenuItem?: boolean; // if true along with having a path will be a menu in sider
  path?:string;
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

export interface FieldValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
}
