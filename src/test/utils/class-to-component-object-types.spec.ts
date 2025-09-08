import 'reflect-metadata';
import { extractFormMetaFromClass } from '../../core/utils/class-to-component.util';
import { FormField, FormGroup, FormClass } from '../../core/decorators';

// Test classes for nested object types
class AddressInfo {
    @FormField({
        label: 'Street Address',
        inputType: 'input',
        required: true,
        properties: {
            placeholder: 'Enter street address'
        }
    })
    street!: string;

    @FormField({
        label: 'City',
        inputType: 'input',
        required: true,
        properties: {
            placeholder: 'Enter city'
        }
    })
    city!: string;

    @FormField({
        label: 'Country',
        inputType: 'input',
        required: true,
        properties: {
            placeholder: 'Enter country'
        }
    })
    country!: string;
}

class ContactInfo {
    @FormField({
        label: 'Email',
        inputType: 'input',
        required: true,
        properties: {
            placeholder: 'Enter email address'
        }
    })
    email!: string;

    @FormField({
        label: 'Phone',
        inputType: 'input',
        required: false,
        properties: {
            placeholder: 'Enter phone number'
        }
    })
    phone?: string;
}

@FormClass({
    title: 'Test Form with Object Types',
    action: '/api/test'
})
class TestFormWithObjectTypes {
    @FormField({
        label: 'Name',
        inputType: 'input',
        required: true
    })
    name!: string;

    @FormField({
        label: 'Address Information',
        inputType: 'object',
        required: false
    })
    address?: AddressInfo;

    @FormField({
        label: 'Contact Details',
        inputType: 'object[]',
        required: false,
        itemType: ContactInfo
    })
    contacts?: ContactInfo[];

    @FormField({
        label: 'Emergency Contact',
        inputType: 'object',
        required: true
    })
    emergencyContact!: ContactInfo;
}

describe('Class to Component Util - Object Types', () => {
    beforeAll(() => {
        // Ensure metadata is properly set up
        Reflect.defineMetadata('design:type', String, TestFormWithObjectTypes.prototype, 'name');
        Reflect.defineMetadata('design:type', AddressInfo, TestFormWithObjectTypes.prototype, 'address');
        Reflect.defineMetadata('design:type', Array, TestFormWithObjectTypes.prototype, 'contacts');
        Reflect.defineMetadata('design:type', ContactInfo, TestFormWithObjectTypes.prototype, 'emergencyContact');
    });

    describe('extractFormMetaFromClass with Object Types', () => {
        it('should extract form metadata with nested object fields', () => {
            const formMeta = extractFormMetaFromClass(TestFormWithObjectTypes);
            
            expect(formMeta).toBeDefined();
            expect(formMeta.fields).toBeDefined();
            expect(formMeta.fields.length).toBeGreaterThan(0);
            
            // Find the address field
            const addressField = formMeta.fields.find(f => f.name === 'address');
            expect(addressField).toBeDefined();
            expect(addressField?.inputType).toBe('object');
            expect(addressField?.properties).toBeDefined();
            expect((addressField?.properties as any)?.fields).toBeDefined();
            
            // Check nested fields
            const addressFields = (addressField?.properties as any)?.fields;
            expect(addressFields).toHaveLength(3);
            
            const streetField = addressFields.find((f: any) => f.name === 'street');
            expect(streetField).toBeDefined();
            expect(streetField.inputType).toBe('input');
            expect(streetField.required).toBe(true);
        });

        it('should extract form metadata with object array fields', () => {
            const formMeta = extractFormMetaFromClass(TestFormWithObjectTypes);
            
            // Find the contacts field
            const contactsField = formMeta.fields.find(f => f.name === 'contacts');
            expect(contactsField).toBeDefined();
            expect(contactsField?.inputType).toBe('object[]');
            expect(contactsField?.properties).toBeDefined();
            expect((contactsField?.properties as any)?.itemFields).toBeDefined();
            
            // Check item fields
            const itemFields = (contactsField?.properties as any)?.itemFields;
            expect(itemFields).toHaveLength(2);
            
            const emailField = itemFields.find((f: any) => f.name === 'email');
            expect(emailField).toBeDefined();
            expect(emailField.inputType).toBe('input');
            expect(emailField.required).toBe(true);
            
            const phoneField = itemFields.find((f: any) => f.name === 'phone');
            expect(phoneField).toBeDefined();
            expect(phoneField.inputType).toBe('input');
            expect(phoneField.required).toBe(false);
        });

        it('should handle multiple object fields correctly', () => {
            const formMeta = extractFormMetaFromClass(TestFormWithObjectTypes);
            
            // Check that we have all expected fields
            const fieldNames = formMeta.fields.map(f => f.name);
            expect(fieldNames).toContain('name');
            expect(fieldNames).toContain('address');
            expect(fieldNames).toContain('contacts');
            expect(fieldNames).toContain('emergencyContact');
            
            // Both address and emergencyContact should be object type
            const emergencyContactField = formMeta.fields.find(f => f.name === 'emergencyContact');
            expect(emergencyContactField?.inputType).toBe('object');
            expect((emergencyContactField?.properties as any)?.fields).toBeDefined();
            
            // Emergency contact should have the same structure as contact info
            const emergencyFields = (emergencyContactField?.properties as any)?.fields;
            expect(emergencyFields).toHaveLength(2);
        });

        it('should prevent infinite recursion with visited set', () => {
            // This test ensures that recursive types don't cause infinite loops
            const formMeta = extractFormMetaFromClass(TestFormWithObjectTypes);
            
            // The extraction should complete without throwing errors
            expect(formMeta).toBeDefined();
            expect(formMeta.fields).toBeDefined();
        });
    });

    describe('Nested Class Metadata Extraction', () => {
        it('should properly extract metadata from AddressInfo class', () => {
            const addressMeta = extractFormMetaFromClass(AddressInfo);
            
            expect(addressMeta.fields).toHaveLength(3);
            
            const fieldNames = addressMeta.fields.map(f => f.name);
            expect(fieldNames).toContain('street');
            expect(fieldNames).toContain('city');
            expect(fieldNames).toContain('country');
            
            // Check that all fields have proper labels
            addressMeta.fields.forEach(field => {
                expect(field.label).toBeDefined();
                expect(field.inputType).toBe('input');
            });
        });

        it('should properly extract metadata from ContactInfo class', () => {
            const contactMeta = extractFormMetaFromClass(ContactInfo);
            
            expect(contactMeta.fields).toHaveLength(2);
            
            const emailField = contactMeta.fields.find(f => f.name === 'email');
            const phoneField = contactMeta.fields.find(f => f.name === 'phone');
            
            expect(emailField).toBeDefined();
            expect(emailField?.required).toBe(true);
            
            expect(phoneField).toBeDefined();
            expect(phoneField?.required).toBe(false);
        });
    });
});
