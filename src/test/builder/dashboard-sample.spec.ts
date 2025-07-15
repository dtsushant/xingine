import { 
  LayoutComponentDetailBuilder, 
  LayoutRendererBuilder, 
  TemplateBuilders 
} from '../../core/builder';
import { LayoutComponentDetail, LayoutRenderer } from '../../core/xingine.type';

describe('Dashboard Layout Sample', () => {
  
  it('should create a dashboard layout similar to the issue sample', () => {
    // Create chart component
    const chartComponent = LayoutComponentDetailBuilder.create()
      .withMeta('ChartRenderer', {
        charts: [
          {
            type: 'bar',
            height: 300,
            width: 300,
            title: 'Sales Performance',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Sales',
                data: [4000, 3000, 2000, 2780, 1890, 2390],
                backgroundColor: '#1890ff',
              },
            ],
          },
        ],
      })
      .build();

    // Create form component
    const formComponent = LayoutComponentDetailBuilder.create()
      .withMeta('FormRenderer', {
        action: 'createUser',
        fields: [
          {
            name: 'name',
            label: 'Name',
            inputType: 'input',
            required: true,
            properties: {}
          },
          {
            name: 'email',
            label: 'Email',
            inputType: 'input',
            required: true,
            properties: {}
          }
        ]
      })
      .build();

    // Create table component
    const tableComponent = LayoutComponentDetailBuilder.create()
      .withMeta('TableRenderer', {
        columns: [
          { title: 'Name', dataIndex: 'name', sortable: true },
          { title: 'Email', dataIndex: 'email', sortable: true },
          { title: 'Role', dataIndex: 'role', sortable: true }
        ],
        dataSourceUrl: '/api/users'
      })
      .build();

    // Create dashboard content with nested wrappers
    const dashboardContent = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('min-h-full max-w-full w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8')
      .addChild(
        // Charts Row
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8')
          .style({
            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '8px',
          })
          .addChild(chartComponent)
          .build()
      )
      .addChild(
        // Form and Table Row
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8')
          .addChild(tableComponent)
          .addChild(formComponent)
          .build()
      )
      .build();

    // Create header
    const headerComponent = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('h-16 px-4 flex items-center justify-between')
      .addChild(
        // Left section
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('flex items-center space-x-4')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('collapseButton')
              .content('☰')
              .className('p-2 rounded-md hover:bg-gray-100 transition-colors')
              .build()
          )
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('HomeButton')
              .content('🏠')
              .className('p-2 rounded-md hover:bg-gray-100 transition-colors')
              .build()
          )
          .build()
      )
      .addChild(
        // Middle section
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('flex-1 max-w-md mx-4')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .input()
              .name('search')
              .placeholder('Search with Icon...')
              .className('w-full h-10 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500')
              .build()
          )
          .build()
      )
      .addChild(
        // Right section
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('flex items-center space-x-3')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('notifications')
              .content('🔔')
              .className('p-2 rounded-md transition-colors relative')
              .build()
          )
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('userMenu')
              .content('👤')
              .className('p-2 rounded-md transition-colors')
              .build()
          )
          .build()
      )
      .build();

    // Create complete dashboard layout
    const dashboardLayout = LayoutRendererBuilder.create()
      .type('tailwind')
      .className('min-h-screen')
      .withHeader(headerComponent, {
        className: 'fixed top-0 left-0 right-0 h-16 z-50 shadow-sm'
      })
      .withContent({
        path: '/dashboard',
        ...dashboardContent
      }, {
        className: 'pt-16 p-6'
      })
      .build();

    // Verify structure
    expect(dashboardLayout.type).toBe('tailwind');
    expect(dashboardLayout.style?.className).toBe('min-h-screen');
    expect(dashboardLayout.header).toBeDefined();
    expect(dashboardLayout.content).toBeDefined();
    
    // Verify header structure
    expect(dashboardLayout.header?.meta?.meta?.component).toBe('WrapperRenderer');
    expect((dashboardLayout.header?.meta?.meta?.properties as any)?.children).toHaveLength(3);
    
    // Verify content structure
    expect(dashboardLayout.content.meta?.meta?.component).toBe('WrapperRenderer');
    expect((dashboardLayout.content.meta?.meta?.properties as any)?.children).toHaveLength(2);
    
    // Verify nested structure integrity
    const contentChildren = (dashboardLayout.content.meta?.meta?.properties as any)?.children;
    expect(contentChildren[0].meta?.component).toBe('WrapperRenderer'); // Charts row
    expect(contentChildren[1].meta?.component).toBe('WrapperRenderer'); // Form and table row
  });

  it('should demonstrate complex nesting capabilities', () => {
    // Create deeply nested structure: Layout > Content > Wrapper > Wrapper > Button
    const nestedContent = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('outer-wrapper')
      .addChild(
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('middle-wrapper')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .wrapper()
              .className('inner-wrapper')
              .addChild(
                LayoutComponentDetailBuilder.create()
                  .button()
                  .name('deepButton')
                  .content('Deep Button')
                  .className('nested-button')
                  .build()
              )
              .build()
          )
          .build()
      )
      .build();

    const deeplyNested = LayoutRendererBuilder.create()
      .type('complex')
      .withContent({
        path: '/nested-content',
        ...nestedContent
      })
      .build();

    expect(deeplyNested.type).toBe('complex');
    
    // Navigate through the nested structure
    const contentMeta = deeplyNested.content.meta?.meta?.properties as any;
    expect(contentMeta.style?.className).toBe('outer-wrapper');
    expect(contentMeta.children).toHaveLength(1);
    
    const middleWrapper = contentMeta.children[0];
    expect(middleWrapper.meta?.component).toBe('WrapperRenderer');
    expect((middleWrapper.meta?.properties as any)?.style?.className).toBe('middle-wrapper');
    
    const innerWrapper = (middleWrapper.meta?.properties as any)?.children[0];
    expect(innerWrapper.meta?.component).toBe('WrapperRenderer');
    expect((innerWrapper.meta?.properties as any)?.style?.className).toBe('inner-wrapper');
    
    const deepButton = (innerWrapper.meta?.properties as any)?.children[0];
    expect(deepButton.meta?.component).toBe('ButtonRenderer');
    expect((deepButton.meta?.properties as any)?.name).toBe('deepButton');
    expect((deepButton.meta?.properties as any)?.content).toBe('Deep Button');
  });

  it('should support adding components at any level', () => {
    // Create a wrapper with mixed component types
    const mixedWrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('mixed-container')
      .addChild(
        LayoutComponentDetailBuilder.create()
          .button()
          .name('button1')
          .content('Button 1')
          .build()
      )
      .addChild(
        LayoutComponentDetailBuilder.create()
          .input()
          .name('input1')
          .placeholder('Input 1')
          .build()
      )
      .addChild(
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('nested-wrapper')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('nestedButton')
              .content('Nested Button')
              .build()
          )
          .addChild(
            LayoutComponentDetailBuilder.create()
              .input()
              .name('nestedInput')
              .placeholder('Nested Input')
              .build()
          )
          .build()
      )
      .build();

    const wrapperProps = mixedWrapper.meta?.properties as any;
    expect(wrapperProps.children).toHaveLength(3);
    expect(wrapperProps.children[0].meta?.component).toBe('ButtonRenderer');
    expect(wrapperProps.children[1].meta?.component).toBe('InputRenderer');
    expect(wrapperProps.children[2].meta?.component).toBe('WrapperRenderer');
    
    // Check nested wrapper
    const nestedWrapperProps = wrapperProps.children[2].meta?.properties as any;
    expect(nestedWrapperProps.children).toHaveLength(2);
    expect(nestedWrapperProps.children[0].meta?.component).toBe('ButtonRenderer');
    expect(nestedWrapperProps.children[1].meta?.component).toBe('InputRenderer');
  });

  it('should work with template builders for complex layouts', () => {
    // Use templates to create a complex dashboard
    const header = TemplateBuilders.defaultHeader();
    const content = TemplateBuilders.gridContentWrapper();
    
    // Add custom components to the grid content
    const customContent = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className((content.meta?.properties as any)?.style?.className || '')
      .addChild(TemplateBuilders.primaryButton('action1', 'Primary Action'))
      .addChild(TemplateBuilders.secondaryButton('action2', 'Secondary Action'))
      .addChild(TemplateBuilders.cardWrapper())
      .addChild(TemplateBuilders.alert('success', 'Operation successful!'))
      .build();

    const layout = LayoutRendererBuilder.create()
      .type('template-based')
      .className('min-h-screen bg-gray-50')
      .withHeader(header)
      .withContent({
        path: '/custom-content',
        ...customContent
      })
      .withFooter(TemplateBuilders.footerLayout())
      .build();

    expect(layout.type).toBe('template-based');
    expect(layout.header).toBeDefined();
    expect(layout.content).toBeDefined();
    expect(layout.footer).toBeDefined();
    
    // Verify content has the expected number of children
    const contentChildren = (layout.content.meta?.meta?.properties as any)?.children;
    expect(contentChildren).toHaveLength(4);
    expect(contentChildren[0].meta?.component).toBe('ButtonRenderer');
    expect(contentChildren[1].meta?.component).toBe('ButtonRenderer');
    expect(contentChildren[2].meta?.component).toBe('WrapperRenderer');
    expect(contentChildren[3].meta?.component).toBe('WrapperRenderer');
  });
});