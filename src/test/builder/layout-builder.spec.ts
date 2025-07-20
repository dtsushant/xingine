import { 
  LayoutComponentDetailBuilder, 
  LayoutRendererBuilder, 
  TemplateBuilders 
} from '../../core/builder';
import { LayoutComponentDetail, LayoutRenderer } from '../../core/xingine.type';

describe('LayoutComponentDetailBuilder', () => {
  
  it('should create a basic button component', () => {
    const result = LayoutComponentDetailBuilder.create()
      .button()
      .name('testButton')
      .content('Click me')
      .className('btn btn-primary')
      .build();

    expect(result).toEqual({
      meta: {
        component: 'ButtonRenderer',
        properties: {
          name: 'testButton',
          content: 'Click me',
          style: {
            className: 'btn btn-primary'
          }
        }
      }
    });
  });

  it('should create a basic input component', () => {
    const result = LayoutComponentDetailBuilder.create()
      .input()
      .name('testInput')
      .placeholder('Enter text...')
      .className('form-control')
      .build();

    expect(result).toEqual({
      meta: {
        component: 'InputRenderer',
        properties: {
          name: 'testInput',
          placeholder: 'Enter text...',
          style: {
            className: 'form-control'
          }
        }
      }
    });
  });

  it('should create an input component with icon', () => {
    const result = LayoutComponentDetailBuilder.create()
      .input()
      .name('searchInput')
      .placeholder('Search...')
      .icon({ name: 'search', size: 16 })
      .className('search-input')
      .build();

    expect(result).toEqual({
      meta: {
        component: 'InputRenderer',
        properties: {
          name: 'searchInput',
          placeholder: 'Search...',
          icon: { name: 'search', size: 16 },
          style: {
            className: 'search-input'
          }
        }
      }
    });
  });

  it('should create a wrapper component with children', () => {
    const button = LayoutComponentDetailBuilder.create()
      .button()
      .name('childButton')
      .content('Child Button')
      .build();

    const wrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('container')
      .addChild(button)
      .build();

    expect(wrapper).toEqual({
      meta: {
        component: 'WrapperRenderer',
        properties: {
          style: {
            className: 'container'
          },
          children: [button]
        }
      }
    });
  });

  it('should create nested wrappers', () => {
    const innerButton = LayoutComponentDetailBuilder.create()
      .button()
      .name('innerButton')
      .content('Inner')
      .build();

    const innerWrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('inner-wrapper')
      .addChild(innerButton)
      .build();

    const outerWrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('outer-wrapper')
      .addChild(innerWrapper)
      .build();

    expect(outerWrapper).toEqual({
      meta: {
        component: 'WrapperRenderer',
        properties: {
          style: {
            className: 'outer-wrapper'
          },
          children: [
            {
              meta: {
                component: 'WrapperRenderer',
                properties: {
                  style: {
                    className: 'inner-wrapper'
                  },
                  children: [innerButton]
                }
              }
            }
          ]
        }
      }
    });
  });

  it('should create a wrapper with multiple children', () => {
    const button1 = LayoutComponentDetailBuilder.create()
      .button()
      .name('button1')
      .content('First')
      .build();

    const button2 = LayoutComponentDetailBuilder.create()
      .button()
      .name('button2')
      .content('Second')
      .build();

    const input = LayoutComponentDetailBuilder.create()
      .input()
      .name('input1')
      .placeholder('Type here...')
      .build();

    const wrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('multi-child-wrapper')
      .addChildren([button1, button2, input])
      .build();

    expect(wrapper.meta?.properties).toHaveProperty('children');
    const children = (wrapper.meta?.properties as any).children;
    expect(children).toHaveLength(3);
    expect(children[0]).toEqual(button1);
    expect(children[1]).toEqual(button2);
    expect(children[2]).toEqual(input);
  });

  it('should support inline styles', () => {
    const result = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('test-class')
      .style({ backgroundColor: 'red', padding: '10px' })
      .build();

    expect(result).toEqual({
      meta: {
        component: 'WrapperRenderer',
        properties: {
          style: {
            className: 'test-class',
            style: {
              backgroundColor: 'red',
              padding: '10px'
            }
          }
        }
      }
    });
  });

  it('should support content in wrapper', () => {
    const result = LayoutComponentDetailBuilder.create()
      .wrapper()
      .content('Hello World')
      .className('content-wrapper')
      .build();

    expect(result).toEqual({
      meta: {
        component: 'WrapperRenderer',
        properties: {
          content: 'Hello World',
          style: {
            className: 'content-wrapper'
          }
        }
      }
    });
  });

  it('should create a form component', () => {
    const fields = [
      { name: 'name', label: 'Name', inputType: 'input' as const, required: true, properties: {} },
      { name: 'email', label: 'Email', inputType: 'input' as const, required: true, properties: {} }
    ];

    const result = LayoutComponentDetailBuilder.create()
      .form()
      .action('createUser')
      .fields(fields)
      .build();

    expect(result).toEqual({
      meta: {
        component: 'FormRenderer',
        properties: {
          action: 'createUser',
          fields: fields
        }
      }
    });
  });

  it('should create a table component', () => {
    const columns = [
      { title: 'Name', dataIndex: 'name', sortable: true },
      { title: 'Email', dataIndex: 'email', sortable: true }
    ];

    const result = LayoutComponentDetailBuilder.create()
      .table()
      .dataSourceUrl('/api/users')
      .columns(columns)
      .rowKey('id')
      .build();

    expect(result).toEqual({
      meta: {
        component: 'TableRenderer',
        properties: {
          dataSourceUrl: '/api/users',
          columns: columns,
          rowKey: 'id'
        }
      }
    });
  });

  it('should create a chart component', () => {
    const chartConfig = {
      type: 'bar' as const,
      title: 'Sales',
      height: 300,
      width: 300,
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'Sales', data: [100, 200, 300], backgroundColor: '#1890ff' }]
    };

    const result = LayoutComponentDetailBuilder.create()
      .chart()
      .addChartConfig(chartConfig)
      .build();

    expect(result).toEqual({
      meta: {
        component: 'ChartRenderer',
        properties: {
          charts: [chartConfig]
        }
      }
    });
  });

  it('should create a detail component', () => {
    const fields = [
      { name: 'name', label: 'Name', inputType: 'text' as const, properties: {} },
      { name: 'email', label: 'Email', inputType: 'text' as const, properties: {} }
    ];

    const result = LayoutComponentDetailBuilder.create()
      .detailRenderer()
      .action('viewUser')
      .fields(fields)
      .build();

    expect(result).toEqual({
      meta: {
        component: 'DetailRenderer',
        properties: {
          action: 'viewUser',
          fields: fields
        }
      }
    });
  });

  it('should create a conditional component', () => {
    const trueComponent = LayoutComponentDetailBuilder.create()
      .button()
      .name('adminBtn')
      .content('Admin')
      .build();

    const falseComponent = LayoutComponentDetailBuilder.create()
      .button()
      .name('userBtn')
      .content('User')
      .build();

    const result = LayoutComponentDetailBuilder.create()
      .conditional()
      .condition({ field: 'user.isAdmin', operator: 'eq', value: true })
      .trueComponent(trueComponent)
      .falseComponent(falseComponent)
      .build();

    expect(result.meta?.component).toBe('ConditionalRenderer');
    expect((result.meta?.properties as any)?.condition.field).toBe('user.isAdmin');
    expect((result.meta?.properties as any)?.trueComponent).toEqual(trueComponent);
    expect((result.meta?.properties as any)?.falseComponent).toEqual(falseComponent);
  });
});

