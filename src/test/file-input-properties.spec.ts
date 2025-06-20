import 'reflect-metadata';
import { FormField } from '../core/xingine.decorator';
import { validateFormField } from '../core/utils/validation.util';
import { FileInputProperties } from '../core/component/form-meta-map';
import { fileInputPropertiesDecoder } from '../core/decoders/form.decoder';

/**
 * Test DTO for FileInputProperties validation
 */
class FileUploadTestDto {
  @FormField({
    label: 'Profile Picture',
    inputType: 'file',
    required: true,
    properties: {
      allowedFileTypes: ['.jpg', '.jpeg', '.png'],
      maxFileSizeMB: 5,
      maxFileCount: 1,
      captureFilename: true,
      captureUploadPath: true,
      placeholder: 'Upload your profile picture',
      fileTypeValidationMessage: 'Only JPG, JPEG, and PNG files are allowed',
      fileSizeValidationMessage: 'File size must be less than 5MB'
    }
  })
  profilePicture!: string;

  @FormField({
    label: 'Documents',
    inputType: 'file',
    required: false,
    properties: {
      allowedFileTypes: ['application/pdf', '.doc', '.docx'],
      maxFileSize: 10485760, // 10MB in bytes
      minFileCount: 0,
      maxFileCount: 3,
      allowDragDrop: true,
      captureFilename: true,
      placeholder: 'Upload supporting documents (optional)'
    }
  })
  documents!: string[];

  @FormField({
    label: 'Simple File',
    inputType: 'file',
    required: false,
    properties: {
      disabled: false,
      captureUploadPath: false
    }
  })
  simpleFile!: string;
}

