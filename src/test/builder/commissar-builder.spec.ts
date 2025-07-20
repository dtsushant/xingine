import { CommissarBuilder, LayoutRendererBuilder, LayoutComponentDetailBuilder } from '../../core/builder';
import { Commissar, PathProperties } from '../../core/xingine.type';

describe('CommissarBuilder', () => {
  describe('Basic functionality', () => {
    it('should create a Commissar with required path', () => {
      const commissar = CommissarBuilder.create()
        .path('/test-route')
        .build();

      expect(commissar).toEqual({
        path: '/test-route'
      });
    });

    it('should create a Commissar with path and permissions', () => {
      const commissar = CommissarBuilder.create()
        .path('/admin-route')
        .permission(['admin', 'read'])
        .build();

      expect(commissar).toEqual({
        path: '/admin-route',
        permission: ['admin', 'read']
      });
    });

    it('should throw error when path is not set', () => {
      expect(() => {
        CommissarBuilder.create().build();
      }).toThrow('Path is required for Commissar');
    });

    it('should create a Commissar with PathProperties object', () => {
      const pathProps: PathProperties = {
        overrideLayout: 'antd',
        path: '/menu-item'
      };

      const commissar = CommissarBuilder.create()
        .pathWithProperties(pathProps)
        .build();

      expect(commissar.path).toEqual(pathProps);
      expect(typeof commissar.path).toBe('object');
      
      // Validate PathProperties structure
      const pathObj = commissar.path as PathProperties;
      expect(pathObj.path).toBe('/menu-item');
      expect(pathObj.overrideLayout).toBe('antd');
    });

    it('should create a Commissar with pathWithProperties accepting string', () => {
      const commissar = CommissarBuilder.create()
        .pathWithProperties('/string-path')
        .build();

      expect(commissar.path).toBe('/string-path');
      expect(typeof commissar.path).toBe('string');
    });

    it('should support adding individual permissions', () => {
      const commissar = CommissarBuilder.create()
        .path('/dashboard')
        .addPermission('read')
        .addPermission('write')
        .build();

      expect(commissar.permission).toEqual(['read', 'write']);
    });

    it('should support building components using inherited builder methods', () => {
      const commissar = CommissarBuilder.create()
        .path('/content')
        .wrapper()
        .content('test wrapper content')
        .className('test-wrapper')
        .build();

      expect(commissar.meta?.component).toBe('WrapperRenderer');
      expect((commissar.meta?.properties as any).content).toBe('test wrapper content');
      expect((commissar.meta?.properties as any).style?.className).toBe('test-wrapper');
    });
  });

  describe('Builder methods', () => {
    it('should create from existing Commissar object', () => {
      const existing: Commissar = {
        path: '/existing',
        permission: ['user'],
        meta: { component: 'ButtonRenderer', properties: { content: 'Button', name: 'testBtn' } }
      };

      const result = CommissarBuilder.fromCommissar(existing)
        .addPermission('admin')
        .build();

      expect(result.permission).toEqual(['user', 'admin']);
      expect(result.path).toBe('/existing');
    });

    it('should support fromObject method', () => {
      const commissar = CommissarBuilder.create()
        .fromObject({
          path: '/from-object',
          permission: ['test']
        })
        .addPermission('additional')
        .build();

      expect(commissar.permission).toEqual(['test', 'additional']);
    });

    it('should support custom properties', () => {
      const commissar = CommissarBuilder.create()
        .path('/custom')
        .property('customProp', 'customValue')
        .setProperties({ prop1: 'value1', prop2: 'value2' })
        .build();

      expect((commissar as any).customProp).toBe('customValue');
      expect((commissar as any).prop1).toBe('value1');
      expect((commissar as any).prop2).toBe('value2');
    });
  });

  describe('Real-world usage with actual data', () => {
    const userFormFields = [
      {
        name: "name",
        label: "Name",
        inputType: "input" as const,
        required: true,
        properties: {},
      },
      {
        name: "email",
        label: "Email",
        inputType: "input" as const,
        required: true,
        properties: {},
      },
      {
        name: "role",
        label: "Role",
        inputType: "select",
        properties: {},
      },
    ];

    const userTableData = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        active: true,
        createdAt: "2024-01-01",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "User",
        active: true,
        createdAt: "2024-01-02",
      },
    ];

    const userDetailData = {
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      active: true,
      createdAt: "2024-01-01",
      lastLogin: "2024-01-15T10:30:00Z",
      profile: {
        avatar: "https://example.com/avatar.jpg",
        department: "Engineering",
        phone: "+1-555-0123",
        bio: "Software engineer with 5 years of experience in web development.",
      },
      permissions: ["read", "write", "admin"],
    };

    it('should build a form Commissar using inherited form builder methods', () => {
      const formCommissar = CommissarBuilder.create()
        .path('/user-form')
        .permission(['admin', 'write'])
        .form()
        .addField({
          name: userFormFields[0].name,
          label: userFormFields[0].label,
          inputType: userFormFields[0].inputType as keyof import('../../core/component/form-meta-map').FieldInputTypeProperties,
          required: userFormFields[0]['required'],
          properties: {}
        })
        .addField({
          name: userFormFields[1].name,
          label: userFormFields[1].label,
          inputType: userFormFields[1].inputType as keyof import('../../core/component/form-meta-map').FieldInputTypeProperties,
          required: userFormFields[1]['required'],
          properties: {}
        })
        .addField({
          name: userFormFields[2].name,
          label: userFormFields[2].label,
          inputType: userFormFields[2].inputType as keyof import('../../core/component/form-meta-map').FieldInputTypeProperties,
          properties: {}
        })
        .action('/submit-user')
        .build();

      expect(formCommissar.path).toBe('/user-form');
      expect(formCommissar.permission).toEqual(['admin', 'write']);
      expect(formCommissar.meta?.component).toBe('FormRenderer');
      expect((formCommissar.meta?.properties as any).fields).toHaveLength(3);
      expect((formCommissar.meta?.properties as any).action).toBe('/submit-user');
    });

    it('should build a table Commissar using inherited table builder methods', () => {
      const tableCommissar = CommissarBuilder.create()
        .path('/user-table')
        .permission(['admin', 'read'])
        .table()
        .addColumn({ title: 'ID', dataIndex: 'id', key: 'id' })
        .addColumn({ title: 'Name', dataIndex: 'name', key: 'name' })
        .addColumn({ title: 'Email', dataIndex: 'email', key: 'email' })
        .addColumn({ title: 'Role', dataIndex: 'role', key: 'role' })
        .data(userTableData)
        .build();

      expect(tableCommissar.path).toBe('/user-table');
      expect(tableCommissar.permission).toEqual(['admin', 'read']);
      expect(tableCommissar.meta?.component).toBe('TableRenderer');
      expect((tableCommissar.meta?.properties as any).columns).toHaveLength(4);
      expect((tableCommissar.meta?.properties as any).data).toEqual(userTableData);
    });

    it('should build a detail view Commissar using inherited detail builder methods', () => {
      const detailCommissar = CommissarBuilder.create()
        .path('/user-detail')
        .permission(['admin', 'read'])
        .detailRenderer()
        .addField({ name: 'name', label: 'Name', inputType: 'text', value: userDetailData.name })
        .addField({ name: 'email', label: 'Email', inputType: 'text', value: userDetailData.email })
        .addField({ name: 'role', label: 'Role', inputType: 'text', value: userDetailData.role })
        .addField({ name: 'department', label: 'Department', inputType: 'text', value: userDetailData.profile.department })
        .build();

      expect(detailCommissar.path).toBe('/user-detail');
      expect(detailCommissar.permission).toEqual(['admin', 'read']);
      expect(detailCommissar.meta?.component).toBe('DetailRenderer');
      expect((detailCommissar.meta?.properties as any).fields).toHaveLength(4);
    });

    it('should build a chart Commissar using inherited chart builder methods', () => {
      const chartCommissar = CommissarBuilder.create()
        .path('/user-chart')
        .permission(['admin', 'read'])
        .chart()
        .addChartConfig({
          type: 'bar',
          width: 300,
          height: 300,
          title: 'Sales Performance',
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Sales',
            data: [4000, 3000, 2000, 2780, 1890, 2390]
          }]
        })
        .build();

      expect(chartCommissar.path).toBe('/user-chart');
      expect(chartCommissar.permission).toEqual(['admin', 'read']);
      expect(chartCommissar.meta?.component).toBe('ChartRenderer');
      expect((chartCommissar.meta?.properties as any).charts).toHaveLength(1);
      expect((chartCommissar.meta?.properties as any).charts?.[0].type).toBe('bar');
      expect((chartCommissar.meta?.properties as any).charts?.[0].title).toBe('Sales Performance');
    });

    it('should build complex nested wrapper with multiple components', () => {
      // Create child components as LayoutComponentDetail (not Commissar)
      const formComponent = CommissarBuilder.create()
        .path('/nested-form')
        .form()
        .addField({
          name: 'search',
          label: 'Search',
          inputType: 'input' as keyof import('../../core/component/form-meta-map').FieldInputTypeProperties,
          properties: {}
        })
        .build();

      const buttonComponent = CommissarBuilder.create()
        .path('/nested-button')
        .button()
        .name('actionBtn')
        .content('Add User')
        .build();

      const complexCommissar = CommissarBuilder.create()
        .path('/complex-layout')
        .permission(['admin'])
        .wrapper()
        .content('User Management Dashboard')
        .addChild(formComponent)
        .addChild(buttonComponent)
        .build();

      expect(complexCommissar.path).toBe('/complex-layout');
      expect(complexCommissar.meta?.component).toBe('WrapperRenderer');
      expect((complexCommissar.meta?.properties as any).children).toHaveLength(2);
      expect((complexCommissar.meta?.properties as any).children?.[0].path).toBe('/nested-form');
      expect((complexCommissar.meta?.properties as any).children?.[1].path).toBe('/nested-button');
      expect((complexCommissar.meta?.properties as any).children?.[0].meta?.component).toBe('FormRenderer');
      expect((complexCommissar.meta?.properties as any).children?.[1].meta?.component).toBe('ButtonRenderer');
    });
  });
});

