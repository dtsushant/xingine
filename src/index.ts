export * from "./core/xingine.type";
export * from "./core/xingine.decorator";
export * from "./core/xingine.decoder";
export * from "./core/utils/type";
export * from "./core/utils/extrapolate-string.util";
export * from "./core/utils/layout-exposition.util";
export * from "./core/utils/layout-renderer.util";
export * from "./core/expressions/operators";
export { validateFormField } from "./core/utils/validation.util";
export type { FieldValidationError, FormValidationResult } from "./core/xingine.type";
export * from "./core/component"
export * from "./core/decoders"
export * from "./core/expressions"
export * from "./core/builder"
export { PROVISIONEER_METADATA } from "./core/decorators/metadata-constants"
// Export WrapInMeta functionality
export * from "./core/component/wrap-in-meta"
// Export class decorators and utilities with new names to avoid conflicts
export { 
  FormClass, 
  TableClass, 
  DetailClass, 
  ChartClass,
  FormField as FormFieldDecorator,
  TableColumn,
  DetailField as DetailFieldDecorator,
  ChartSeries
} from "./core/decorators"
// Export new property-level decorators
export { 
  FormField,
  FormGroup,
  FormWrapper,
  TableColumn as TableColumnDecorator,
  DetailField,
  ChartSeries as ChartSeriesDecorator
} from "./core/decorators/property-decorators"
export * from "./core/utils/class-to-component.util"
export * from "./core/utils/type-inference.util"

