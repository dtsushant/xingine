import { fieldGroupTypeDecoder, decodeFieldInputPropertiesByInputType } from '../../core/decoders/form.decoder';
import { FieldGroupTypeProperties } from '../../core/component/form-meta-map';

describe('FieldGroup Decoder', () => {
  describe('fieldGroupTypeDecoder', () => {
    it('should decode valid field group properties', () => {
      const validFieldGroup = {
        fields: [
          {
            name: 'email',
            label: 'Email',
            inputType: 'input',
            required: true,
            properties: {
              placeholder: 'Enter your email',
              email: true
            }
          },
          {
            name: 'password',
            label: 'Password',
            inputType: 'password',
            required: true,
            properties: {
              placeholder: 'Enter your password',
              minLength: 8
            }
          }
        ]
      };

      const result = fieldGroupTypeDecoder.verify(validFieldGroup);
      
      expect(result).toBeDefined();
      expect(result.fields).toHaveLength(2);
      expect(result.fields[0].name).toBe('email');
      expect(result.fields[0].inputType).toBe('input');
      expect(result.fields[1].name).toBe('password');
      expect(result.fields[1].inputType).toBe('password');
    });

    it('should decode empty field group', () => {
      const emptyFieldGroup = {
        fields: []
      };

      const result = fieldGroupTypeDecoder.verify(emptyFieldGroup);
      
      expect(result).toBeDefined();
      expect(result.fields).toHaveLength(0);
    });

    it('should handle nested field groups', () => {
      const nestedFieldGroup = {
        fields: [
          {
            name: 'personalInfo',
            label: 'Personal Information',
            inputType: 'fieldGroup',
            properties: {
              fields: [
                {
                  name: 'firstName',
                  label: 'First Name',
                  inputType: 'input',
                  required: true
                },
                {
                  name: 'lastName',
                  label: 'Last Name',
                  inputType: 'input',
                  required: true
                }
              ]
            }
          },
          {
            name: 'email',
            label: 'Email',
            inputType: 'input',
            required: true
          }
        ]
      };

      const result = fieldGroupTypeDecoder.verify(nestedFieldGroup);
      
      expect(result).toBeDefined();
      expect(result.fields).toHaveLength(2);
      expect(result.fields[0].inputType).toBe('fieldGroup');
      expect(result.fields[0].properties).toBeDefined();
    });

    it('should reject invalid field group structure', () => {
      const invalidFieldGroup = {
        invalidProperty: 'test'
      };

      expect(() => {
        fieldGroupTypeDecoder.verify(invalidFieldGroup);
      }).toThrow();
    });

    it('should reject field group with invalid fields array', () => {
      const invalidFieldGroup = {
        fields: 'not an array'
      };

      expect(() => {
        fieldGroupTypeDecoder.verify(invalidFieldGroup);
      }).toThrow();
    });
  });

  describe('decodeFieldInputPropertiesByInputType with fieldGroup', () => {
    it('should decode fieldGroup input type', () => {
      const fieldGroupInput = {
        fields: [
          {
            name: 'username',
            label: 'Username',
            inputType: 'input',
            required: true
          }
        ]
      };

      const result = decodeFieldInputPropertiesByInputType('fieldGroup', fieldGroupInput);
      
      expect(result).toBeDefined();
      expect((result as FieldGroupTypeProperties).fields).toHaveLength(1);
      expect((result as FieldGroupTypeProperties).fields[0].name).toBe('username');
    });

    it('should return undefined for fieldGroup with no input', () => {
      const result = decodeFieldInputPropertiesByInputType('fieldGroup', undefined);
      
      expect(result).toBeUndefined();
    });

    it('should handle fieldGroup with complex nested fields', () => {
      const complexFieldGroup = {
        fields: [
          {
            name: 'userType',
            label: 'User Type',
            inputType: 'select',
            required: true,
            properties: {
              options: [
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' }
              ]
            }
          },
          {
            name: 'preferences',
            label: 'Preferences',
            inputType: 'object',
            properties: {
              fields: [
                {
                  name: 'theme',
                  label: 'Theme',
                  inputType: 'select',
                  properties: {
                    options: [
                      { label: 'Light', value: 'light' },
                      { label: 'Dark', value: 'dark' }
                    ]
                  }
                }
              ]
            }
          }
        ]
      };

      const result = decodeFieldInputPropertiesByInputType('fieldGroup', complexFieldGroup);
      
      expect(result).toBeDefined();
      expect((result as FieldGroupTypeProperties).fields).toHaveLength(2);
      expect((result as FieldGroupTypeProperties).fields[0].inputType).toBe('select');
      expect((result as FieldGroupTypeProperties).fields[1].inputType).toBe('object');
    });
  });

  describe('FieldGroup with WrapInMeta', () => {
    it('should support wrapIn configuration for styling', () => {
      const fieldGroupWithWrapIn = {
        fields: [
          {
            name: 'field1',
            label: 'Field 1',
            inputType: 'input',
            wrapIn: {
              wrapWith: 'div',
              style: {
                className: 'custom-wrapper',
                style: {
                  padding: '10px',
                  border: '1px solid #ccc'
                }
              }
            }
          }
        ]
      };

      const result = fieldGroupTypeDecoder.verify(fieldGroupWithWrapIn);
      
      expect(result).toBeDefined();
      expect(result.fields[0].wrapIn).toBeDefined();
      expect(result.fields[0].wrapIn?.wrapWith).toBe('div');
      expect(result.fields[0].wrapIn?.style?.className).toBe('custom-wrapper');
    });
  });
});
