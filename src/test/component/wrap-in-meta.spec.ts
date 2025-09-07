import { WrapInMeta, WrapInMetaBuilder, WrapInMetaUtils, validateWrapInMeta } from '../../../src/core/component/wrap-in-meta';
import { StyleMeta } from '../../../src/core/expressions/style';
import { EventBindings } from '../../../src/core/expressions';

describe('WrapInMeta', () => {
  describe('validateWrapInMeta', () => {
    it('should validate a valid WrapInMeta object', () => {
      const meta: WrapInMeta = {
        wrapWith: 'div',
        style: { className: 'test-class' },
        event: { onClick: { action: 'test' } }
      };

      expect(validateWrapInMeta(meta)).toBe(true);
    });

    it('should invalidate WrapInMeta without wrapWith', () => {
      const meta = {
        style: { className: 'test-class' }
      } as WrapInMeta;

      expect(validateWrapInMeta(meta)).toBe(false);
    });

    it('should invalidate WrapInMeta with invalid wrapWith element', () => {
      const meta = {
        wrapWith: 'invalid-element' as any,
        style: { className: 'test-class' }
      };

      expect(validateWrapInMeta(meta)).toBe(false);
    });

    it('should validate recursive wrapping', () => {
      const meta: WrapInMeta = {
        wrapWith: 'div',
        wrap: {
          wrapWith: 'section',
          style: { className: 'inner-section' }
        }
      };

      expect(validateWrapInMeta(meta)).toBe(true);
    });

    it('should invalidate recursive wrapping with invalid inner element', () => {
      const meta: WrapInMeta = {
        wrapWith: 'div',
        wrap: {
          wrapWith: 'invalid' as any,
          style: { className: 'inner-section' }
        }
      };

      expect(validateWrapInMeta(meta)).toBe(false);
    });
  });

  describe('WrapInMetaBuilder', () => {
    it('should create a basic WrapInMeta with default div', () => {
      const builder = WrapInMetaBuilder.create();
      const result = builder.build();

      expect(result.wrapWith).toBe('div');
      expect(validateWrapInMeta(result)).toBe(true);
    });

    it('should create a WrapInMeta with specified element', () => {
      const builder = WrapInMetaBuilder.create('section');
      const result = builder.build();

      expect(result.wrapWith).toBe('section');
      expect(validateWrapInMeta(result)).toBe(true);
    });

    it('should set style properties', () => {
      const style: StyleMeta = {
        className: 'test-wrapper',
        style: { backgroundColor: 'blue' }
      };

      const result = WrapInMetaBuilder.create()
        .style(style)
        .build();

      expect(result.style).toEqual(style);
    });

    it('should set className separately', () => {
      const result = WrapInMetaBuilder.create()
        .className('test-class')
        .build();

      expect(result.style?.className).toBe('test-class');
    });

    it('should set CSS styles separately', () => {
      const cssStyle = { color: 'red', fontSize: '16px' };

      const result = WrapInMetaBuilder.create()
        .cssStyle(cssStyle)
        .build();

      expect(result.style?.style).toEqual(cssStyle);
    });

    it('should set event bindings', () => {
      const eventBindings: EventBindings = {
        onClick: { action: 'handleClick' },
        onHover: { action: 'handleHover' }
      };

      const result = WrapInMetaBuilder.create()
        .event(eventBindings)
        .build();

      expect(result.event).toEqual(eventBindings);
    });

    it('should set onClick binding separately', () => {
      const onClick = { action: 'handleClick', args: { key: 'value' } };

      const result = WrapInMetaBuilder.create()
        .onClick(onClick)
        .build();

      expect(result.event?.onClick).toEqual(onClick);
    });

    it('should set HTML attributes', () => {
      const attributes = {
        id: 'test-id',
        'data-test': 'test-value',
        'aria-label': 'Test Label'
      };

      const result = WrapInMetaBuilder.create()
        .attributes(attributes)
        .build();

      expect(result.htmlAttributes).toEqual(attributes);
    });

    it('should set individual HTML attribute', () => {
      const result = WrapInMetaBuilder.create()
        .attribute('id', 'test-id')
        .attribute('data-test', 'test-value')
        .build();

      expect(result.htmlAttributes).toEqual({
        id: 'test-id',
        'data-test': 'test-value'
      });
    });

    it('should set recursive wrapping', () => {
      const innerWrap: WrapInMeta = {
        wrapWith: 'article',
        style: { className: 'inner-article' }
      };

      const result = WrapInMetaBuilder.create('section')
        .wrap(innerWrap)
        .build();

      expect(result.wrapWith).toBe('section');
      expect(result.wrap).toEqual(innerWrap);
    });

    it('should set recursive wrapping with element type', () => {
      const result = WrapInMetaBuilder.create('div')
        .wrapWithElement('header')
        .build();

      expect(result.wrapWith).toBe('div');
      expect(result.wrap?.wrapWith).toBe('header');
    });

    it('should set recursive wrapping with builder function', () => {
      const result = WrapInMetaBuilder.create('main')
        .wrapWithBuilder(builder =>
          builder
            .wrapWith('section')
            .className('inner-section')
            .attribute('data-inner', 'true')
        )
        .build();

      expect(result.wrapWith).toBe('main');
      expect(result.wrap?.wrapWith).toBe('section');
      expect(result.wrap?.style?.className).toBe('inner-section');
      expect(result.wrap?.htmlAttributes?.['data-inner']).toBe('true');
    });

    it('should set custom properties', () => {
      const result = WrapInMetaBuilder.create()
        .property('customProp', 'customValue')
        .properties({ prop1: 'value1', prop2: 'value2' })
        .build();

      expect(result.customProp).toBe('customValue');
      expect(result.prop1).toBe('value1');
      expect(result.prop2).toBe('value2');
    });

    it('should create builder from existing meta', () => {
      const existingMeta: WrapInMeta = {
        wrapWith: 'article',
        style: { className: 'existing-class' },
        event: { onClick: { action: 'existing-action' } }
      };

      const result = WrapInMetaBuilder.fromMeta(existingMeta)
        .className('modified-class')
        .build();

      expect(result.wrapWith).toBe('article');
      expect(result.style?.className).toBe('modified-class');
      expect(result.event?.onClick).toEqual({ action: 'existing-action' });
    });

    it('should throw error for invalid configuration', () => {
      const builder = WrapInMetaBuilder.create();
      (builder as any).meta.wrapWith = 'invalid-element';

      expect(() => builder.build()).toThrow('Invalid WrapInMeta configuration');
    });
  });

  describe('WrapInMetaUtils', () => {
    it('should detect if meta has wrapIn', () => {
      const metaWithWrapIn = {
        name: 'test',
        wrapIn: { wrapWith: 'div' as const }
      };

      const metaWithoutWrapIn = {
        name: 'test'
      };

      expect(WrapInMetaUtils.hasWrapIn(metaWithWrapIn)).toBe(true);
      expect(WrapInMetaUtils.hasWrapIn(metaWithoutWrapIn)).toBe(false);
      expect(WrapInMetaUtils.hasWrapIn(null)).toBe(false);
      expect(WrapInMetaUtils.hasWrapIn(undefined)).toBe(false);
    });

    it('should get wrapIn configuration', () => {
      const wrapIn: WrapInMeta = { wrapWith: 'section' };
      const metaWithWrapIn = {
        name: 'test',
        wrapIn
      };

      const metaWithoutWrapIn = {
        name: 'test'
      };

      expect(WrapInMetaUtils.getWrapIn(metaWithWrapIn)).toEqual(wrapIn);
      expect(WrapInMetaUtils.getWrapIn(metaWithoutWrapIn)).toBeNull();
    });

    it('should add wrapIn to meta', () => {
      const originalMeta = { name: 'test', value: 'original' };
      const wrapIn: WrapInMeta = { wrapWith: 'div' };

      const result = WrapInMetaUtils.withWrapIn(originalMeta, wrapIn);

      expect(result).toEqual({
        name: 'test',
        value: 'original',
        wrapIn
      });
      expect(result).not.toBe(originalMeta); // Should be a new object
    });

    it('should remove wrapIn from meta', () => {
      const metaWithWrapIn = {
        name: 'test',
        value: 'original',
        wrapIn: { wrapWith: 'div' as const }
      };

      const result = WrapInMetaUtils.withoutWrapIn(metaWithWrapIn);

      expect(result).toEqual({
        name: 'test',
        value: 'original'
      });
      expect('wrapIn' in result).toBe(false);
    });

    it('should merge wrapIn configurations', () => {
      const outer: WrapInMeta = {
        wrapWith: 'div',
        style: { className: 'outer' }
      };

      const inner: WrapInMeta = {
        wrapWith: 'section',
        style: { className: 'inner' }
      };

      const result = WrapInMetaUtils.mergeWrapIn(outer, inner);

      expect(result.wrapWith).toBe('div');
      expect(result.style?.className).toBe('outer');
      expect(result.wrap).toEqual(inner);
    });
  });

  describe('Integration with other types', () => {
    it('should work with StyleMeta', () => {
      const styleMeta: StyleMeta = {
        className: 'test-class #{dynamic}',
        style: {
          backgroundColor: 'blue',
          padding: '10px'
        }
      };

      const result = WrapInMetaBuilder.create('section')
        .style(styleMeta)
        .build();

      expect(result.style).toEqual(styleMeta);
    });

    it('should work with EventBindings', () => {
      const eventBindings: EventBindings = {
        onClick: {
          action: 'navigate',
          args: { to: '/home' }
        },
        onSubmit: {
          action: 'submitForm',
          then: [
            { action: 'showSuccess' },
            { action: 'redirect', args: { to: '/success' } }
          ]
        }
      };

      const result = WrapInMetaBuilder.create('div')
        .event(eventBindings)
        .build();

      expect(result.event).toEqual(eventBindings);
    });

    it('should support complex nested structures', () => {
      const result = WrapInMetaBuilder.create('main')
        .className('main-container')
        .wrapWithBuilder(sectionBuilder =>
          sectionBuilder
            .wrapWith('section')
            .className('content-section')
            .wrapWithBuilder(articleBuilder =>
              articleBuilder
                .wrapWith('article')
                .className('article-content')
                .attribute('data-type', 'blog-post')
            )
        )
        .build();

      expect(result.wrapWith).toBe('main');
      expect(result.style?.className).toBe('main-container');
      expect(result.wrap?.wrapWith).toBe('section');
      expect(result.wrap?.style?.className).toBe('content-section');
      expect(result.wrap?.wrap?.wrapWith).toBe('article');
      expect(result.wrap?.wrap?.style?.className).toBe('article-content');
      expect(result.wrap?.wrap?.htmlAttributes?.['data-type']).toBe('blog-post');
    });
  });
});
