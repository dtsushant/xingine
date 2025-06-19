import {FieldValidationError, FormValidationResult} from "../xingine.type";
import {
    DateTypeProperties,
    FieldMeta,
    InputTypeProperties,
    NumberTypeProperties,
    PasswordTypeProperties, SelectTypeProperties,
    TextareaTypeProperties
} from "../component/form-meta-map";
import {FORM_FIELD_METADATA} from "../xingine.decorator";


/**
 * Validates a form object against its FormField decorators
 * @param formField - The form object instance to validate
 * @returns FormValidationResult with isValid flag and list of errors
 */
export function validateFormField<T extends object>(formField: T): FormValidationResult {
    const constructor = formField.constructor as new () => T;
    const fields: FieldMeta[] = Reflect.getMetadata(FORM_FIELD_METADATA, constructor) || [];

    const errors: FieldValidationError[] = [];

    for (const fieldMeta of fields) {
        if (!fieldMeta.name) continue;

        const fieldValue = (formField as any)[fieldMeta.name];
        const fieldErrors = validateFieldValue(fieldMeta, fieldValue);
        errors.push(...fieldErrors);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates a single field value against its FieldMeta constraints
 */
function validateFieldValue(fieldMeta: FieldMeta, value: any): FieldValidationError[] {
    const errors: FieldValidationError[] = [];
    const fieldName = fieldMeta.name!;

    // Check required validation
    if (fieldMeta.required && (value === undefined || value === null || value === '')) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} is required`
        });
        return errors; // If required field is empty, skip other validations
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
        return errors;
    }

    // Type-specific validations
    switch (fieldMeta.inputType) {
        case 'input':
            validateInputField(fieldMeta as FieldMeta<'input'>, value, errors);
            break;
        case 'password':
            validatePasswordField(fieldMeta as FieldMeta<'password'>, value, errors);
            break;
        case 'number':
            validateNumberField(fieldMeta as FieldMeta<'number'>, value, errors);
            break;
        case 'textarea':
            validateTextareaField(fieldMeta as FieldMeta<'textarea'>, value, errors);
            break;
        case 'select':
            validateSelectField(fieldMeta as FieldMeta<'select'>, value, errors);
            break;
        case 'date':
            validateDateField(fieldMeta as FieldMeta<'date'>, value, errors);
            break;
        // Add other field types as needed
    }

    return errors;
}

/**
 * Validates input field constraints
 */
function validateInputField(fieldMeta: FieldMeta<'input'>, value: any, errors: FieldValidationError[]): void {
    const fieldName = fieldMeta.name!;
    const properties = fieldMeta.properties as InputTypeProperties;

    if (!properties) return;

    const stringValue = String(value);

    if (properties.maxLength && stringValue.length > properties.maxLength) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must not exceed ${properties.maxLength} characters`
        });
    }

    if (properties.minLength && stringValue.length < properties.minLength) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must be at least ${properties.minLength} characters`
        });
    }

    if (properties.email && !isValidEmail(stringValue)) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must be a valid email address`
        });
    }

    if (properties.validationRegex && !isValidRegex(stringValue, properties.validationRegex)) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must match the required format`
        });
    }
}

/**
 * Validates password field constraints
 */
function validatePasswordField(fieldMeta: FieldMeta<'password'>, value: any, errors: FieldValidationError[]): void {
    const fieldName = fieldMeta.name!;
    const properties = fieldMeta.properties as PasswordTypeProperties;

    if (!properties) return;

    const stringValue = String(value);

    if (properties.minLength && stringValue.length < properties.minLength) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must be at least ${properties.minLength} characters`
        });
    }
}

/**
 * Validates number field constraints
 */
function validateNumberField(fieldMeta: FieldMeta<'number'>, value: any, errors: FieldValidationError[]): void {
    const fieldName = fieldMeta.name!;
    const properties = fieldMeta.properties as NumberTypeProperties;

    if (!properties) return;

    const numValue = Number(value);

    if (isNaN(numValue)) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must be a valid number`
        });
        return;
    }

    if (properties.min !== undefined && numValue < properties.min) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must be at least ${properties.min}`
        });
    }

    if (properties.max !== undefined && numValue > properties.max) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must not exceed ${properties.max}`
        });
    }
}

/**
 * Validates textarea field constraints
 */
function validateTextareaField(fieldMeta: FieldMeta<'textarea'>, value: any, errors: FieldValidationError[]): void {
    const fieldName = fieldMeta.name!;
    const properties = fieldMeta.properties as TextareaTypeProperties;

    if (!properties) return;

    const stringValue = String(value);

    if (properties.maxLength && stringValue.length > properties.maxLength) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must not exceed ${properties.maxLength} characters`
        });
    }
}

/**
 * Validates select field constraints
 */
function validateSelectField(fieldMeta: FieldMeta<'select'>, value: any, errors: FieldValidationError[]): void {
    const fieldName = fieldMeta.name!;
    const properties = fieldMeta.properties as SelectTypeProperties;

    if (!properties) return;

    // Check if value is one of the allowed options
    if (properties.options && properties.options.length > 0) {
        const validValues = properties.options.map(opt => opt.value);

        if (properties.multiple) {
            // For multiple select, value should be an array
            if (!Array.isArray(value)) {
                errors.push({
                    field: fieldName,
                    message: `${fieldMeta.label || fieldName} must be an array of values`
                });
                return;
            }

            for (const item of value) {
                if (validValues.indexOf(item) === -1) {
                    errors.push({
                        field: fieldName,
                        message: `${fieldMeta.label || fieldName} contains invalid option: ${item}`
                    });
                }
            }
        } else {
            // For single select, value should be one of the options
            if (validValues.indexOf(value) === -1) {
                errors.push({
                    field: fieldName,
                    message: `${fieldMeta.label || fieldName} must be one of the allowed options`
                });
            }
        }
    }
}

/**
 * Validates date field constraints
 */
function validateDateField(fieldMeta: FieldMeta<'date'>, value: any, errors: FieldValidationError[]): void {
    const fieldName = fieldMeta.name!;
    const properties = fieldMeta.properties as DateTypeProperties;

    if (!properties) return;

    // Check if value is a valid date
    const date = new Date(value);

    if (isNaN(date.getTime())) {
        errors.push({
            field: fieldName,
            message: `${fieldMeta.label || fieldName} must be a valid date`
        });
        return;
    }

    // Additional date validations could be added here
    // For example, custom disabledDate function validation
    if (properties.disabledDate && typeof properties.disabledDate === 'function') {
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        if (properties.disabledDate(dateString)) {
            errors.push({
                field: fieldName,
                message: `${fieldMeta.label || fieldName} is not an allowed date`
            });
        }
    }
}

/**
 * Simple email validation helper
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Regex validation helper
 */
function isValidRegex(value: string, pattern: string): boolean {
    try {
        const regex = new RegExp(pattern);
        return regex.test(value);
    } catch (error) {
        return false;
    }
}