import {
  FieldInputTypeProperties,
  FieldMeta,
} from "../component/form-meta-map";
import { DetailFieldMeta } from "../component/detail-meta-map";
import { Operator } from "../expressions/operators";

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

export interface TabMeta {
  tabs: {
    label: string;
    component: keyof ComponentMetaMap;
    meta: ComponentMetaMap[keyof ComponentMetaMap];
  }[];
  dispatch?: TabDispatchProperties;
}

export type ComponentMetaMap = {
  FormRenderer: FormMeta;
  TableRenderer: TableMeta;
  TabRenderer: TabMeta;
  DetailRenderer: DetailMeta;
  ChartRenderer: ChartMeta;
};

export type ChartType = "bar" | "line" | "pie" | "scatter";

/**
 * Interface for describing the rendering behavior of UI elements.
 * This interface is fully serializable for use in both UI and DTO contexts.
 */
export interface Renderer {
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

export interface ComponentMeta<
  T extends keyof ComponentMetaMap = keyof ComponentMetaMap,
> {
  component: T;
  properties: ComponentMetaMap[T];
}

export * from "./form-meta-map";
