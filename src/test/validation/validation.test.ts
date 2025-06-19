import 'reflect-metadata';
import { FormField, validateFormField } from '../../core/xingine.decorator';

/**
 * ValidationTestDto with various field types and validation properties
 * for comprehensive testing of the validateFormField function
 */
class ValidationTestDto {
  @FormField({
    label: 'Required Email',
    inputType: 'input',
    required: true,
    properties: {
      email: true,
      minLength: 5,
      maxLength: 50
    }
  })
  requiredEmail!: string;

  @FormField({
    label: 'Username',
    inputType: 'input',
    required: true,
    properties: {
      minLength: 3,
      maxLength: 20,
      regex: '^[a-zA-Z0-9_]{3,20}$'
    }
  })
  username!: string;

  @FormField({
    label: 'Role Code',
    inputType: 'input',
    required: false,
    properties: {
      regex: 'ROLE_[a-zA-Z0-9_]{0,15}'
    }
  })
  roleCode!: string;

  @FormField({
    label: 'Age',
    inputType: 'number',
    required: true,
    properties: {
      min: 18,
      max: 120
    }
  })
  age!: number;

  @FormField({
    label: 'Price',
    inputType: 'number',
    required: false,
    properties: {
      min: 0.01,
      max: 999999.99,
      precision: 2
    }
  })
  price!: number;

  @FormField({
    label: 'Country',
    inputType: 'select',
    required: true,
    properties: {
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' }
      ],
      multiple: false
    }
  })
  country!: string;

  @FormField({
    label: 'Languages',
    inputType: 'select',
    required: false,
    properties: {
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' }
      ],
      multiple: true
    }
  })
  languages!: string[];

  @FormField({
    label: 'Password',
    inputType: 'password',
    required: true,
    properties: {
      minLength: 8
    }
  })
  password!: string;

  @FormField({
    label: 'Description',
    inputType: 'textarea',
    required: false,
    properties: {
      maxLength: 500
    }
  })
  description!: string;

  @FormField({
    label: 'Birth Date',
    inputType: 'date',
    required: true,
    properties: {
      format: 'YYYY-MM-DD'
    }
  })
  birthDate!: string;

  @FormField({
    label: 'Optional Field',
    inputType: 'input',
    required: false,
    properties: {
      maxLength: 100
    }
  })
  optionalField!: string;
}