describe('FileInputProperties', () => {
  describe('Interface validation', () => {
    it('should accept valid FileInputProperties with all properties', () => {
      const properties: FileInputProperties = {
        allowedFileTypes: ['.jpg', '.png', 'application/pdf'],
        maxFileSize: 5242880,
        maxFileSizeMB: 5,
        minFileCount: 1,
        maxFileCount: 3,
        required: true,
        disabled: false,
        placeholder: 'Upload files here',
        captureFilename: true,
        captureUploadPath: true,
        allowDragDrop: true,
        fileTypeValidationMessage: 'Invalid file type',
        fileSizeValidationMessage: 'File too large',
        fileCountValidationMessage: 'Too many files'
      };

      expect(properties).toBeDefined();
      expect(properties.allowedFileTypes).toEqual(['.jpg', '.png', 'application/pdf']);
      expect(properties.maxFileSize).toBe(5242880);
      expect(properties.captureFilename).toBe(true);
    });

    it('should accept minimal FileInputProperties', () => {
      const properties: FileInputProperties = {};

      expect(properties).toBeDefined();
      expect(properties.allowedFileTypes).toBeUndefined();
      expect(properties.maxFileSize).toBeUndefined();
    });

    it('should work with mixed file type specifications', () => {
      const properties: FileInputProperties = {
        allowedFileTypes: ['.jpg', 'image/png', 'application/pdf', '.docx'],
        maxFileCount: 5
      };

      expect(properties.allowedFileTypes).toHaveLength(4);
      expect(properties.allowedFileTypes).toContain('.jpg');
      expect(properties.allowedFileTypes).toContain('image/png');
      expect(properties.allowedFileTypes).toContain('application/pdf');
    });
  });

  describe('Decoder validation', () => {
    it('should decode valid FileInputProperties', () => {
      const input = {
        allowedFileTypes: ['.jpg', '.png'],
        maxFileSize: 1048576,
        maxFileCount: 2,
        required: true,
        placeholder: 'Upload images'
      };

      const decoded = fileInputPropertiesDecoder.verify(input);

      expect(decoded).toEqual(input);
      expect(decoded.allowedFileTypes).toEqual(['.jpg', '.png']);
      expect(decoded.maxFileSize).toBe(1048576);
    });

    it('should decode empty FileInputProperties', () => {
      const input = {};

      const decoded = fileInputPropertiesDecoder.verify(input);

      expect(decoded).toEqual({});
    });

    it('should handle optional properties correctly', () => {
      const input = {
        maxFileSizeMB: 10,
        captureFilename: true,
        allowDragDrop: false
      };

      const decoded = fileInputPropertiesDecoder.verify(input);

      expect(decoded.maxFileSizeMB).toBe(10);
      expect(decoded.captureFilename).toBe(true);
      expect(decoded.allowDragDrop).toBe(false);
    });

    it('should reject invalid types', () => {
      const invalidInputs = [
        { allowedFileTypes: 'not-an-array' },
        { maxFileSize: 'not-a-number' },
        { required: 'not-a-boolean' },
        { captureFilename: 123 }
      ];

      invalidInputs.forEach(input => {
        expect(() => fileInputPropertiesDecoder.verify(input)).toThrow();
      });
    });
  });

  describe('Form validation integration', () => {
    it('should work with form validation for required file fields', () => {
      const dto = new FileUploadTestDto();
      // No file set for required field
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'profilePicture',
        message: 'Profile Picture is required'
      });
    });

    it('should pass validation when all required files are present', () => {
      const dto = new FileUploadTestDto();
      dto.profilePicture = 'profile.jpg';
      dto.documents = ['doc1.pdf', 'doc2.docx'];
      dto.simpleFile = 'simple.txt';
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle optional file fields correctly', () => {
      const dto = new FileUploadTestDto();
      dto.profilePicture = 'profile.jpg';
      // Leave documents and simpleFile empty (they're optional)
      
      const result = validateFormField(dto);

      expect(result.isValid).toBe(true);
    });
  });

  describe('File validation properties', () => {
    it('should support both byte and MB size specifications', () => {
      const bytesProps: FileInputProperties = {
        maxFileSize: 5242880 // 5MB in bytes
      };

      const mbProps: FileInputProperties = {
        maxFileSizeMB: 5 // 5MB
      };

      expect(bytesProps.maxFileSize).toBe(5242880);
      expect(mbProps.maxFileSizeMB).toBe(5);
    });

    it('should support file count restrictions', () => {
      const props: FileInputProperties = {
        minFileCount: 1,
        maxFileCount: 5
      };

      expect(props.minFileCount).toBe(1);
      expect(props.maxFileCount).toBe(5);
    });

    it('should support custom validation messages', () => {
      const props: FileInputProperties = {
        fileTypeValidationMessage: 'Custom file type error',
        fileSizeValidationMessage: 'Custom file size error',
        fileCountValidationMessage: 'Custom file count error'
      };

      expect(props.fileTypeValidationMessage).toBe('Custom file type error');
      expect(props.fileSizeValidationMessage).toBe('Custom file size error');
      expect(props.fileCountValidationMessage).toBe('Custom file count error');
    });
  });

  describe('File metadata capture', () => {
    it('should support filename and path capture options', () => {
      const props: FileInputProperties = {
        captureFilename: true,
        captureUploadPath: true
      };

      expect(props.captureFilename).toBe(true);
      expect(props.captureUploadPath).toBe(true);
    });

    it('should support drag and drop configuration', () => {
      const props: FileInputProperties = {
        allowDragDrop: true
      };

      expect(props.allowDragDrop).toBe(true);
    });

    it('should support renderer configuration', () => {
      const props: FileInputProperties = {
        allowedFileTypes: ['.pdf', '.doc'],
        maxFileSizeMB: 10,
        renderer: {
          mode: 'dropzone',
          layout: {
            display: 'flex',
            alignment: 'center'
          },
          interaction: {
            draggable: true,
            hoverable: true
          },
          display: {
            showBorder: true,
            borderRadius: 8,
            backgroundColor: '#f9f9f9'
          },
          animation: {
            type: 'fade',
            duration: 200
          }
        }
      };

      expect(props.renderer).toBeDefined();
      expect(props.renderer?.mode).toBe('dropzone');
      expect(props.renderer?.layout?.display).toBe('flex');
      expect(props.renderer?.interaction?.draggable).toBe(true);
      expect(props.renderer?.display?.backgroundColor).toBe('#f9f9f9');
      expect(props.renderer?.animation?.type).toBe('fade');
    });

    it('should work without renderer configuration', () => {
      const props: FileInputProperties = {
        allowedFileTypes: ['.jpg', '.png'],
        maxFileSize: 1048576
      };

      expect(props).toBeDefined();
      expect(props.renderer).toBeUndefined();
    });
  });

  describe('Decoder validation with renderer', () => {
    it('should decode FileInputProperties with renderer configuration', () => {
      const input = {
        allowedFileTypes: ['.jpg', '.png'],
        maxFileSize: 1048576,
        renderer: {
          mode: 'dropzone',
          layout: {
            display: 'flex',
            columns: 2
          },
          interaction: {
            draggable: true,
            hoverable: true
          },
          display: {
            showBorder: true,
            backgroundColor: '#ffffff'
          }
        }
      };

      const decoded = fileInputPropertiesDecoder.verify(input);

      expect(decoded).toEqual(input);
      expect(decoded.renderer?.mode).toBe('dropzone');
      expect(decoded.renderer?.layout?.columns).toBe(2);
      expect(decoded.renderer?.interaction?.draggable).toBe(true);
    });

    it('should decode FileInputProperties with minimal renderer configuration', () => {
      const input = {
        allowedFileTypes: ['.pdf'],
        renderer: {
          mode: 'compact'
        }
      };

      const decoded = fileInputPropertiesDecoder.verify(input);

      expect(decoded.renderer?.mode).toBe('compact');
      expect(decoded.renderer?.layout).toBeUndefined();
      expect(decoded.renderer?.interaction).toBeUndefined();
    });

    it('should decode FileInputProperties with empty renderer configuration', () => {
      const input = {
        maxFileSize: 1024,
        renderer: {}
      };

      const decoded = fileInputPropertiesDecoder.verify(input);

      expect(decoded.renderer).toEqual({});
    });

    it('should decode FileInputProperties without renderer property', () => {
      const input = {
        allowedFileTypes: ['.txt'],
        maxFileSize: 512
      };

      const decoded = fileInputPropertiesDecoder.verify(input);

      expect(decoded.renderer).toBeUndefined();
    });
  });

  describe('Form validation integration with renderer', () => {
    it('should work with renderer configuration in form field definition', () => {
      class TestFileDto {
        @FormField({
          label: 'Document Upload',
          inputType: 'file',
          properties: {
            allowedFileTypes: ['.pdf', '.doc'],
            maxFileSizeMB: 10,
            renderer: {
              mode: 'dropzone',
              layout: {
                display: 'flex',
                alignment: 'center'
              },
              interaction: {
                draggable: true,
                hoverable: true
              }
            }
          }
        })
        documents!: string[];
      }

      const dto = new TestFileDto();
      dto.documents = ['document.pdf'];

      const result = validateFormField(dto);
      expect(result.isValid).toBe(true);
    });
  });
});