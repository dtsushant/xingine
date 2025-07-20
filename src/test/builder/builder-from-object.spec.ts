import { 
  LayoutComponentDetailBuilder, 
  LayoutRendererBuilder
} from '../../core/builder';
import { LayoutComponentDetail, LayoutRenderer } from '../../core/xingine.type';

describe('Builder fromObject Methods', () => {
  describe('LayoutComponentDetailBuilder', () => {
    it('should create builder from existing LayoutComponentDetail object', () => {
      const existingDetail: LayoutComponentDetail = {
        meta: {
          component: 'ButtonRenderer',
          properties: {
            name: 'existingButton',
            content: 'Click me',
            style: {
              className: 'btn-primary'
            }
          }
        }
      };

      const builder = LayoutComponentDetailBuilder.fromLayoutComponentDetail(existingDetail);
      const result = builder.build();

      expect(result.meta?.component).toBe('ButtonRenderer');
      expect((result.meta?.properties as any).name).toBe('existingButton');
      expect((result.meta?.properties as any).content).toBe('Click me');
    });

    it('should modify existing object using fromObject method', () => {
      const existingDetail: LayoutComponentDetail = {
        meta: {
          component: 'InputRenderer', 
          properties: {
            name: 'existingInput',
            placeholder: 'Enter text'
          }
        }
      };

      const result = LayoutComponentDetailBuilder.create()
        .fromObject(existingDetail)
        .build();

      expect(result.meta?.component).toBe('InputRenderer');
      expect((result.meta?.properties as any).name).toBe('existingInput');
    });

    it('should support component builders fromMeta methods', () => {
      const buttonMeta = {
        name: 'testButton',
        content: 'Test Button',
        style: { className: 'test-btn' }
      };

      const result = LayoutComponentDetailBuilder.create()
        .button()
        .fromButtonMeta(buttonMeta)
        .build();

      expect(result.meta?.component).toBe('ButtonRenderer');
      expect((result.meta?.properties as any).name).toBe('testButton');
      expect((result.meta?.properties as any).content).toBe('Test Button');
      expect((result.meta?.properties as any).style?.className).toBe('test-btn');
    });

    it('should support input builder fromInputMeta method', () => {
      const inputMeta = {
        name: 'testInput',
        placeholder: 'Test placeholder',
        icon: { name: 'UserOutlined', size: 16 }
      };

      const result = LayoutComponentDetailBuilder.create()
        .input()
        .fromInputMeta(inputMeta)
        .build();

      expect(result.meta?.component).toBe('InputRenderer');
      expect((result.meta?.properties as any).name).toBe('testInput');
      expect((result.meta?.properties as any).placeholder).toBe('Test placeholder');
      expect((result.meta?.properties as any).icon?.name).toBe('UserOutlined');
    });

    it('should support form builder fromFormMeta method', () => {
      const formMeta = {
        action: '/test-submit',
        fields: [
          { label: 'Name', inputType: 'input' as any },
          { label: 'Email', inputType: 'input' as any }
        ]
      };

      const result = LayoutComponentDetailBuilder.create()
        .form()
        .fromFormMeta(formMeta)
        .build();

      expect(result.meta?.component).toBe('FormRenderer');
      expect((result.meta?.properties as any).action).toBe('/test-submit');
      expect((result.meta?.properties as any).fields).toHaveLength(2);
    });

    it('should support wrapper builder fromWrapperMeta method', () => {
      const wrapperMeta = {
        content: 'Wrapper content',
        style: { className: 'wrapper-class' },
        children: [
          { meta: { component: 'ButtonRenderer', properties: { name: 'child1' } } }
        ]
      };

      const result = LayoutComponentDetailBuilder.create()
        .wrapper()
        .fromWrapperMeta(wrapperMeta)
        .build();

      expect(result.meta?.component).toBe('WrapperRenderer');
      expect((result.meta?.properties as any).content).toBe('Wrapper content');
      expect((result.meta?.properties as any).children).toHaveLength(1);
    });
  });

  describe('LayoutRendererBuilder', () => {
    it('should create builder from existing LayoutRenderer object', () => {
      const existingRenderer: LayoutRenderer = {
        type: 'tailwind',
        header: {
          style: { className: 'header-class' },
          meta: {
            meta: {
              component: 'WrapperRenderer',
              properties: { content: 'Header content' }
            }
          }
        },
        content: {
          style: { className: 'content-class' },
          meta: [{
            path: '/main-content',
            meta: {
              component: 'WrapperRenderer',
              properties: { content: 'Main content' }
            }
          }]
        }
      };

      const builder = LayoutRendererBuilder.fromLayoutRenderer(existingRenderer);
      const result = builder.build();

      expect(result.type).toBe('tailwind');
      expect(result.header?.style?.className).toBe('header-class');
      expect(result.content.style?.className).toBe('content-class');
    });

    it('should modify existing object using fromObject method', () => {
      const existingRenderer: LayoutRenderer = {
        type: 'default',
        content: {
          meta: [{
            path: '/original-content',
            meta: {
              component: 'WrapperRenderer',
              properties: { content: 'Original content' }
            }
          }]
        }
      };

      const result = LayoutRendererBuilder.create()
        .fromObject(existingRenderer)
        .type('modified')
        .build();

      expect(result.type).toBe('modified');
      expect((result.content.meta[0].meta?.properties as any)?.content).toBe('Original content');
    });
  });
});