describe('validateFormField', () => {
  describe('Required field validation', () => {
    it('should return error when required field is undefined', () => {
      const dto = new ValidationTestDto();
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'requiredEmail',
        message: 'Required Email is required'
      });
    });

    it('should return error when required field is null', () => {
      const dto = new ValidationTestDto();
      (dto as any).requiredEmail = null;
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'requiredEmail',
        message: 'Required Email is required'
      });
    });

    it('should return error when required field is empty string', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = '';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'requiredEmail',
        message: 'Required Email is required'
      });
    });

    it('should not return error for optional fields when empty', () => {
      const dto = new ValidationTestDto();
      // Set all required fields with valid values
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      // Leave optional fields empty
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Email validation', () => {
    it('should return error when email format is invalid', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'invalid-email';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'requiredEmail',
        message: 'Required Email must be a valid email address'
      });
    });

    it('should pass when email format is valid', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'valid@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Regex validation', () => {
    it('should return error when value does not match regex pattern', () => {
      const dto = new ValidationTestDto();
      dto.username = 'invalid-username!'; // Contains special character not allowed
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'username',
        message: 'Username must match the required format'
      });
    });

    it('should pass when value matches regex pattern', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'valid_user123'; // Valid username format
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });

    it('should validate role code regex pattern correctly', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      dto.roleCode = 'ROLE_ADMIN123_TEST'; // Valid role code
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });

    it('should return error for invalid role code pattern', () => {
      const dto = new ValidationTestDto();
      dto.roleCode = 'INVALID_ROLE'; // Doesn't start with ROLE_
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'roleCode',
        message: 'Role Code must match the required format'
      });
    });
  });

  describe('Length validation', () => {
    it('should return error when value is shorter than minLength', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'a@b'; // Too short (less than 5 characters)
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'requiredEmail',
        message: 'Required Email must be at least 5 characters'
      });
    });

    it('should return error when value is longer than maxLength', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'a'.repeat(51) + '@example.com'; // Too long (more than 50 characters)
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'requiredEmail',
        message: 'Required Email must not exceed 50 characters'
      });
    });

    it('should pass when value length is within bounds', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'valid@example.com'; // Within bounds
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Number validation', () => {
    it('should return error when number is below minimum', () => {
      const dto = new ValidationTestDto();
      dto.age = 17; // Below minimum age of 18
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'age',
        message: 'Age must be at least 18'
      });
    });

    it('should return error when number is above maximum', () => {
      const dto = new ValidationTestDto();
      dto.age = 121; // Above maximum age of 120
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'age',
        message: 'Age must not exceed 120'
      });
    });

    it('should return error when number is not valid', () => {
      const dto = new ValidationTestDto();
      (dto as any).age = 'not-a-number';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'age',
        message: 'Age must be a valid number'
      });
    });

    it('should pass when number is within range', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25; // Valid age
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Decimal validation', () => {
    it('should validate decimal numbers correctly', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      dto.price = 99.99; // Valid decimal
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });

    it('should return error for decimal below minimum', () => {
      const dto = new ValidationTestDto();
      dto.price = 0.001; // Below minimum of 0.01
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'price',
        message: 'Price must be at least 0.01'
      });
    });

    it('should return error for decimal above maximum', () => {
      const dto = new ValidationTestDto();
      dto.price = 1000000; // Above maximum of 999999.99
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'price',
        message: 'Price must not exceed 999999.99'
      });
    });
  });

  describe('List validation (select fields)', () => {
    it('should return error when single select value is not in options', () => {
      const dto = new ValidationTestDto();
      dto.country = 'invalid-country';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'country',
        message: 'Country must be one of the allowed options'
      });
    });

    it('should pass when single select value is valid', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us'; // Valid option
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });

    it('should return error when multiple select value is not an array', () => {
      const dto = new ValidationTestDto();
      (dto as any).languages = 'not-an-array';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'languages',
        message: 'Languages must be an array of values'
      });
    });

    it('should return error when multiple select contains invalid option', () => {
      const dto = new ValidationTestDto();
      dto.languages = ['en', 'invalid-language'];
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'languages',
        message: 'Languages contains invalid option: invalid-language'
      });
    });

    it('should pass when multiple select values are all valid', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      dto.languages = ['en', 'es', 'fr']; // All valid options
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Password validation', () => {
    it('should return error when password is shorter than minLength', () => {
      const dto = new ValidationTestDto();
      dto.password = 'short'; // Less than 8 characters
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'password',
        message: 'Password must be at least 8 characters'
      });
    });

    it('should pass when password meets minimum length', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123'; // 12 characters, meets minimum
      dto.birthDate = '1990-01-01';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Textarea validation', () => {
    it('should return error when textarea exceeds maxLength', () => {
      const dto = new ValidationTestDto();
      dto.description = 'a'.repeat(501); // Exceeds maxLength of 500
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'description',
        message: 'Description must not exceed 500 characters'
      });
    });

    it('should pass when textarea is within maxLength', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01';
      dto.description = 'a'.repeat(500); // Exactly at maxLength
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Date validation', () => {
    it('should return error when date is invalid', () => {
      const dto = new ValidationTestDto();
      dto.birthDate = 'invalid-date';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'birthDate',
        message: 'Birth Date must be a valid date'
      });
    });

    it('should pass when date is valid', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser';
      dto.age = 25;
      dto.country = 'us';
      dto.password = 'password123';
      dto.birthDate = '1990-01-01'; // Valid date
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Comprehensive validation', () => {
    it('should return multiple errors when multiple fields fail validation', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'invalid-email'; // Invalid email
      dto.username = 'ab'; // Too short
      dto.age = 17; // Too young
      dto.country = 'invalid'; // Invalid option
      dto.password = 'short'; // Too short
      dto.birthDate = 'invalid'; // Invalid date
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      
      // Check that we have errors for multiple fields
      const errorFields = result.errors.map(error => error.field);
      expect(errorFields).toContain('requiredEmail');
      expect(errorFields).toContain('username');
      expect(errorFields).toContain('age');
      expect(errorFields).toContain('country');
      expect(errorFields).toContain('password');
      expect(errorFields).toContain('birthDate');
    });

    it('should pass when all validations are satisfied', () => {
      const dto = new ValidationTestDto();
      dto.requiredEmail = 'test@example.com';
      dto.username = 'testuser123';
      dto.roleCode = 'ROLE_ADMIN_TEST';
      dto.age = 25;
      dto.price = 99.99;
      dto.country = 'us';
      dto.languages = ['en', 'es'];
      dto.password = 'password123';
      dto.description = 'Valid description';
      dto.birthDate = '1990-01-01';
      dto.optionalField = 'Optional value';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});