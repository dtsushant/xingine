import { ConditionalMetaBuilder, IconMetaBuilder, ButtonMetaBuilder } from '../../../src/core/builder/meta-builders';
import { WrapInMeta } from '../../../src/core/component/wrap-in-meta';

describe('Core Meta Builders with WrapIn Support', () => {
  const testWrapIn: WrapInMeta = {
    wrapWith: 'section',
    style: { className: 'test-wrapper' },
    htmlAttributes: { 'data-test': 'true' }
  };

  describe('ConditionalMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = ConditionalMetaBuilder.create()
        .condition({ field: 'test', operator: 'eq', value: true })
        .trueComponent({ name: 'test' })
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
    });

    it('should support wrapInMeta builder method', () => {
      const result = ConditionalMetaBuilder.create()
        .condition({ field: 'test', operator: 'eq', value: true })
        .trueComponent({ name: 'test' })
        .wrapInMeta(builder =>
          builder
            .wrapWith('article')
            .className('conditional-wrapper')
            .attribute('data-conditional', 'true')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('article');
      expect(result.wrapIn?.style?.className).toBe('conditional-wrapper');
      expect(result.wrapIn?.htmlAttributes?.['data-conditional']).toBe('true');
    });
  });

  describe('IconMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = IconMetaBuilder.create()
        .name('home')
        .color('blue')
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.name).toBe('home');
    });

    it('should support wrapInMeta builder method', () => {
      const result = IconMetaBuilder.create()
        .name('user')
        .wrapInMeta(builder =>
          builder
            .wrapWith('span')
            .className('icon-wrapper')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('span');
      expect(result.wrapIn?.style?.className).toBe('icon-wrapper');
    });
  });

  describe('ButtonMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = ButtonMetaBuilder.create()
        .name('submit-btn')
        .content('Submit')
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.name).toBe('submit-btn');
    });

    it('should support wrapInMeta builder method', () => {
      const result = ButtonMetaBuilder.create()
        .name('cancel-btn')
        .content('Cancel')
        .wrapInMeta(builder =>
          builder
            .wrapWith('div')
            .className('button-wrapper')
            .onClick({ action: 'cancel' })
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('div');
      expect(result.wrapIn?.style?.className).toBe('button-wrapper');
      expect(result.wrapIn?.event?.onClick).toEqual({ action: 'cancel' });
    });
  });
});
