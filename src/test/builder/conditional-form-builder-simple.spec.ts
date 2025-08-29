import { 
  FieldMetaBuilder, 
  FormMetaBuilder 
} from '../../core/builder/meta-builders';
import { 
  DefaultFormDataProvider, 
  DataProviderFactory 
} from '../../core/expressions/providers';
import { ConditionalExpression } from '../../core/expressions/operators';

describe('Enhanced FormBuilder with Conditional Rendering', () => {
  
  describe('FormMetaBuilder', () => {
    it('should support showJsonEditor property', () => {
      const formMeta = FormMetaBuilder.create()
        .action('submit')
        .showJsonEditor(true)
        .build();

      expect(formMeta.showJsonEditor).toBe(true);
    });

    it('should default showJsonEditor to undefined when not set', () => {
      const formMeta = FormMetaBuilder.create()
        .action('submit')
        .build();

      expect(formMeta.showJsonEditor).toBeUndefined();
    });
  });

  describe('FieldMetaBuilder', () => {
    it('should create a basic field without conditions', () => {
      const field = FieldMetaBuilder.create()
        .name('username')
        .label('Username')
        .inputType('input')
        .required(true)
        .build();

      expect(field.name).toBe('username');
      expect(field.label).toBe('Username');
      expect(field.inputType).toBe('input');
      expect(field.required).toBe(true);
      expect(field.conditionalRender).toBeUndefined();
    });

    it('should create a field with conditional rendering', () => {
      const condition: ConditionalExpression = {
        field: 'userType',
        operator: 'eq',
        value: 'admin'
      };

      const field = FieldMetaBuilder.create()
        .name('adminPanel')
        .label('Admin Panel Access')
        .inputType('checkbox')
        .withCondition(condition)
        .build();

      expect(field.name).toBe('adminPanel');
      expect(field.conditionalRender).toBeDefined();
      expect(field.conditionalRender?.condition).toEqual(condition);
      expect(field.conditionalRender?.provider).toBeUndefined(); // Should be undefined when not specified
    });

    it('should create a field with showWhenEquals helper', () => {
      const field = FieldMetaBuilder.create()
        .name('companyName')
        .label('Company Name')
        .inputType('input')
        .showWhenEquals('userType', 'business')
        .build();

      expect(field.conditionalRender?.condition).toEqual({
        field: 'userType',
        operator: 'eq',
        value: 'business'
      });
    });

    it('should create a field with showWhenNotEquals helper', () => {
      const field = FieldMetaBuilder.create()
        .name('studentId')
        .label('Student ID')
        .inputType('input')
        .showWhenNotEquals('userType', 'guest')
        .build();

      expect(field.conditionalRender?.condition).toEqual({
        field: 'userType',
        operator: 'ne',
        value: 'guest'
      });
    });

    it('should create a field with showWhenNotEmpty helper', () => {
      const field = FieldMetaBuilder.create()
        .name('phoneExtension')
        .label('Phone Extension')
        .inputType('input')
        .showWhenNotEmpty('phoneNumber')
        .build();

      expect(field.conditionalRender?.condition).toEqual({
        field: 'phoneNumber',
        operator: 'ne',
        value: null
      });
    });
  });

  describe('DataProviders', () => {
    it('should create and use DefaultFormDataProvider', () => {
      const provider = new DefaultFormDataProvider({ 
        userType: 'admin',
        username: 'testuser'
      });

      expect(provider.type).toBe('form');
      expect(provider.getFieldValue('userType')).toBe('admin');
      expect(provider.hasFieldValue('userType', 'admin')).toBe(true);
      expect(provider.hasFieldValue('userType', 'user')).toBe(false);
    });

    it('should update form data in provider', () => {
      const provider = new DefaultFormDataProvider();
      
      provider.setFieldValue('username', 'newuser');
      provider.updateFormData({ userType: 'admin', email: 'test@example.com' });

      expect(provider.getFieldValue('username')).toBe('newuser');
      expect(provider.getFieldValue('userType')).toBe('admin');
      expect(provider.getFieldValue('email')).toBe('test@example.com');
    });

    it('should register and create providers via factory', () => {
      // The factory should already have form provider registered
      const provider = DataProviderFactory.create('form', {
        initialData: { test: 'value' }
      });

      expect(provider.type).toBe('form');
      expect(provider.getData()).toEqual({ test: 'value' });
    });
  });

  describe('Complete Form with Conditional Fields', () => {
    it('should build a complete form with conditional fields', () => {
      const userTypeField = FieldMetaBuilder.create()
        .name('userType')
        .label('User Type')
        .inputType('select')
        .properties({
          options: [
            { label: 'Regular User', value: 'user' },
            { label: 'Business User', value: 'business' },
            { label: 'Administrator', value: 'admin' }
          ]
        })
        .required(true)
        .build();

      const companyField = FieldMetaBuilder.create()
        .name('companyName')
        .label('Company Name')
        .inputType('input')
        .properties({ placeholder: 'Enter company name' })
        .showWhenEquals('userType', 'business')
        .required(true)
        .build();

      const adminPanelField = FieldMetaBuilder.create()
        .name('adminAccess')
        .label('Admin Panel Access')
        .inputType('checkbox')
        .showWhenEquals('userType', 'admin')
        .build();

      const form = FormMetaBuilder.create()
        .action('createUser')
        .showJsonEditor(true)
        .addField(userTypeField)
        .addField(companyField)
        .addField(adminPanelField)
        .build();

      expect(form.fields).toHaveLength(3);
      expect(form.showJsonEditor).toBe(true);
      expect(form.fields[1].conditionalRender?.condition).toEqual({
        field: 'userType',
        operator: 'eq',
        value: 'business'
      });
      expect(form.fields[2].conditionalRender?.condition).toEqual({
        field: 'userType',
        operator: 'eq',
        value: 'admin'
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined condition gracefully', () => {
      const field = FieldMetaBuilder.create()
        .name('test')
        .build();

      expect(field.conditionalRender).toBeUndefined();
    });

    it('should preserve existing event bindings when adding condition', () => {
      const existingEvent = {
        onChange: { action: 'updateField', args: { fieldName: 'test' } }
      };

      const field = FieldMetaBuilder.create()
        .name('test')
        .event(existingEvent)
        .showWhenEquals('userType', 'admin')
        .build();

      expect(field.event?.onChange).toEqual(existingEvent.onChange);
    });

    it('should handle complex conditional expressions', () => {
      const complexCondition: ConditionalExpression = {
        and: [
          {
            field: 'userType',
            operator: 'eq',
            value: 'admin'
          },
          {
            field: 'isActive',
            operator: 'eq',
            value: true
          }
        ]
      };

      const field = FieldMetaBuilder.create()
        .name('superAdminFeatures')
        .withCondition(complexCondition)
        .build();

      expect(field.conditionalRender?.condition).toEqual(complexCondition);
    });
  });
});
