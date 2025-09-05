import {
  ConditionalMetaBuilder,
  IconMetaBuilder,
  ButtonMetaBuilder,
  InputMetaBuilder,
  WrapperMetaBuilder,
  FormMetaBuilder,
  DetailMetaBuilder,
  TableMetaBuilder,
  ChartMetaBuilder,
  FieldMetaBuilder
} from '../../../src/core/builder/meta-builders';
import { WrapInMeta } from '../../../src/core/component/wrap-in-meta';

describe('Meta Builders with WrapIn Support', () => {
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

  describe('InputMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = InputMetaBuilder.create()
        .name('email')
        .placeholder('Enter email')
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.name).toBe('email');
    });

    it('should support wrapInMeta builder method', () => {
      const result = InputMetaBuilder.create()
        .name('password')
        .placeholder('Enter password')
        .wrapInMeta(builder =>
          builder
            .wrapWith('div')
            .className('input-wrapper')
            .attribute('data-field', 'password')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('div');
      expect(result.wrapIn?.style?.className).toBe('input-wrapper');
      expect(result.wrapIn?.htmlAttributes?.['data-field']).toBe('password');
    });
  });

  describe('WrapperMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = WrapperMetaBuilder.create()
        .content('Test content')
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.content).toBe('Test content');
    });

    it('should support wrapInMeta builder method', () => {
      const result = WrapperMetaBuilder.create()
        .content('Wrapped content')
        .wrapInMeta(builder =>
          builder
            .wrapWith('main')
            .className('main-wrapper')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('main');
      expect(result.wrapIn?.style?.className).toBe('main-wrapper');
    });
  });

  describe('FormMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = FormMetaBuilder.create()
        .action('/submit')
        .fields([])
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.action).toBe('/submit');
    });

    it('should support wrapInMeta builder method', () => {
      const result = FormMetaBuilder.create()
        .action('/create')
        .fields([])
        .wrapInMeta(builder =>
          builder
            .wrapWith('section')
            .className('form-wrapper')
            .attribute('data-form', 'create')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('section');
      expect(result.wrapIn?.style?.className).toBe('form-wrapper');
      expect(result.wrapIn?.htmlAttributes?.['data-form']).toBe('create');
    });
  });

  describe('DetailMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = DetailMetaBuilder.create()
        .action('/details')
        .fields([])
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.action).toBe('/details');
    });

    it('should support wrapInMeta builder method', () => {
      const result = DetailMetaBuilder.create()
        .action('/view')
        .fields([])
        .wrapInMeta(builder =>
          builder
            .wrapWith('article')
            .className('detail-wrapper')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('article');
      expect(result.wrapIn?.style?.className).toBe('detail-wrapper');
    });
  });

  describe('TableMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = TableMetaBuilder.create()
        .dataSourceUrl('/api/data')
        .columns([])
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.dataSourceUrl).toBe('/api/data');
    });

    it('should support wrapInMeta builder method', () => {
      const result = TableMetaBuilder.create()
        .dataSourceUrl('/api/users')
        .columns([])
        .wrapInMeta(builder =>
          builder
            .wrapWith('section')
            .className('table-wrapper')
            .attribute('data-table', 'users')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('section');
      expect(result.wrapIn?.style?.className).toBe('table-wrapper');
      expect(result.wrapIn?.htmlAttributes?.['data-table']).toBe('users');
    });
  });

  describe('ChartMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = ChartMetaBuilder.create()
        .charts([])
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.charts).toEqual([]);
    });

    it('should support wrapInMeta builder method', () => {
      const result = ChartMetaBuilder.create()
        .charts([])
        .wrapInMeta(builder =>
          builder
            .wrapWith('div')
            .className('chart-wrapper')
            .attribute('data-chart', 'dashboard')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('div');
      expect(result.wrapIn?.style?.className).toBe('chart-wrapper');
      expect(result.wrapIn?.htmlAttributes?.['data-chart']).toBe('dashboard');
    });
  });

  describe('FieldMetaBuilder', () => {
    it('should support withWrapIn method', () => {
      const result = FieldMetaBuilder.create()
        .name('username')
        .label('Username')
        .withWrapIn(testWrapIn)
        .build();

      expect(result.wrapIn).toEqual(testWrapIn);
      expect(result.name).toBe('username');
    });

    it('should support wrapInMeta builder method', () => {
      const result = FieldMetaBuilder.create()
        .name('email')
        .label('Email Address')
        .wrapInMeta(builder =>
          builder
            .wrapWith('div')
            .className('field-wrapper')
            .attribute('data-field-type', 'email')
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('div');
      expect(result.wrapIn?.style?.className).toBe('field-wrapper');
      expect(result.wrapIn?.htmlAttributes?.['data-field-type']).toBe('email');
    });

    it('should work with conditional rendering and wrapIn', () => {
      const result = FieldMetaBuilder.create()
        .name('phone')
        .label('Phone Number')
        .showWhenEquals('country', 'US')
        .wrapInMeta(builder =>
          builder
            .wrapWith('div')
            .className('conditional-field')
        )
        .build();

      expect(result.conditionalRender?.condition).toEqual({
        field: 'country',
        operator: 'eq',
        value: 'US'
      });
      expect(result.wrapIn?.wrapWith).toBe('div');
      expect(result.wrapIn?.style?.className).toBe('conditional-field');
    });
  });

  describe('Complex nesting scenarios', () => {
    it('should support recursive wrapping in builders', () => {
      const result = FormMetaBuilder.create()
        .action('/submit')
        .fields([])
        .wrapInMeta(outerBuilder =>
          outerBuilder
            .wrapWith('main')
            .className('form-container')
            .wrapWithBuilder(innerBuilder =>
              innerBuilder
                .wrapWith('section')
                .className('form-section')
                .attribute('data-form-section', 'primary')
            )
        )
        .build();

      expect(result.wrapIn?.wrapWith).toBe('main');
      expect(result.wrapIn?.style?.className).toBe('form-container');
      expect(result.wrapIn?.wrap?.wrapWith).toBe('section');
      expect(result.wrapIn?.wrap?.style?.className).toBe('form-section');
      expect(result.wrapIn?.wrap?.htmlAttributes?.['data-form-section']).toBe('primary');
    });

    it('should maintain builder functionality while adding wrapIn', () => {
      const result = TableMetaBuilder.create()
        .dataSourceUrl('/api/orders')
        .addColumn({ title: 'ID', dataIndex: 'id', key: 'id' })
        .addColumn({ title: 'Customer', dataIndex: 'customer', key: 'customer' })
        .rowKey('id')
        .handleRowClick({ action: 'viewOrder', args: { id: '#{id}' } })
        .wrapInMeta(builder =>
          builder
            .wrapWith('div')
            .className('table-container')
            .attribute('data-table-type', 'orders')
        )
        .build();

      expect(result.dataSourceUrl).toBe('/api/orders');
      expect(result.columns).toHaveLength(2);
      expect(result.rowKey).toBe('id');
      expect(result.handleRowClick).toEqual({ action: 'viewOrder', args: { id: '#{id}' } });
      expect(result.wrapIn?.wrapWith).toBe('div');
      expect(result.wrapIn?.style?.className).toBe('table-container');
      expect(result.wrapIn?.htmlAttributes?.['data-table-type']).toBe('orders');
    });
  });
});