describe('LayoutRendererBuilder', () => {
  
  it('should create a basic layout renderer', () => {
    const content = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('main-content')
      .build();

    const layout = LayoutRendererBuilder.create()
      .type('basic')
      .className('layout-root')
      .withContent([{
        path: '/basic-content',
        ...content
      }])
      .build();

    expect(layout).toEqual({
      type: 'basic',
      style: {
        className: 'layout-root'
      },
      content: {
        meta: [{
          path: '/basic-content',
          ...content
        }]
      }
    });
  });

  it('should create a complete layout with all sections', () => {
    const header = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('header')
      .content('Header Content')
      .build();

    const content = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('content')
      .content('Main Content')
      .build();

    const sider = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('sidebar')
      .content('Sidebar Content')
      .build();

    const footer = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('footer')
      .content('Footer Content')
      .build();

    const layout = LayoutRendererBuilder.create()
      .type('complete')
      .className('full-layout')
      .withHeader(header, { className: 'header-section' })
      .withContent([{
        path: '/complete-content',
        ...content
      }], { className: 'content-section' })
      .withSider(sider, { className: 'sider-section' })
      .withFooter(footer, { className: 'footer-section' })
      .build();

    expect(layout).toEqual({
      type: 'complete',
      style: {
        className: 'full-layout'
      },
      header: {
        meta: header,
        style: { className: 'header-section' }
      },
      content: {
        meta: [{
          path: '/complete-content',
          ...content
        }],
        style: { className: 'content-section' }
      },
      sider: {
        meta: sider,
        style: { className: 'sider-section' }
      },
      footer: {
        meta: footer,
        style: { className: 'footer-section' }
      }
    });
  });

  it('should create layout using fluent section builders', () => {
    const layout = LayoutRendererBuilder.create()
      .type('fluent')
      .header()
      .className('header-style')
      .wrapper()
      .className('header-wrapper')
      .content('Header Text')
      .build()
      .content()
      .className('content-style')
      .wrapper()
      .className('content-wrapper')
      .content('Main Content')
      .build()
      .build();

    expect(layout.type).toBe('fluent');
    expect(layout.header).toBeDefined();
    expect(layout.header?.style?.className).toBe('header-style');
    expect(layout.content).toBeDefined();
    expect(layout.content.style?.className).toBe('content-style');
  });

  it('should support inline styles in layout', () => {
    const layout = LayoutRendererBuilder.create()
      .type('styled')
      .inlineStyle({ minHeight: '100vh', backgroundColor: '#f0f0f0' })
      .withContent([{
        path: '/styled-content',
        ...LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('content')
          .build()
      }])
      .build();

    expect(layout.style?.style).toEqual({
      minHeight: '100vh',
      backgroundColor: '#f0f0f0'
    });
  });
});

