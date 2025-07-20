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
  ChartConfigMetaBuilder
} from '../../core/builder/meta-builders';

describe('Meta Builders', () => {
  describe('ConditionalMetaBuilder', () => {
    it('should build a valid ConditionalMeta', () => {
      const conditionalMeta = ConditionalMetaBuilder.create()
        .condition({ field: 'isVisible', operator: 'eq', value: true })
        .trueComponent({ meta: { component: 'ButtonRenderer', properties: { name: 'showButton' } } })
        .falseComponent({ meta: { component: 'InputRenderer', properties: { name: 'hideInput' } } })
        .build();

      expect((conditionalMeta.condition as any).field).toBe('isVisible');
      expect((conditionalMeta.condition as any).operator).toBe('eq');
      expect((conditionalMeta.condition as any).value).toBe(true);
      expect(conditionalMeta.trueComponent).toBeDefined();
      expect(conditionalMeta.falseComponent).toBeDefined();
    });

    it('should support custom properties', () => {
      const conditionalMeta = ConditionalMetaBuilder.create()
        .condition({ field: 'status', operator: 'eq', value: 'active' })
        .trueComponent({})
        .property('customProperty', 'customValue')
        .build();

      expect(conditionalMeta.customProperty).toBe('customValue');
    });
  });

  describe('IconMetaBuilder', () => {
    it('should build a valid IconMeta', () => {
      const iconMeta = IconMetaBuilder.create()
        .name('UserOutlined')
        .color('#123456')
        .size(24)
        .spin(true)
        .rotate(90)
        .twoToneColor('#abc')
        .build();

      expect(iconMeta.name).toBe('UserOutlined');
      expect(iconMeta.color).toBe('#123456');
      expect(iconMeta.size).toBe(24);
      expect(iconMeta.spin).toBe(true);
      expect(iconMeta.rotate).toBe(90);
      expect(iconMeta.twoToneColor).toBe('#abc');
    });

    it('should support style and event properties', () => {
      const iconMeta = IconMetaBuilder.create()
        .name('HeartOutlined')
        .style({ className: 'icon-style' })
        .event({ onClick: 'handleIconClick' })
        .build();

      expect(iconMeta.style?.className).toBe('icon-style');
      expect(iconMeta.event?.onClick).toBe('handleIconClick');
    });
  });

  describe('ButtonMetaBuilder', () => {
    it('should build a valid ButtonMeta with required name', () => {
      const buttonMeta = ButtonMetaBuilder.create()
        .name('submitButton')
        .content('Submit')
        .build();

      expect(buttonMeta.name).toBe('submitButton');
      expect(buttonMeta.content).toBe('Submit');
    });

    it('should throw error when name is not provided', () => {
      expect(() => {
        ButtonMetaBuilder.create().content('Submit').build();
      }).toThrow('Button name is required');
    });

    it('should support icon content', () => {
      const iconContent = { name: 'SaveOutlined', color: 'blue' };
      const buttonMeta = ButtonMetaBuilder.create()
        .name('saveButton')
        .content(iconContent)
        .build();

      expect(buttonMeta.content).toEqual(iconContent);
    });
  });

  describe('InputMetaBuilder', () => {
    it('should build a valid InputMeta with required name', () => {
      const inputMeta = InputMetaBuilder.create()
        .name('username')
        .placeholder('Enter username')
        .build();

      expect(inputMeta.name).toBe('username');
      expect(inputMeta.placeholder).toBe('Enter username');
    });

    it('should throw error when name is not provided', () => {
      expect(() => {
        InputMetaBuilder.create().placeholder('Enter text').build();
      }).toThrow('Input name is required');
    });

    it('should support icon', () => {
      const icon = { name: 'UserOutlined', size: 16 };
      const inputMeta = InputMetaBuilder.create()
        .name('userInput')
        .icon(icon)
        .build();

      expect(inputMeta.icon).toEqual(icon);
    });
  });

  describe('WrapperMetaBuilder', () => {
    it('should build a valid WrapperMeta', () => {
      const wrapperMeta = WrapperMetaBuilder.create()
        .content('Container content')
        .style({ className: 'wrapper-class' })
        .children([])
        .build();

      expect(wrapperMeta.content).toBe('Container content');
      expect(wrapperMeta.style?.className).toBe('wrapper-class');
      expect(wrapperMeta.children).toEqual([]);
    });

    it('should support adding children', () => {
      const child1 = { meta: { component: 'ButtonRenderer', properties: { name: 'button1' } } };
      const child2 = { meta: { component: 'InputRenderer', properties: { name: 'input1' } } };

      const wrapperMeta = WrapperMetaBuilder.create()
        .addChild(child1)
        .addChild(child2)
        .build();

      expect(wrapperMeta.children).toHaveLength(2);
      expect(wrapperMeta.children?.[0]).toEqual(child1);
      expect(wrapperMeta.children?.[1]).toEqual(child2);
    });
  });

  describe('FormMetaBuilder', () => {
    it('should build a valid FormMeta with required action', () => {
      const formMeta = FormMetaBuilder.create()
        .action('/submit-form')
        .fields([])
        .build();

      expect(formMeta.action).toBe('/submit-form');
      expect(formMeta.fields).toEqual([]);
    });

    it('should throw error when action is not provided', () => {
      expect(() => {
        FormMetaBuilder.create().fields([]).build();
      }).toThrow('Form action is required');
    });

    it('should support adding fields', () => {
      const field1 = { label: 'Name', inputType: 'input' as any };
      const field2 = { label: 'Email', inputType: 'input' as any };

      const formMeta = FormMetaBuilder.create()
        .action('/submit')
        .addField(field1)
        .addField(field2)
        .build();

      expect(formMeta.fields).toHaveLength(2);
      expect(formMeta.fields[0]).toEqual(field1);
      expect(formMeta.fields[1]).toEqual(field2);
    });
  });

  describe('DetailMetaBuilder', () => {
    it('should build a valid DetailMeta with required action', () => {
      const detailMeta = DetailMetaBuilder.create()
        .action('/detail-action')
        .fields([])
        .build();

      expect(detailMeta.action).toBe('/detail-action');
      expect(detailMeta.fields).toEqual([]);
    });

    it('should throw error when action is not provided', () => {
      expect(() => {
        DetailMetaBuilder.create().fields([]).build();
      }).toThrow('Detail action is required');
    });
  });

  describe('TableMetaBuilder', () => {
    it('should build a valid TableMeta with required dataSourceUrl', () => {
      const tableMeta = TableMetaBuilder.create()
        .dataSourceUrl('/api/data')
        .columns([])
        .build();

      expect(tableMeta.dataSourceUrl).toBe('/api/data');
      expect(tableMeta.columns).toEqual([]);
    });

    it('should throw error when dataSourceUrl is not provided', () => {
      expect(() => {
        TableMetaBuilder.create().columns([]).build();
      }).toThrow('Table dataSourceUrl is required');
    });

    it('should support adding columns', () => {
      const column1 = { title: 'Name', dataIndex: 'name', key: 'name' };
      const column2 = { title: 'Age', dataIndex: 'age', key: 'age' };

      const tableMeta = TableMetaBuilder.create()
        .dataSourceUrl('/api/users')
        .addColumn(column1)
        .addColumn(column2)
        .build();

      expect(tableMeta.columns).toHaveLength(2);
      expect(tableMeta.columns[0]).toEqual(column1);
      expect(tableMeta.columns[1]).toEqual(column2);
    });
  });

  describe('ChartMetaBuilder', () => {
    it('should build a valid ChartMeta', () => {
      const chartMeta = ChartMetaBuilder.create()
        .charts([])
        .build();

      expect(chartMeta.charts).toEqual([]);
    });

    it('should support adding charts', () => {
      const chart1 = { type: 'bar' as any, title: 'Sales Chart' };
      const chart2 = { type: 'line' as any, title: 'Trend Chart' };

      const chartMeta = ChartMetaBuilder.create()
        .addChart(chart1)
        .addChart(chart2)
        .build();

      expect(chartMeta.charts).toHaveLength(2);
      expect(chartMeta.charts[0]).toEqual(chart1);
      expect(chartMeta.charts[1]).toEqual(chart2);
    });
  });

  describe('ChartConfigMetaBuilder', () => {
    it('should build a valid ChartConfig with required type', () => {
      const chartConfig = ChartConfigMetaBuilder.create()
        .type('bar')
        .title('Sales Chart')
        .build();

      expect(chartConfig.type).toBe('bar');
      expect(chartConfig.title).toBe('Sales Chart');
    });

    it('should throw error when type is not provided', () => {
      expect(() => {
        ChartConfigMetaBuilder.create().title('Chart').build();
      }).toThrow('Chart type is required');
    });

    it('should support adding datasets', () => {
      const dataset1 = { label: 'Dataset 1', data: [1, 2, 3] };
      const dataset2 = { label: 'Dataset 2', data: [4, 5, 6] };

      const chartConfig = ChartConfigMetaBuilder.create()
        .type('line')
        .addDataset(dataset1)
        .addDataset(dataset2)
        .build();

      expect(chartConfig.datasets).toHaveLength(2);
      expect(chartConfig.datasets?.[0]).toEqual(dataset1);
      expect(chartConfig.datasets?.[1]).toEqual(dataset2);
    });

    it('should support all configuration options', () => {
      const chartConfig = ChartConfigMetaBuilder.create()
        .type('pie')
        .title('Distribution Chart')
        .width(400)
        .height(300)
        .labels(['A', 'B', 'C'])
        .dataSourceUrl('/api/chart-data')
        .options({ responsive: true })
        .build();

      expect(chartConfig.width).toBe(400);
      expect(chartConfig.height).toBe(300);
      expect(chartConfig.labels).toEqual(['A', 'B', 'C']);
      expect(chartConfig.dataSourceUrl).toBe('/api/chart-data');
      expect(chartConfig.options).toEqual({ responsive: true });
    });
  });
});