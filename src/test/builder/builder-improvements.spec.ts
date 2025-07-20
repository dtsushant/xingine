import { 
  LayoutComponentDetailBuilder, 
  EventBindingsBuilder, 
  StyleMetaBuilder, 
  ChartConfigBuilder 
} from '../../core/builder';
import { InputMeta, ChartMeta } from '../../core/component';
import { WrapperMeta } from '../../core/xingine.type';

describe('Builder Improvements', () => {
  
  describe('InputRenderer Icon Support', () => {
    it('should support icon in InputRenderer', () => {
      const result = LayoutComponentDetailBuilder.create()
        .input()
        .name('searchInput')
        .placeholder('Search...')
        .icon({ name: 'search', size: 16 })
        .build();

      expect(result.meta?.component).toBe('InputRenderer');
      const properties = result.meta?.properties as InputMeta;
      expect(properties.name).toBe('searchInput');
      expect(properties.placeholder).toBe('Search...');
      expect(properties.icon).toEqual({ name: 'search', size: 16 });
    });
  });

  describe('Required Properties Validation', () => {
    it('should throw error when InputRenderer name is not provided', () => {
      expect(() => {
        LayoutComponentDetailBuilder.create()
          .input()
          .placeholder('Enter text...')
          .build();
      }).toThrow('Input name is required. Use .name(value) to set it.');
    });

    it('should throw error when InputRenderer name is not provided in end()', () => {
      expect(() => {
        LayoutComponentDetailBuilder.create()
          .input()
          .placeholder('Enter text...')
          .end();
      }).toThrow('Input name is required. Use .name(value) to set it.');
    });

    it('should work when InputRenderer name is provided', () => {
      const result = LayoutComponentDetailBuilder.create()
        .input()
        .name('validInput')
        .placeholder('Enter text...')
        .build();

      expect(result.meta?.component).toBe('InputRenderer');
      const properties = result.meta?.properties as InputMeta;
      expect(properties.name).toBe('validInput');
    });
  });

  describe('EventBindingsBuilder', () => {
    it('should create EventBindings with fluent API', () => {
      const eventBindings = EventBindingsBuilder.create()
        .onClick('handleClick')
        .onSubmit('handleSubmit')
        .onChange('handleChange')
        .onFocus('handleFocus')
        .onBlur('handleBlur')
        .onKeyDown('handleKeyDown')
        .onKeyUp('handleKeyUp')
        .onHover('handleHover')
        .onInit('handleInit')
        .onInput('handleInput')
        .onClear('handleClear')
        .build();

      expect(eventBindings).toEqual({
        onClick: 'handleClick',
        onSubmit: 'handleSubmit',
        onChange: 'handleChange',
        onFocus: 'handleFocus',
        onBlur: 'handleBlur',
        onKeyDown: 'handleKeyDown',
        onKeyUp: 'handleKeyUp',
        onHover: 'handleHover',
        onInit: 'handleInit',
        onInput: 'handleInput',
        onClear: 'handleClear'
      });
    });

    it('should work with SerializableAction objects', () => {
      const eventBindings = EventBindingsBuilder.create()
        .onClick({ action: 'setState', args: { key: 'isClicked', value: true } })
        .onSubmit({ action: 'navigate', args: { path: '/success' } })
        .build();

      expect(eventBindings.onClick).toEqual({
        action: 'setState',
        args: { key: 'isClicked', value: true }
      });
      expect(eventBindings.onSubmit).toEqual({
        action: 'navigate',
        args: { path: '/success' }
      });
    });
  });

  describe('StyleMetaBuilder', () => {
    it('should create StyleMeta with fluent API', () => {
      const styleMeta = StyleMetaBuilder.create()
        .className('my-class')
        .width(100)
        .height('50px')
        .margin('10px')
        .padding('5px')
        .backgroundColor('blue')
        .color('white')
        .fontSize(14)
        .display('flex')
        .flexDirection('row')
        .justifyContent('center')
        .alignItems('center')
        .build();

      expect(styleMeta.className).toBe('my-class');
      expect(styleMeta.style).toEqual({
        width: 100,
        height: '50px',
        margin: '10px',
        padding: '5px',
        backgroundColor: 'blue',
        color: 'white',
        fontSize: 14,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      });
    });

    it('should support addClass method', () => {
      const styleMeta = StyleMetaBuilder.create()
        .className('base-class')
        .addClass('additional-class')
        .addClass('another-class')
        .build();

      expect(styleMeta.className).toBe('base-class additional-class another-class');
    });

    it('should support setStyleProperty method', () => {
      const styleMeta = StyleMetaBuilder.create()
        .setStyleProperty('customProp', 'customValue')
        .setStyleProperty('anotherProp', 123)
        .build();

      expect(styleMeta.style).toEqual({
        customProp: 'customValue',
        anotherProp: 123
      });
    });
  });

  describe('ChartConfigBuilder', () => {
    it('should create ChartConfig safely', () => {
      const chartRenderer = LayoutComponentDetailBuilder.create()
        .chart()
        .chartBuilder()
        .type('bar')
        .title('Sales Data')
        .width(400)
        .height(300)
        .labels(['Jan', 'Feb', 'Mar'])
        .addDataset({
          label: 'Sales',
          data: [100, 200, 300],
          backgroundColor: 'blue'
        })
        .addDataset({
          label: 'Profit',
          data: [50, 100, 150],
          backgroundColor: 'green'
        })
        .options({ responsive: true })
        .dataSourceUrl('/api/chart-data')
        .build()
        .build();

      expect(chartRenderer.meta?.component).toBe('ChartRenderer');
      const properties = chartRenderer.meta?.properties as ChartMeta;
      expect(properties.charts).toHaveLength(1);
      
      const chart = properties.charts[0];
      expect(chart.type).toBe('bar');
      expect(chart.title).toBe('Sales Data');
      expect(chart.width).toBe(400);
      expect(chart.height).toBe(300);
      expect(chart.labels).toEqual(['Jan', 'Feb', 'Mar']);
      expect(chart.datasets).toHaveLength(2);
      expect(chart.datasets?.[0].label).toBe('Sales');
      expect(chart.datasets?.[1].label).toBe('Profit');
      expect(chart.options).toEqual({ responsive: true });
      expect(chart.dataSourceUrl).toBe('/api/chart-data');
    });

    it('should throw error when chart type is not provided', () => {
      expect(() => {
        LayoutComponentDetailBuilder.create()
          .chart()
          .chartBuilder()
          .title('No Type Chart')
          .build();
      }).toThrow('Chart type is required. Use .type(value) to set it.');
    });

    it('should work with different chart types', () => {
      const pieChart = LayoutComponentDetailBuilder.create()
        .chart()
        .chartBuilder()
        .type('pie')
        .title('Distribution')
        .build()
        .build();

      const pieProperties = pieChart.meta?.properties as ChartMeta;
      expect(pieProperties.charts[0].type).toBe('pie');

      const lineChart = LayoutComponentDetailBuilder.create()
        .chart()
        .chartBuilder()
        .type('line')
        .title('Trends')
        .build()
        .build();

      const lineProperties = lineChart.meta?.properties as ChartMeta;
      expect(lineProperties.charts[0].type).toBe('line');
    });
  });

  describe('Integration with Existing Components', () => {
    it('should work with wrapper containing input with icon', () => {
      const wrapper = LayoutComponentDetailBuilder.create()
        .wrapper()
        .className('input-container')
        .addChild(
          LayoutComponentDetailBuilder.create()
            .input()
            .name('searchInput')
            .placeholder('Search...')
            .icon({ name: 'search', size: 16 })
            .className('search-input')
            .build()
        )
        .build();

      expect(wrapper.meta?.component).toBe('WrapperRenderer');
      const properties = wrapper.meta?.properties as WrapperMeta;
      expect(properties.children).toHaveLength(1);
      
      const inputChild = properties.children?.[0];
      expect(inputChild?.meta?.component).toBe('InputRenderer');
      const inputProperties = inputChild?.meta?.properties as InputMeta;
      expect(inputProperties.name).toBe('searchInput');
      expect(inputProperties.icon).toEqual({ name: 'search', size: 16 });
    });

    it('should work with complex chart configurations', () => {
      const dashboard = LayoutComponentDetailBuilder.create()
        .wrapper()
        .className('dashboard')
        .addChild(
          LayoutComponentDetailBuilder.create()
            .chart()
            .chartBuilder()
            .type('bar')
            .title('Monthly Sales')
            .width(600)
            .height(400)
            .labels(['Jan', 'Feb', 'Mar', 'Apr', 'May'])
            .addDataset({
              label: 'Revenue',
              data: [1000, 1500, 1200, 1800, 2000],
              backgroundColor: '#4CAF50'
            })
            .addDataset({
              label: 'Profit',
              data: [300, 450, 360, 540, 600],
              backgroundColor: '#2196F3'
            })
            .options({
              responsive: true,
              plugins: {
                legend: {
                  position: 'top'
                }
              }
            })
            .build()
            .build()
        )
        .build();

      expect(dashboard.meta?.component).toBe('WrapperRenderer');
      const dashboardProperties = dashboard.meta?.properties as WrapperMeta;
      expect(dashboardProperties.children).toHaveLength(1);
      
      const chartChild = dashboardProperties.children?.[0];
      expect(chartChild?.meta?.component).toBe('ChartRenderer');
      const chartProperties = chartChild?.meta?.properties as ChartMeta;
      expect(chartProperties.charts).toHaveLength(1);
      
      const chart = chartProperties.charts[0];
      expect(chart.type).toBe('bar');
      expect(chart.datasets).toHaveLength(2);
      expect(chart.datasets?.[0].label).toBe('Revenue');
      expect(chart.datasets?.[1].label).toBe('Profit');
    });
  });
});