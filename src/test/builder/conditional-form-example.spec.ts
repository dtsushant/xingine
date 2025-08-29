import { CONDITIONAL_USER_REGISTRATION_FORM, shouldShowField } from './conditional-form-example';

describe('Conditional Form Example', () => {
  it('should create a form with conditional fields', () => {
    expect(CONDITIONAL_USER_REGISTRATION_FORM).toBeDefined();
    expect(CONDITIONAL_USER_REGISTRATION_FORM.showJsonEditor).toBe(true);
    expect(CONDITIONAL_USER_REGISTRATION_FORM.fields).toHaveLength(19); // All fields
  });

  it('should have conditional rendering on business fields', () => {
    const companyField = CONDITIONAL_USER_REGISTRATION_FORM.fields.find(f => f.name === 'companyName');
    expect(companyField?.conditionalRender?.condition).toEqual({
      field: 'userType',
      operator: 'eq',
      value: 'business'
    });
  });

  it('should have conditional rendering on organization fields', () => {
    const orgField = CONDITIONAL_USER_REGISTRATION_FORM.fields.find(f => f.name === 'organizationName');
    expect(orgField?.conditionalRender?.condition).toEqual({
      field: 'userType',
      operator: 'eq',
      value: 'organization'
    });
  });

  it('should evaluate field visibility correctly', () => {
    const businessData = { userType: 'business' };
    expect(shouldShowField('companyName', businessData)).toBe(true);
    expect(shouldShowField('organizationName', businessData)).toBe(false);
    
    const orgData = { userType: 'organization' };
    expect(shouldShowField('companyName', orgData)).toBe(false);
    expect(shouldShowField('organizationName', orgData)).toBe(true);
  });

  it('should show fields without conditions by default', () => {
    expect(shouldShowField('firstName', {})).toBe(true);
    expect(shouldShowField('email', {})).toBe(true);
  });
});
