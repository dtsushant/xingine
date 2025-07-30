// src/types/component-meta-map.ts

import {EventBindings} from "../expressions/action";

export interface InputTypeProperties {
  /**
   * Placeholder text for the input field.
   */
  placeholder?: string;
  /**
   * Maximum number of characters allowed in the input.
   */
  maxLength?: number;
  /**
   * Minimum number of characters required in the input.
   */
  minLength?: number;
  /**
   * Whether the input field is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the input should validate as an email address.
   */
  email?: boolean;
  /**
   * Regular expression pattern for custom validation.
   */
  validationRegex?: string;
  /**
   * Function to handle changes in the input value.
   */
  regexValidationMessage?:string;

}

export interface PasswordTypeProperties {
  placeholder?: string;
  minLength?: number;
  hasStrengthMeter?: boolean;
  disabled?: boolean;
}

export interface NumberTypeProperties {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
}

export interface SelectTypeProperties {
  options: { label: string; value: string }[];
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
}
export interface LookupTypeProperties {
  /**
   * API action or endpoint name that will return lookup options.
   * The response should be an array of `{ label: string, value: string }`.
   */
  fetchAction: string;

  /**
   * Whether multiple selections are allowed (like a multi-select).
   */
  multiple?: boolean;

  /**
   * Placeholder text for the input/select box.
   */
  placeholder?: string;

  /**
   * Whether the lookup is disabled.
   */
  disabled?: boolean;

  /**
   * Enables autocomplete or free-text input for searching.
   */
  allowSearch?: boolean;

  /**
   * If true, allows the user to create a new entry if not found.
   */
  allowAddNew?: boolean;

  /**
   * Optional field to specify what property the search query should match.
   * e.g., 'label' or 'code'
   */
  searchField?: string;

  /**
   * Optional debounce interval for search requests (in milliseconds).
   */
  debounce?: number;

  /**
   * If new option is added inline, this action will be triggered to persist it.
   */
  createAction?: string;

  /**
   * Optionally map the backend response to expected label/value structure.
   */
  resultMap?: {
    label: string;
    value: string;
  }[];
}

export interface TreeSelectTypeProperties {
  treeData: {
    title: string;
    value: string;
    children?: TreeSelectTypeProperties["treeData"];
  }[];
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface SwitchTypeProperties {
  checkedChildren?: string;
  unCheckedChildren?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}

export interface CheckboxOption {
  label: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface CheckboxTypeProperties {
  options?: CheckboxOption[];
  fetchAction?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface NestedCheckboxOption extends CheckboxOption {
  children?: NestedCheckboxOption[];
}

export interface NestedCheckboxTypeProperties {
  options?: NestedCheckboxOption[];
  fetchAction?: string;
}

export interface DateTypeProperties {
  format?: string;
  showTime?: boolean;
  disabledDate?: (currentDate: string) => boolean;
  disabled?: boolean;
}

export interface TextareaTypeProperties {
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

export type ButtonView = "primary" | "default" | "dashed" | "link" | "text";
export interface ButtonTypeProperties {
  text: string;
  type?: ButtonView;
  disabled?: boolean;
  onClickAction?: string; // ID or name of action handler to be resolved at runtime
}
export type ObjectFieldProperties = {
  fields: FieldMeta[];
};

export type ObjectListFieldProperties = {
  itemFields: FieldMeta[];
};

/**
 * Properties for file input fields supporting file upload functionality.
 * This interface is fully serializable for use in both UI and DTO contexts.
 */
export interface FileInputProperties {
  /**
   * Array of allowed file extensions (e.g., ['.jpg', '.png', '.pdf'])
   * or MIME types (e.g., ['image/jpeg', 'image/png', 'application/pdf']).
   */
  allowedFileTypes?: string[];
  
  /**
   * Maximum file size allowed in bytes.
   * Example: 5242880 for 5MB limit.
   */
  maxFileSize?: number;
  
  /**
   * Maximum file size allowed in megabytes (alternative to maxFileSize in bytes).
   * This will be converted to bytes internally if provided.
   */
  maxFileSizeMB?: number;
  
  /**
   * Minimum number of files required to be uploaded.
   * Defaults to 0 if not specified.
   */
  minFileCount?: number;
  
  /**
   * Maximum number of files that can be uploaded.
   * Defaults to 1 if not specified.
   */
  maxFileCount?: number;
  
  /**
   * Whether the field is required (at least one file must be uploaded).
   */
  required?: boolean;
  
  /**
   * Whether the input field is disabled.
   */
  disabled?: boolean;
  
  /**
   * Placeholder text to display when no files are selected.
   */
  placeholder?: string;
  
  /**
   * Whether to capture and store the original filename.
   */
  captureFilename?: boolean;
  
  /**
   * Whether to capture and store the uploaded file path/URL.
   */
  captureUploadPath?: boolean;
  
  /**
   * Whether to allow drag and drop functionality.
   */
  allowDragDrop?: boolean;
  
  /**
   * Custom validation message for file type restrictions.
   */
  fileTypeValidationMessage?: string;
  
  /**
   * Custom validation message for file size restrictions.
   */
  fileSizeValidationMessage?: string;
  
  /**
   * Custom validation message for file count restrictions.
   */
  fileCountValidationMessage?: string;
}

export type FieldInputTypeProperties = {
  input: InputTypeProperties;
  password: PasswordTypeProperties;
  number: NumberTypeProperties;
  select: SelectTypeProperties;
  lookup: LookupTypeProperties;
  treeselect: TreeSelectTypeProperties;
  switch: SwitchTypeProperties;
  checkbox: CheckboxTypeProperties;
  nestedcheckbox: NestedCheckboxTypeProperties;
  date: DateTypeProperties;
  textarea: TextareaTypeProperties;
  button: ButtonTypeProperties;
  object: ObjectFieldProperties;
  "object[]": ObjectListFieldProperties;
  file: FileInputProperties;
};

export interface FieldMeta<
  T extends keyof FieldInputTypeProperties = keyof FieldInputTypeProperties,
> {
  name?: string;
  label?: string;
  event?:EventBindings;
  inputType?: T;
  value?: string;
  required?: boolean;
  order?:number;
  properties?: FieldInputTypeProperties[T];
}