describe('TemplateBuilders', () => {
  
  it('should create a dashboard layout template', () => {
    const layout = TemplateBuilders.dashboardLayout().build();
    
    expect(layout.type).toBe('tailwind');
    expect(layout.style?.className).toBe('min-h-screen bg-gray-100 dark:bg-gray-900');
    expect(layout.content).toBeDefined();
  });

  it('should create a default header template', () => {
    const header = TemplateBuilders.defaultHeader();
    
    expect(header.meta?.component).toBe('WrapperRenderer');
    expect((header.meta?.properties as any)?.style?.className).toContain('h-16 px-4 flex items-center justify-between');
    expect((header.meta?.properties as any)?.children).toBeDefined();
    expect((header.meta?.properties as any)?.children).toHaveLength(3); // left, middle, right sections
  });

  it('should create a primary button template', () => {
    const button = TemplateBuilders.primaryButton('testBtn', 'Test Button');
    
    expect(button.meta?.component).toBe('ButtonRenderer');
    expect((button.meta?.properties as any)?.name).toBe('testBtn');
    expect((button.meta?.properties as any)?.content).toBe('Test Button');
    expect((button.meta?.properties as any)?.style?.className).toContain('bg-blue-500');
  });

  it('should create a secondary button template', () => {
    const button = TemplateBuilders.secondaryButton('testBtn', 'Test Button');
    
    expect(button.meta?.component).toBe('ButtonRenderer');
    expect((button.meta?.properties as any)?.name).toBe('testBtn');
    expect((button.meta?.properties as any)?.content).toBe('Test Button');
    expect((button.meta?.properties as any)?.style?.className).toContain('bg-gray-200');
  });

  it('should create a standard input template', () => {
    const input = TemplateBuilders.standardInput('testInput', 'Test placeholder');
    
    expect(input.meta?.component).toBe('InputRenderer');
    expect((input.meta?.properties as any)?.name).toBe('testInput');
    expect((input.meta?.properties as any)?.placeholder).toBe('Test placeholder');
    expect((input.meta?.properties as any)?.style?.className).toContain('w-full px-3 py-2 border');
  });

  it('should create a grid content wrapper template', () => {
    const wrapper = TemplateBuilders.gridContentWrapper();
    
    expect(wrapper.meta?.component).toBe('WrapperRenderer');
    expect((wrapper.meta?.properties as any)?.style?.className).toContain('grid');
    expect((wrapper.meta?.properties as any)?.style?.className).toContain('lg:grid-cols-2');
  });

  it('should create a card wrapper template', () => {
    const wrapper = TemplateBuilders.cardWrapper();
    
    expect(wrapper.meta?.component).toBe('WrapperRenderer');
    expect((wrapper.meta?.properties as any)?.style?.className).toContain('bg-white');
    expect((wrapper.meta?.properties as any)?.style?.className).toContain('rounded-lg');
    expect((wrapper.meta?.properties as any)?.style?.className).toContain('shadow');
  });

  it('should create a complete dashboard template', () => {
    const dashboard = TemplateBuilders.completeDashboard();
    
    expect(dashboard.type).toBe('tailwind');
    expect(dashboard.header).toBeDefined();
    expect(dashboard.content).toBeDefined();
    expect(dashboard.header?.style?.className).toContain('fixed top-0');
    expect(dashboard.content.style?.className).toContain('pt-16');
  });

  it('should create responsive grid templates', () => {
    const grid2 = TemplateBuilders.responsiveGrid(2);
    const grid3 = TemplateBuilders.responsiveGrid(3);
    
    expect((grid2.meta?.properties as any)?.style?.className).toContain('lg:grid-cols-2');
    expect((grid3.meta?.properties as any)?.style?.className).toContain('lg:grid-cols-3');
  });

  it('should create flex container templates', () => {
    const rowFlex = TemplateBuilders.flexContainer('row', 'center');
    const colFlex = TemplateBuilders.flexContainer('column', 'between');
    
    expect((rowFlex.meta?.properties as any)?.style?.className).toContain('flex-row');
    expect((rowFlex.meta?.properties as any)?.style?.className).toContain('justify-center');
    expect((colFlex.meta?.properties as any)?.style?.className).toContain('flex-column');
    expect((colFlex.meta?.properties as any)?.style?.className).toContain('justify-between');
  });

  it('should create alert templates', () => {
    const successAlert = TemplateBuilders.alert('success', 'Success message');
    const errorAlert = TemplateBuilders.alert('error', 'Error message');
    
    expect((successAlert.meta?.properties as any)?.style?.className).toContain('bg-green-100');
    expect((successAlert.meta?.properties as any)?.content).toBe('Success message');
    expect((errorAlert.meta?.properties as any)?.style?.className).toContain('bg-red-100');
    expect((errorAlert.meta?.properties as any)?.content).toBe('Error message');
  });

  it('should create loading spinner template', () => {
    const spinner = TemplateBuilders.loadingSpinner();
    
    expect(spinner.meta?.component).toBe('WrapperRenderer');
    expect((spinner.meta?.properties as any)?.style?.className).toContain('flex items-center justify-center');
    expect((spinner.meta?.properties as any)?.content).toContain('animate-spin');
  });

  it('should create form template', () => {
    const fields = [
      { name: 'name', label: 'Name', inputType: 'input' as const, required: true, properties: {} },
      { name: 'email', label: 'Email', inputType: 'input' as const, required: true, properties: {} }
    ];
    const form = TemplateBuilders.basicForm('createUser', fields);
    
    expect(form.meta?.component).toBe('FormRenderer');
    expect((form.meta?.properties as any)?.action).toBe('createUser');
    expect((form.meta?.properties as any)?.fields).toEqual(fields);
  });

  it('should create table template', () => {
    const columns = [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Email', dataIndex: 'email' }
    ];
    const table = TemplateBuilders.basicTable('/api/users', columns);
    
    expect(table.meta?.component).toBe('TableRenderer');
    expect((table.meta?.properties as any)?.dataSourceUrl).toBe('/api/users');
    expect((table.meta?.properties as any)?.columns).toEqual(columns);
  });

  it('should create bar chart template', () => {
    const chart = TemplateBuilders.barChart(
      'Sales Data',
      ['Jan', 'Feb', 'Mar'],
      [100, 200, 300]
    );
    
    expect(chart.meta?.component).toBe('ChartRenderer');
    const chartConfig = (chart.meta?.properties as any)?.charts[0];
    expect(chartConfig.type).toBe('bar');
    expect(chartConfig.title).toBe('Sales Data');
    expect(chartConfig.labels).toEqual(['Jan', 'Feb', 'Mar']);
    expect(chartConfig.datasets[0].data).toEqual([100, 200, 300]);
  });

  it('should create line chart template', () => {
    const chart = TemplateBuilders.lineChart(
      'Growth Data',
      ['Q1', 'Q2', 'Q3'],
      [50, 75, 100],
      '#ff0000'
    );
    
    expect(chart.meta?.component).toBe('ChartRenderer');
    const chartConfig = (chart.meta?.properties as any)?.charts[0];
    expect(chartConfig.type).toBe('line');
    expect(chartConfig.title).toBe('Growth Data');
    expect(chartConfig.datasets[0].borderColor).toBe('#ff0000');
  });

  it('should create pie chart template', () => {
    const chart = TemplateBuilders.pieChart(
      'Distribution',
      ['A', 'B', 'C'],
      [30, 40, 30]
    );
    
    expect(chart.meta?.component).toBe('ChartRenderer');
    const chartConfig = (chart.meta?.properties as any)?.charts[0];
    expect(chartConfig.type).toBe('pie');
    expect(chartConfig.title).toBe('Distribution');
    expect(chartConfig.labels).toEqual(['A', 'B', 'C']);
  });

  it('should create conditional content template', () => {
    const trueComponent = TemplateBuilders.primaryButton('admin', 'Admin Action');
    const falseComponent = TemplateBuilders.secondaryButton('user', 'User Action');
    
    const conditional = TemplateBuilders.conditionalContent(
      'user.isAdmin',
      'eq',
      true,
      trueComponent,
      falseComponent
    );
    
    expect(conditional.meta?.component).toBe('ConditionalRenderer');
    const props = conditional.meta?.properties as any;
    expect(props.condition.field).toBe('user.isAdmin');
    expect(props.condition.operator).toBe('eq');
    expect(props.condition.value).toBe(true);
    expect(props.trueComponent).toEqual(trueComponent);
    expect(props.falseComponent).toEqual(falseComponent);
  });

  it('should create user profile card template', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg'
    };
    
    const profileCard = TemplateBuilders.userProfileCard(userData);
    
    expect(profileCard.meta?.component).toBe('WrapperRenderer');
    expect((profileCard.meta?.properties as any)?.style?.className).toContain('bg-white');
    expect((profileCard.meta?.properties as any)?.content).toContain('John Doe');
    expect((profileCard.meta?.properties as any)?.content).toContain('john@example.com');
    expect((profileCard.meta?.properties as any)?.content).toContain('avatar.jpg');
  });

  it('should create stats card template', () => {
    const statsCard = TemplateBuilders.statsCard('Total Sales', '$12,345', '💰', 'green');
    
    expect(statsCard.meta?.component).toBe('WrapperRenderer');
    expect((statsCard.meta?.properties as any)?.style?.className).toContain('bg-green-50');
    expect((statsCard.meta?.properties as any)?.content).toContain('$12,345');
    expect((statsCard.meta?.properties as any)?.content).toContain('Total Sales');
    expect((statsCard.meta?.properties as any)?.content).toContain('💰');
  });
});