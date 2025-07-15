import { CommissarBuilder, LayoutRendererBuilder, LayoutComponentDetailBuilder } from '../../core/builder';
import { Commissar } from '../../core/xingine.type';

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

    it('should support adding individual permissions', () => {
      const commissar = CommissarBuilder.create()
        .path('/dashboard')
        .addPermission('read')
        .addPermission('write')
        .build();

      expect(commissar.permission).toEqual(['read', 'write']);
    });

    it('should support setting meta component', () => {
      const meta = { component: 'WrapperRenderer', properties: { content: 'test' } };
      const commissar = CommissarBuilder.create()
        .path('/content')
        .meta(meta)
        .build();

      expect(commissar.meta).toEqual(meta);
    });
  });

  describe('Builder methods', () => {
    it('should create from existing Commissar object', () => {
      const existing: Commissar = {
        path: '/existing',
        permission: ['user'],
        meta: { component: 'ButtonRenderer', properties: {} }
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
});

describe('LayoutRenderer with Commissar arrays', () => {
  describe('Array support', () => {
    it('should create layout with multiple Commissar objects in content', () => {
      const commissar1 = CommissarBuilder.create()
        .path('/route1')
        .permission(['user'])
        .meta({ component: 'WrapperRenderer', properties: { content: 'Content 1' } })
        .build();

      const commissar2 = CommissarBuilder.create()
        .path('/route2')
        .permission(['admin'])
        .meta({ component: 'ButtonRenderer', properties: { content: 'Button' } })
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