describe('LayoutRenderer with Commissar arrays', () => {
  describe('Array support', () => {
    it('should create layout with multiple Commissar objects in content', () => {
      const commissar1 = CommissarBuilder.create()
        .path('/route1')
        .permission(['user'])
        .wrapper()
        .content('Content 1')
        .build();

      const commissar2 = CommissarBuilder.create()
        .path('/route2')
        .permission(['admin'])
        .button()
        .name('testButton')
        .content('Button')
        .build();

      const layout = LayoutRendererBuilder.create()
        .type('multi-content')
        .withContent([commissar1, commissar2])
        .build();

      expect(layout.content.meta).toHaveLength(2);
      expect(layout.content.meta[0].path).toBe('/route1');
      expect(layout.content.meta[1].path).toBe('/route2');
      expect(layout.content.meta[0].permission).toEqual(['user']);
      expect(layout.content.meta[1].permission).toEqual(['admin']);
    });

    it('should support adding individual Commissar objects', () => {
      const commissar1 = CommissarBuilder.create()
        .path('/first')
        .build();

      const commissar2 = CommissarBuilder.create()
        .path('/second')
        .permission(['admin'])
        .build();

      const layout = LayoutRendererBuilder.create()
        .type('incremental')
        .addContentCommissar(commissar1)
        .addContentCommissar(commissar2)
        .build();

      expect(layout.content.meta).toHaveLength(2);
      expect(layout.content.meta[0].path).toBe('/first');
      expect(layout.content.meta[1].path).toBe('/second');
      expect(layout.content.meta[1].permission).toEqual(['admin']);
    });

    it('should support content style with array meta', () => {
      const commissar = CommissarBuilder.create()
        .path('/styled')
        .build();

      const layout = LayoutRendererBuilder.create()
        .type('styled-content')
        .withContent([commissar], { className: 'content-style' })
        .contentStyle({ style: { backgroundColor: 'blue' } })
        .build();

      expect(layout.content.style?.className).toBe('content-style');
      expect(layout.content.style?.style?.backgroundColor).toBe('blue');
      expect(layout.content.meta).toHaveLength(1);
    });

    it('should handle single Commissar conversion to array in setSection', () => {
      const commissar = CommissarBuilder.create()
        .path('/single')
        .build();

      const builder = LayoutRendererBuilder.create()
        .type('single-to-array');

      // Using internal setSection method to test single commissar conversion
      (builder as any).setSection('content', commissar);
      const result = builder.build();

      expect(result.content.meta).toHaveLength(1);
      expect(result.content.meta[0].path).toBe('/single');
    });

    it('should validate that all Commissar objects have paths', () => {
      const invalidCommissar = { permission: ['user'] } as any;

      expect(() => {
        LayoutRendererBuilder.create()
          .withContent([invalidCommissar])
          .build();
      }).toThrow('Content section requires all Commissar objects to have a path property.');
    });
  });

  describe('Integration with section builders', () => {
    it('should work with content section builder', () => {
      const component = LayoutComponentDetailBuilder.create()
        .wrapper()
        .className('content-wrapper')
        .content('Test content')
        .build();

      const layout = LayoutRendererBuilder.create()
        .type('section-builder')
        .content()
        .path('/section-path')
        .permission(['user', 'read'])
        .withComponent(component)
        .build();

      expect(layout.content.meta).toHaveLength(1);
      expect(layout.content.meta[0].path).toBe('/section-path');
      expect(layout.content.meta[0].permission).toEqual(['user', 'read']);
      expect(layout.content.meta[0].meta?.component).toBe('WrapperRenderer');
    });

    it('should support multiple section builder calls', () => {
      const layout = LayoutRendererBuilder.create()
        .type('multiple-sections')
        .content()
        .path('/first-section')
        .wrapper()
        .content('First content')
        .build()
        .content()
        .path('/second-section')
        .button()
        .name('testButton')
        .content('Click me')
        .build()
        .build();

      expect(layout.content.meta).toHaveLength(2);
      expect(layout.content.meta[0].path).toBe('/first-section');
      expect(layout.content.meta[1].path).toBe('/second-section');
      expect(layout.content.meta[0].meta?.component).toBe('WrapperRenderer');
      expect(layout.content.meta[1].meta?.component).toBe('ButtonRenderer');
    });
  });
});