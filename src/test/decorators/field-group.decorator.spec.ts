import 'reflect-metadata';
import { FormGroup, FormWrapper, FormField } from '../../core/decorators/property-decorators';
import { FormClass } from '../../core/decorators/class-decorators';
import { FORM_GROUP_METADATA, FORM_WRAPPER_METADATA } from '../../core/decorators/metadata-constants';
import { extractFormMetaFromClass } from '../../core/utils/class-to-component.util';
import { WrapperMap } from '../../core/decorators/decorator-types'; 'reflect-metadata';
import { FieldGroup, FormField } from '../../core/decorators/property-decorators';
import { FormClass } from '../../core/decorators/class-decorators';
import { FIELD_GROUP_METADATA, FORM_CLASS_METADATA } from '../../core/decorators/metadata-constants';
import { extractFormMetaFromClass } from '../../core/utils/class-to-component.util';
import { FieldGroupConfig } from '../../core/decorators/decorator-types';

describe('@FieldGroup Decorator', () => {
  beforeEach(() => {
    // Clear any existing metadata between tests
    jest.clearAllMocks();
  });

  describe('Basic @FieldGroup Functionality', () => {
    it('should store field group metadata in FormClass options', () => {
      @FormClass({ 
        title: 'Test Form',
        fieldGroups: [
          {
            id: 'personal',
            fields: ['firstName', 'lastName'],
            wrapIn: {
              wrapWith: 'div',
              style: { className: 'personal-info' }
            }
          }
        ]
      })
      class TestForm {
        @FormField({ label: 'First Name' })
        firstName: string = '';

        @FormField({ label: 'Last Name' })
        lastName: string = '';

        @FormField({ label: 'Email' })
        email: string = '';
      }

      const metadata = Reflect.getMetadata(FORM_CLASS_METADATA, TestForm);
      
      expect(metadata).toBeDefined();
      expect(metadata.fieldGroups).toHaveLength(1);
      expect(metadata.fieldGroups[0].id).toBe('personal');
      expect(metadata.fieldGroups[0].fields).toEqual(['firstName', 'lastName']);
      expect(metadata.fieldGroups[0].wrapIn?.style?.className).toBe('personal-info');
    });

    it('should handle multiple field groups', () => {
      @FormClass({ 
        title: 'User Registration',
        fieldGroups: [
          {
            id: 'personal',
            fields: ['firstName', 'lastName']
          },
          {
            id: 'contact',
            fields: ['email', 'phone']
          }
        ]
      })
      class UserRegistrationForm {
        @FormField({ label: 'First Name' })
        firstName: string = '';

        @FormField({ label: 'Last Name' })
        lastName: string = '';

        @FormField({ label: 'Email' })
        email: string = '';

        @FormField({ label: 'Phone' })
        phone: string = '';
      }

      const metadata = Reflect.getMetadata(FORM_CLASS_METADATA, UserRegistrationForm);
      
      expect(metadata.fieldGroups).toHaveLength(2);
      expect(metadata.fieldGroups[0].id).toBe('personal');
      expect(metadata.fieldGroups[0].fields).toEqual(['firstName', 'lastName']);
      expect(metadata.fieldGroups[1].id).toBe('contact');
      expect(metadata.fieldGroups[1].fields).toEqual(['email', 'phone']);
    });
  });

  describe('@FieldGroup with WrapperMap', () => {
    it('should support wrapper map references', () => {
      @FormClass({ 
        title: 'Company Profile',
        wrapperMap: {
          'card-style': {
            wrapWith: 'div',
            style: { 
              className: 'bg-white p-6 rounded-lg shadow-md border',
              style: { marginBottom: '20px' }
            }
          }
        },
        fieldGroups: [
          {
            id: 'company-details',
            fields: ['companyName', 'industry'],
            wrapIn: {
              wrapWith: 'div',
              wrapperRef: 'card-style'
            }
          }
        ]
      })
      class CompanyProfileForm {
        @FormField({ label: 'Company Name' })
        companyName: string = '';

        @FormField({ label: 'Industry' })
        industry: string = '';
      }

      const metadata = Reflect.getMetadata(FORM_CLASS_METADATA, CompanyProfileForm);
      
      expect(metadata).toBeDefined();
      expect(metadata.fieldGroups[0].wrapIn?.wrapperRef).toBe('card-style');
      expect(metadata.wrapperMap).toBeDefined();
      expect(metadata.wrapperMap['card-style']).toBeDefined();
    });
  });

  describe('Integration with extractFormMetaFromClass', () => {
    it('should generate grouper fields from field group metadata', () => {
      @FormClass({ 
        title: 'Test Form',
        fieldGroups: [
          {
            id: 'group1',
            fields: ['field1', 'field2'],
            wrapIn: {
              wrapWith: 'div',
              style: { className: 'group-wrapper' }
            }
          }
        ]
      })
      class TestForm {
        @FormField({ label: 'Field 1' })
        field1: string = '';

        @FormField({ label: 'Field 2' })
        field2: string = '';

        @FormField({ label: 'Field 3' })
        field3: string = '';
      }

      const formMeta = extractFormMetaFromClass(TestForm);
      
      // Should have 4 fields: 3 original + 1 grouper
      expect(formMeta.fields).toHaveLength(4);
      
      // Find the grouper field
      const grouperField = formMeta.fields.find(f => f.inputType === 'grouper');
      expect(grouperField).toBeDefined();
      expect(grouperField?.name).toBe('group1');
      
      // Check that grouped fields have the group property set
      const field1 = formMeta.fields.find(f => f.name === 'field1');
      const field2 = formMeta.fields.find(f => f.name === 'field2');
      const field3 = formMeta.fields.find(f => f.name === 'field3');
      
      expect(field1?.group).toBe('group1');
      expect(field2?.group).toBe('group1');
      expect(field3?.group).toBeUndefined(); // Not in any group
    });

    it('should handle field-level group assignment', () => {
      @FormClass({ title: 'Mixed Grouping Form' })
      class MixedForm {
        @FormField({ label: 'Name', group: 'personal' })
        name: string = '';

        @FormField({ label: 'Age', group: 'personal' })
        age: number = 0;

        @FormField({ label: 'Email' })
        email: string = '';
      }

      const formMeta = extractFormMetaFromClass(MixedForm);
      
      // Should automatically create grouper for 'personal' group
      const grouperField = formMeta.fields.find(f => f.inputType === 'grouper' && f.name === 'personal');
      expect(grouperField).toBeDefined();
      
      // Check group assignments
      const nameField = formMeta.fields.find(f => f.name === 'name');
      const ageField = formMeta.fields.find(f => f.name === 'age');
      const emailField = formMeta.fields.find(f => f.name === 'email');
      
      expect(nameField?.group).toBe('personal');
      expect(ageField?.group).toBe('personal');
      expect(emailField?.group).toBeUndefined();
    });

    it('should merge class-level and field-level group configurations', () => {
      @FormClass({ 
        title: 'Complex Form',
        fieldGroups: [
          {
            id: 'address',
            fields: ['street', 'city'],
            wrapIn: {
              wrapWith: 'div',
              style: { className: 'address-group' }
            }
          }
        ]
      })
      class ComplexForm {
        @FormField({ label: 'Street' })
        street: string = '';

        @FormField({ label: 'City' })
        city: string = '';

        @FormField({ label: 'Name', group: 'personal' })
        name: string = '';

        @FormField({ label: 'Age', group: 'personal' })
        age: number = 0;
      }

      const formMeta = extractFormMetaFromClass(ComplexForm);
      
      // Should have both 'address' and 'personal' groupers
      const addressGrouper = formMeta.fields.find(f => f.name === 'address' && f.inputType === 'grouper');
      const personalGrouper = formMeta.fields.find(f => f.name === 'personal' && f.inputType === 'grouper');
      
      expect(addressGrouper).toBeDefined();
      expect(personalGrouper).toBeDefined();
      
      // Check wrapper configuration for address group
      expect(addressGrouper?.wrapIn?.wrapWith).toBe('div');
      expect(addressGrouper?.wrapIn?.style?.className).toBe('address-group');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty field groups gracefully', () => {
      @FormClass({ 
        title: 'Empty Groups Form',
        fieldGroups: [
          {
            id: 'empty-group',
            fields: []
          }
        ]
      })
      class EmptyGroupsForm {
        @FormField({ label: 'Field 1' })
        field1: string = '';
      }

      const formMeta = extractFormMetaFromClass(EmptyGroupsForm);
      
      // Empty groups should still create grouper fields
      const emptyGrouper = formMeta.fields.find(f => f.name === 'empty-group');
      expect(emptyGrouper).toBeDefined();
      expect(emptyGrouper?.inputType).toBe('grouper');
    });

    it('should handle field groups with non-existent fields', () => {
      @FormClass({ 
        title: 'Non-existent Fields Form',
        fieldGroups: [
          {
            id: 'mixed-group',
            fields: ['existingField', 'nonExistentField']
          }
        ]
      })
      class NonExistentFieldsForm {
        @FormField({ label: 'Existing Field' })
        existingField: string = '';
      }

      const formMeta = extractFormMetaFromClass(NonExistentFieldsForm);
      
      // Should still create the grouper and assign existing fields
      const mixedGrouper = formMeta.fields.find(f => f.name === 'mixed-group');
      expect(mixedGrouper).toBeDefined();
      
      const existingField = formMeta.fields.find(f => f.name === 'existingField');
      expect(existingField?.group).toBe('mixed-group');
    });

    it('should handle no field groups configuration', () => {
      @FormClass({ title: 'Simple Form' })
      class SimpleForm {
        @FormField({ label: 'Field 1' })
        field1: string = '';
      }

      const formMeta = extractFormMetaFromClass(SimpleForm);
      
      // Should work normally without any groupers
      expect(formMeta.fields).toHaveLength(1);
      expect(formMeta.fields[0].name).toBe('field1');
      expect(formMeta.fields[0].group).toBeUndefined();
    });
  });
});
