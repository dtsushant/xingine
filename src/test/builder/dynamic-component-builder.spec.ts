import { LayoutComponentDetailBuilder } from '../../core/builder';
import { LayoutComponentDetail } from '../../core/xingine.type';

describe('DynamicRendererBuilder', () => {
  
  it('should create a basic dynamic component', () => {
    const result = LayoutComponentDetailBuilder.create()
      .dynamic('CustomButton')
      .name('myCustomButton')
      .content('Custom Click Me')
      .className('custom-btn')
      .build();

    expect(result).toEqual({
      meta: {
        component: 'CustomButton',
        properties: {
          name: 'myCustomButton',
          content: 'Custom Click Me',
          style: {
            className: 'custom-btn'
          }
        }
      }
    });
  });

  it('should support custom properties via property method', () => {
    const result = LayoutComponentDetailBuilder.create()
      .dynamic('MyWidget')
      .name('widget1')
      .property('customField', 'customValue')
      .property('isEnabled', true)
      .property('config', { theme: 'dark', size: 'large' })
      .build();

    expect(result).toEqual({
      meta: {
        component: 'MyWidget',
        properties: {
          name: 'widget1',
          customField: 'customValue',
          isEnabled: true,
          config: { theme: 'dark', size: 'large' }
        }
      }
    });
  });

  it('should support batch property setting via setProperties', () => {
    const result = LayoutComponentDetailBuilder.create()
      .dynamic('DataTable')
      .setProperties({
        columns: ['id', 'name', 'email'],
        dataSource: '/api/users',
        pagination: true,
        sortable: true
      })
      .build();

    expect(result).toEqual({
      meta: {
        component: 'DataTable',
        properties: {
          columns: ['id', 'name', 'email'],
          dataSource: '/api/users',
          pagination: true,
          sortable: true
        }
      }
    });
  });

  it('should support event bindings', () => {
    const eventBindings = {
      onClick: 'handleCustomClick',
      onHover: 'handleCustomHover'
    };

    const result = LayoutComponentDetailBuilder.create()
      .dynamic('InteractiveComponent')
      .name('interactive1')
      .withEventBindings(eventBindings)
      .build();

    expect(result).toEqual({
      meta: {
        component: 'InteractiveComponent',
        properties: {
          name: 'interactive1',
          event: eventBindings
        }
      }
    });
  });

  it('should support style meta', () => {
    const styleMeta = {
      className: 'my-custom-style',
      backgroundColor: '#ff0000',
      fontSize: '16px'
    };

    const result = LayoutComponentDetailBuilder.create()
      .dynamic('StyledComponent')
      .name('styled1')
      .withStyleMeta(styleMeta)
      .build();

    expect(result).toEqual({
      meta: {
        component: 'StyledComponent',
        properties: {
          name: 'styled1',
          style: styleMeta
        }
      }
    });
  });

  it('should work with end() to return to parent builder', () => {
    const builder = LayoutComponentDetailBuilder.create()
      .dynamic('FirstComponent')
      .name('first')
      .end();

    // Should be able to chain another component
    const result = builder
      .dynamic('SecondComponent')
      .name('second')
      .build();

    expect(result).toEqual({
      meta: {
        component: 'SecondComponent',
        properties: {
          name: 'second'
        }
      }
    });
  });

  it('should support complex custom UI components defined by end users', () => {
    // Example: A custom chart component with user-defined properties
    const result = LayoutComponentDetailBuilder.create()
      .dynamic('AdvancedChartWidget')
      .setProperties({
        chartType: 'candlestick',
        dataEndpoint: '/api/stock-data',
        realTimeUpdates: true,
        indicators: ['RSI', 'MACD', 'BollingerBands'],
        theme: {
          primaryColor: '#2196F3',
          backgroundColor: '#fafafa',
          gridColor: '#e0e0e0'
        },
        interactions: {
          zoom: true,
          pan: true,
          crosshair: true
        }
      })
      .property('title', 'Stock Price Analysis')
      .property('height', 400)
      .className('advanced-chart-widget')
      .build();

    expect(result.meta?.component).toBe('AdvancedChartWidget');
    const properties = result.meta?.properties as Record<string, unknown>;
    expect(properties.chartType).toBe('candlestick');
    expect(properties.dataEndpoint).toBe('/api/stock-data');
    expect(properties.title).toBe('Stock Price Analysis');
    expect(properties.height).toBe(400);
    expect((properties.style as any)?.className).toBe('advanced-chart-widget');
    expect(properties.indicators).toEqual(['RSI', 'MACD', 'BollingerBands']);
  });

  it('should allow reusing existing component types with custom properties', () => {
    // User can create a ButtonRenderer with custom properties
    const result = LayoutComponentDetailBuilder.create()
      .dynamic('ButtonRenderer')
      .setProperties({
        name: 'customButton',
        content: 'My Button',
        customIcon: 'star',
        priority: 'high',
        analytics: {
          trackingId: 'btn_001',
          category: 'primary_actions'
        }
      })
      .build();

    expect(result).toEqual({
      meta: {
        component: 'ButtonRenderer',
        properties: {
          name: 'customButton',
          content: 'My Button',
          customIcon: 'star',
          priority: 'high',
          analytics: {
            trackingId: 'btn_001',
            category: 'primary_actions'
          }
        }
      }
    });
  });
});