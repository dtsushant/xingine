import 'reflect-metadata';
import { FormGroup, FormWrapper, FormField } from '../../core/decorators/property-decorators';
import { FormClass } from '../../core/decorators/class-decorators';
import { FORM_GROUP_METADATA, FORM_WRAPPER_METADATA } from '../../core/decorators/metadata-constants';
import { extractFormMetaFromClass } from '../../core/utils/class-to-component.util';
import { WrapperMap } from '../../core/decorators/decorator-types';

describe('@FormGroup and @FormWrapper Decorators', () => {
  beforeEach(() => {
    // Clear any existing metadata between tests
    jest.clearAllMocks();
  });

  describe('Basic @FormGroup Functionality', () => {
    it('should store form group metadata on fields', () => {
      @FormClass({ title: 'Test Form' })
      class TestForm {
        @FormField({ label: 'First Name' })
        @FormGroup({ grouperId: 'personal' })
        firstName: string = '';

        @FormField({ label: 'Last Name' })
        @FormGroup({ grouperId: 'personal' })
        lastName: string = '';

        @FormField({ label: 'Email' })
        email: string = '';
      }

      const metadata = Reflect.getMetadata(FORM_GROUP_METADATA, TestForm);
      
      expect(metadata).toBeDefined();
      expect(metadata).toHaveLength(2);
      expect(metadata[0].fieldName).toBe('firstName');
      expect(metadata[0].grouperId).toBe('personal');
      expect(metadata[1].fieldName).toBe('lastName');
      expect(metadata[1].grouperId).toBe('personal');
    });

    it('should handle multiple different groups', () => {
      @FormClass({ title: 'User Registration' })
      class UserRegistrationForm {
        @FormField({ label: 'First Name' })
        @FormGroup({ grouperId: 'personal' })
        firstName: string = '';

        @FormField({ label: 'Last Name' })
        @FormGroup({ grouperId: 'personal' })
        lastName: string = '';

        @FormField({ label: 'Email' })
        @FormGroup({ grouperId: 'contact' })
        email: string = '';

        @FormField({ label: 'Phone' })
        @FormGroup({ grouperId: 'contact' })
        phone: string = '';
      }

      const metadata = Reflect.getMetadata(FORM_GROUP_METADATA, UserRegistrationForm);
      
      expect(metadata).toHaveLength(4);
      expect(metadata.filter((m: any) => m.grouperId === 'personal')).toHaveLength(2);
      expect(metadata.filter((m: any) => m.grouperId === 'contact')).toHaveLength(2);
    });
  });

  describe('@FormWrapper Functionality', () => {
    it('should store wrapper method metadata', () => {
      @FormClass({ title: 'Styled Form' })
      class StyledForm {
        @FormField({ label: 'Name' })
        @FormGroup({ grouperId: 'info' })
        name: string = '';

        @FormWrapper()
        getWrappers(): WrapperMap {
          return {
            info: {
              wrapWith: 'div',
              style: { className: 'info-section bg-blue-100 p-4' }
            }
          };
        }
      }

      const wrapperMethodName = Reflect.getMetadata(FORM_WRAPPER_METADATA, StyledForm);
      expect(wrapperMethodName).toBe('getWrappers');
    });
  });

  describe('Integration with extractFormMetaFromClass', () => {
    it('should generate grouper fields from @FormGroup decorators', () => {
      @FormClass({ title: 'Test Form' })
      class TestForm {
        @FormField({ label: 'Field 1' })
        @FormGroup({ grouperId: 'group1' })
        field1: string = '';

        @FormField({ label: 'Field 2' })
        @FormGroup({ grouperId: 'group1' })
        field2: string = '';

        @FormField({ label: 'Field 3' })
        field3: string = '';
      }

      const formMeta = extractFormMetaFromClass(TestForm);
      
      // Should have 2 fields: 1 grouper + 1 ungrouped field
      expect(formMeta.fields).toHaveLength(2);
      
      // Find the grouper field
      const grouperField = formMeta.fields.find(f => f.inputType === 'grouper');
      expect(grouperField).toBeDefined();
      expect(grouperField?.name).toBe('group1');
      
      // Check that the grouper contains the grouped fields
      const groupedFields = (grouperField?.properties as any)?.fields || [];
      expect(groupedFields).toHaveLength(2);
      expect(groupedFields.find((f: any) => f.name === 'field1')).toBeDefined();
      expect(groupedFields.find((f: any) => f.name === 'field2')).toBeDefined();
      
      // Check that ungrouped field is still present
      const field3 = formMeta.fields.find(f => f.name === 'field3');
      expect(field3).toBeDefined();
    });

    it('should apply wrapper configurations from @FormWrapper method', () => {
      @FormClass({ title: 'Styled Form' })
      class StyledForm {
        @FormField({ label: 'Name' })
        @FormGroup({ grouperId: 'personal' })
        name: string = '';

        @FormField({ label: 'Age' })
        @FormGroup({ grouperId: 'personal' })
        age: number = 0;

        @FormWrapper()
        getWrappers(): WrapperMap {
          return {
            personal: {
              wrapWith: 'section',
              style: { 
                className: 'personal-info bg-gray-100 p-6 rounded-lg',
                style: { border: '1px solid #ccc' }
              }
            }
          };
        }
      }

      const formMeta = extractFormMetaFromClass(StyledForm);
      
      const grouperField = formMeta.fields.find(f => f.name === 'personal' && f.inputType === 'grouper');
      expect(grouperField).toBeDefined();
      
      // Check wrapper configuration
      expect(grouperField?.wrapIn?.wrapWith).toBe('section');
      expect(grouperField?.wrapIn?.style?.className).toBe('personal-info bg-gray-100 p-6 rounded-lg');
      expect(grouperField?.wrapIn?.style?.style?.border).toBe('1px solid #ccc');
    });

    it('should use default div wrapper when grouperId not found in wrapper map', () => {
      @FormClass({ title: 'Mixed Form' })
      class MixedForm {
        @FormField({ label: 'Name' })
        @FormGroup({ grouperId: 'personal' })
        name: string = '';

        @FormField({ label: 'Email' })
        @FormGroup({ grouperId: 'contact' })
        email: string = '';

        @FormWrapper()
        getWrappers(): WrapperMap {
          return {
            personal: {
              wrapWith: 'div',
              style: { className: 'personal-section' }
            }
            // Note: 'contact' group not defined in wrapper map
          };
        }
      }

      const formMeta = extractFormMetaFromClass(MixedForm);
      
      const personalGrouper = formMeta.fields.find(f => f.name === 'personal');
      const contactGrouper = formMeta.fields.find(f => f.name === 'contact');
      
      // Personal group should use configured wrapper
      expect(personalGrouper?.wrapIn?.style?.className).toBe('personal-section');
      
      // Contact group should use default wrapper
      expect(contactGrouper?.wrapIn?.wrapWith).toBe('div');
      expect(contactGrouper?.wrapIn?.style?.className).toBe('form-group-contact');
    });

    it('should handle multiple groups with different wrapper configurations', () => {
      @FormClass({ title: 'Complex Form' })
      class ComplexForm {
        @FormField({ label: 'First Name' })
        @FormGroup({ grouperId: 'name' })
        firstName: string = '';

        @FormField({ label: 'Last Name' })
        @FormGroup({ grouperId: 'name' })
        lastName: string = '';

        @FormField({ label: 'Street' })
        @FormGroup({ grouperId: 'address' })
        street: string = '';

        @FormField({ label: 'City' })
        @FormGroup({ grouperId: 'address' })
        city: string = '';

        @FormWrapper()
        getWrappers(): WrapperMap {
          return {
            name: {
              wrapWith: 'div',
              style: { className: 'name-section border-t pt-4' }
            },
            address: {
              wrapWith: 'div',
              style: { className: 'address-section border-t pt-4 mt-4' }
            }
          };
        }
      }

      const formMeta = extractFormMetaFromClass(ComplexForm);
      
      // Should have 2 grouper fields
      const nameGrouper = formMeta.fields.find(f => f.name === 'name');
      const addressGrouper = formMeta.fields.find(f => f.name === 'address');
      
      expect(nameGrouper).toBeDefined();
      expect(addressGrouper).toBeDefined();
      
      expect(nameGrouper?.wrapIn?.style?.className).toBe('name-section border-t pt-4');
      expect(addressGrouper?.wrapIn?.style?.className).toBe('address-section border-t pt-4 mt-4');
      
      // Each grouper should contain 2 fields
      expect((nameGrouper?.properties as any)?.fields).toHaveLength(2);
      expect((addressGrouper?.properties as any)?.fields).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle form with no groups', () => {
      @FormClass({ title: 'Simple Form' })
      class SimpleForm {
        @FormField({ label: 'Field 1' })
        field1: string = '';

        @FormField({ label: 'Field 2' })
        field2: string = '';
      }

      const formMeta = extractFormMetaFromClass(SimpleForm);
      
      // Should have just the regular fields, no groupers
      expect(formMeta.fields).toHaveLength(2);
      expect(formMeta.fields.every(f => f.inputType !== 'grouper')).toBe(true);
    });

    it('should handle form with @FormWrapper but no @FormGroup', () => {
      @FormClass({ title: 'Wrapper Only Form' })
      class WrapperOnlyForm {
        @FormField({ label: 'Field 1' })
        field1: string = '';

        @FormWrapper()
        getWrappers(): WrapperMap {
          return {
            unused: {
              wrapWith: 'div',
              style: { className: 'unused-wrapper' }
            }
          };
        }
      }

      const formMeta = extractFormMetaFromClass(WrapperOnlyForm);
      
      // Should work normally, wrapper is just not used
      expect(formMeta.fields).toHaveLength(1);
      expect(formMeta.fields[0].name).toBe('field1');
    });

    it('should handle error in wrapper method gracefully', () => {
      @FormClass({ title: 'Error Form' })
      class ErrorForm {
        @FormField({ label: 'Name' })
        @FormGroup({ grouperId: 'info' })
        name: string = '';

        @FormWrapper()
        getWrappers(): WrapperMap {
          throw new Error('Wrapper method error');
        }
      }

      // Should not throw and use default wrapper
      const formMeta = extractFormMetaFromClass(ErrorForm);
      
      const grouperField = formMeta.fields.find(f => f.name === 'info');
      expect(grouperField).toBeDefined();
      expect(grouperField?.wrapIn?.wrapWith).toBe('div');
      expect(grouperField?.wrapIn?.style?.className).toBe('form-group-info');
    });
  });
});
