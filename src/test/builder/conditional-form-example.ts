import { FieldMetaBuilder, FormMetaBuilder } from '../../core/builder/meta-builders';
import { DefaultFormDataProvider } from '../../core/expressions/providers';
import { ConditionalExpression } from '../../core/expressions/operators';

/**
 * Example demonstrating the enhanced FormBuilder with conditional rendering
 * and JSON editor support
 */

export const CONDITIONAL_USER_REGISTRATION_FORM = FormMetaBuilder.create()
  .action('registerUser')
  .showJsonEditor(true) // Enable JSON editor for this form
  .addField(
    FieldMetaBuilder.create()
      .name('userType')
      .label('User Type')
      .inputType('select')
      .properties({
        options: [
          { label: 'Select User Type', value: '' },
          { label: 'Individual', value: 'individual' },
          { label: 'Business', value: 'business' },
          { label: 'Organization', value: 'organization' }
        ]
      })
      .required(true)
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('firstName')
      .label('First Name')
      .inputType('input')
      .properties({ placeholder: 'Enter your first name' })
      .required(true)
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('lastName')
      .label('Last Name')
      .inputType('input')
      .properties({ placeholder: 'Enter your last name' })
      .required(true)
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('email')
      .label('Email Address')
      .inputType('input')
      .properties({ 
        placeholder: 'Enter your email',
        email: true
      })
      .required(true)
      .build()
  )
  // Business-specific fields (only show when userType is 'business')
  .addField(
    FieldMetaBuilder.create()
      .name('companyName')
      .label('Company Name')
      .inputType('input')
      .properties({ placeholder: 'Enter your company name' })
      .showWhenEquals('userType', 'business')
      .required(true)
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('taxId')
      .label('Tax ID / EIN')
      .inputType('input')
      .properties({ placeholder: 'Enter your tax identification number' })
      .showWhenEquals('userType', 'business')
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('businessType')
      .label('Business Type')
      .inputType('select')
      .properties({
        options: [
          { label: 'Select Business Type', value: '' },
          { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
          { label: 'Partnership', value: 'partnership' },
          { label: 'Corporation', value: 'corporation' },
          { label: 'LLC', value: 'llc' }
        ]
      })
      .showWhenEquals('userType', 'business')
      .build()
  )
  // Organization-specific fields (only show when userType is 'organization')
  .addField(
    FieldMetaBuilder.create()
      .name('organizationName')
      .label('Organization Name')
      .inputType('input')
      .properties({ placeholder: 'Enter organization name' })
      .showWhenEquals('userType', 'organization')
      .required(true)
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('organizationType')
      .label('Organization Type')
      .inputType('select')
      .properties({
        options: [
          { label: 'Select Organization Type', value: '' },
          { label: 'Non-Profit', value: 'nonprofit' },
          { label: 'Educational', value: 'educational' },
          { label: 'Government', value: 'government' },
          { label: 'Religious', value: 'religious' }
        ]
      })
      .showWhenEquals('userType', 'organization')
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('taxExemptId')
      .label('Tax Exempt ID (if applicable)')
      .inputType('input')
      .properties({ placeholder: 'Enter tax exempt ID' })
      .showWhenEquals('userType', 'organization')
      .build()
  )
  // Optional contact fields that appear for business and organization
  .addField(
    FieldMetaBuilder.create()
      .name('phoneNumber')
      .label('Phone Number')
      .inputType('input')
      .properties({ placeholder: 'Enter phone number' })
      .showWhenNotEquals('userType', 'individual') // Show for business or organization
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('website')
      .label('Website')
      .inputType('input')
      .properties({ placeholder: 'https://www.example.com' })
      .showWhenNotEquals('userType', 'individual') // Show for business or organization
      .build()
  )
  // Address fields that show when phone number is provided
  .addField(
    FieldMetaBuilder.create()
      .name('showAddress')
      .label('Provide Business Address')
      .inputType('checkbox')
      .showWhenNotEmpty('phoneNumber') // Show checkbox when phone is provided
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('address')
      .label('Street Address')
      .inputType('input')
      .properties({ placeholder: 'Enter street address' })
      .withCondition({
        and: [
          { field: 'showAddress', operator: 'eq', value: true },
          { field: 'phoneNumber', operator: 'ne', value: null }
        ]
      }) // Show when both conditions are met
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('city')
      .label('City')
      .inputType('input')
      .properties({ placeholder: 'Enter city' })
      .withCondition({
        and: [
          { field: 'showAddress', operator: 'eq', value: true },
          { field: 'phoneNumber', operator: 'ne', value: null }
        ]
      })
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('state')
      .label('State/Province')
      .inputType('input')
      .properties({ placeholder: 'Enter state or province' })
      .withCondition({
        and: [
          { field: 'showAddress', operator: 'eq', value: true },
          { field: 'phoneNumber', operator: 'ne', value: null }
        ]
      })
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('zipCode')
      .label('ZIP/Postal Code')
      .inputType('input')
      .properties({ placeholder: 'Enter ZIP or postal code' })
      .withCondition({
        and: [
          { field: 'showAddress', operator: 'eq', value: true },
          { field: 'phoneNumber', operator: 'ne', value: null }
        ]
      })
      .build()
  )
  // Terms and conditions (always visible)
  .addField(
    FieldMetaBuilder.create()
      .name('acceptTerms')
      .label('I accept the Terms and Conditions')
      .inputType('checkbox')
      .required(true)
      .build()
  )
  .addField(
    FieldMetaBuilder.create()
      .name('newsletter')
      .label('Subscribe to newsletter')
      .inputType('checkbox')
      .build()
  )
  .build();

// Helper function to demonstrate how to use the form data provider
export function createFormDataProvider(initialData: Record<string, unknown> = {}) {
  return new DefaultFormDataProvider(initialData);
}

// Example of evaluating field conditions
export function shouldShowField(fieldName: string, formData: Record<string, unknown>) {
  const field = CONDITIONAL_USER_REGISTRATION_FORM.fields.find(f => f.name === fieldName);
  if (!field || !field.conditionalRender) {
    return true; // Show by default if no condition
  }

  // For a real implementation, you would evaluate the condition here
  // This is just an example of how it could work
  const condition = field.conditionalRender.condition;
  
  if ('field' in condition && 'operator' in condition) {
    const fieldValue = formData[condition.field];
    
    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value;
      case 'ne':
        return fieldValue !== condition.value;
      default:
        return true;
    }
  }
  
  return true;
}

// Example usage:
// const formData = { userType: 'business', phoneNumber: '123-456-7890' };
// const showCompanyName = shouldShowField('companyName', formData); // true
// const showOrganizationName = shouldShowField('organizationName', formData); // false
