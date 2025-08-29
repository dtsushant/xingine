import { FieldMetaBuilder } from '../../core/builder/meta-builders';

describe('Minimal Conditional Test', () => {
  it('should create a field with condition', () => {
    const field = FieldMetaBuilder.create()
      .name('testField')
      .label('Test Field')
      .inputType('input')
      .required()
      .showWhenEquals('userType', 'admin')
      .build();
    
    expect(field.name).toBe('testField');
    expect(field.conditionalRender?.condition).toEqual({
      field: 'userType',
      operator: 'eq',
      value: 'admin'
    });
    expect(field.conditionalRender?.provider).toBeUndefined();
  });
});
