import 'reflect-metadata';
import { FormClass, FormField } from './src/core/decorators';
import { extractFormMetaFromClass } from './src/core/utils/class-to-component.util';

// Test the issues mentioned by the user
class Category {
  @FormField({
    inputType: 'input',
    required: true,
    placeholder: 'Enter username'
  })
  name: string = '';
  label: string = '';
  category?: Category; // Recursive reference
}

class SimpleUserDto {
  id: number = 0;
  name: string = '';
  email: string = '';
}

@FormClass({
  title: 'Sample Form',
  submitLabel: 'sample',
  action: 'sample'
})
class NewForm {
  title?: string; // Optional field without default value - this gets ignored
  description: string = '';
  simpleUser?: SimpleUserDto; // Optional complex object
  categories: Category[] = [];
  tags: string[] = [];
  isActive: boolean = false;
  createdAt: Date = new Date();
}

// Test current behavior
console.log('=== Current Issues Test ===');

const formMeta = extractFormMetaFromClass(NewForm);
console.log('Form Meta:', JSON.stringify(formMeta, null, 2));

const fieldNames = formMeta.fields.map(f => f.name);
console.log('Field names found:', fieldNames);

// Check specific issues
console.log('1. Optional title field found?', fieldNames.includes('title'));
console.log('2. SimpleUser field type:', formMeta.fields.find(f => f.name === 'simpleUser')?.inputType);
console.log('3. Categories field type:', formMeta.fields.find(f => f.name === 'categories')?.inputType);

// Test recursive Category
console.log('\n=== Category Class Test ===');
const categoryMeta = extractFormMetaFromClass(Category);
console.log('Category fields:', categoryMeta.fields.map(f => f.name));
console.log('Recursive category field found?', categoryMeta.fields.find(f => f.name === 'category'));