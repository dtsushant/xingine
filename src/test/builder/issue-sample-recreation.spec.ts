import { 
  LayoutComponentDetailBuilder, 
  LayoutRendererBuilder, 
  TemplateBuilders 
} from '../../core/builder';
import { LayoutRenderer } from '../../core/xingine.type';

/**
 * This test recreates the exact dashboard layout from the issue sample data
 * to demonstrate the fluent builder's ability to create complex layouts
 */
describe('Issue Sample Dashboard Recreation', () => {
  
  it('should recreate the createTailwindDashboardLayout function using fluent builders', () => {
    // Mock data that would normally come from external sources
    const userFormFields = [
      { name: 'name', label: 'Name', inputType: 'input' as const, required: true, properties: {} },
      { name: 'email', label: 'Email', inputType: 'input' as const, required: true, properties: {} },
      { name: 'role', label: 'Role', inputType: 'select' as const, required: true, properties: {} }
    ];

    const userTableData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true, createdAt: '2024-01-01' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', active: true, createdAt: '2024-01-02' }
    ];

    const userDetailData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      active: true,
      createdAt: '2024-01-01',
      lastLogin: '2024-01-15T10:30:00Z',
      profile: {
        avatar: 'https://example.com/avatar.jpg',
        department: 'Engineering',
        phone: '+1-555-0123',
        bio: 'Software engineer with 5 years of experience in web development.'
      },
      permissions: ['read', 'write', 'admin']
    };

    // Create chart component using the builder
    const chartComponent = LayoutComponentDetailBuilder.create()
      .chart()
      .charts([
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
        {
          type: 'line',
          title: 'User Growth',
          height: 300,
          width: 300,
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Users',
              data: [240, 221, 229, 200, 218, 250],
              borderColor: '#52c41a',
            },
          ],
        },
        {
          type: 'pie',
          title: 'Device Distribution',
          height: 300,
          width: 300,
          datasets: [
            {
              label: 'Devices',
              data: [400, 300, 300, 200],
              backgroundColor: '#1890ff',
            },
          ],
          labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
        },
        {
          type: 'scatter',
          title: 'Revenue Analysis',
          height: 300,
          width: 300,
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Revenue',
              data: [
                { x: 1, y: 2400 },
                { x: 2, y: 1398 },
                { x: 3, y: 9800 },
                { x: 4, y: 3908 },
              ],
              backgroundColor: '#722ed1',
            },
          ],
        },
      ])
      .build();

    // Create form component using the builder
    const formComponent = LayoutComponentDetailBuilder.create()
      .withMeta('FormRenderer', {
        action: 'handleUserCreate',
        fields: userFormFields,
        properties: {
          title: 'Create User',
          submitText: 'Create User',
          className: 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow',
        },
      } as any)
      .build();

    // Create table component using the builder
    const tableComponent = LayoutComponentDetailBuilder.create()
      .table()
      .dataSourceUrl('/api/users')
      .columns([
        { title: 'Name', dataIndex: 'name', key: 'name', sortable: true },
        { title: 'Email', dataIndex: 'email', key: 'email', sortable: true },
        { title: 'Role', dataIndex: 'role', key: 'role', sortable: true },
        { title: 'Status', dataIndex: 'active', key: 'active' },
        { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
      ])
      .build();

    // Create detail component using the builder
    const detailComponent = LayoutComponentDetailBuilder.create()
      .detailRenderer()
      .action('viewUser')
      .fields([
        { name: 'name', label: 'Name', inputType: 'text' as const, properties: {} },
        { name: 'email', label: 'Email', inputType: 'text' as const, properties: {} },
        { name: 'role', label: 'Role', inputType: 'badge' as const, properties: {} },
        { name: 'active', label: 'Status', inputType: 'switch' as const, properties: {} },
        { name: 'createdAt', label: 'Created', inputType: 'date' as const, properties: {} },
        { name: 'lastLogin', label: 'Last Login', inputType: 'date' as const, properties: {} },
      ])
      .build();

    // Create popup component using the builder
    const popupComponent = LayoutComponentDetailBuilder.create()
      .popup()
      .property('title', 'User Profile Details')
      .property('triggerText', 'View Full Profile')
      .property('width', 800)
      .property('height', 600)
      .property('content', `
        <div class="flex items-center space-x-4">
          <img src="${userDetailData.profile.avatar}" alt="Profile" class="w-20 h-20 rounded-full">
          <div>
            <h2 class="text-2xl font-bold">${userDetailData.name}</h2>
            <p class="text-gray-600">${userDetailData.profile.department} Department</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold mb-2">Contact Information</h3>
            <p><strong>Email:</strong> ${userDetailData.email}</p>
            <p><strong>Phone:</strong> ${userDetailData.profile.phone}</p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Role & Permissions</h3>
            <p><strong>Role:</strong> ${userDetailData.role}</p>
            <p><strong>Permissions:</strong> ${userDetailData.permissions.join(", ")}</p>
          </div>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Biography</h3>
          <p>${userDetailData.profile.bio}</p>
        </div>
      `)
      .build();

    // Create dashboard content with nested structure
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
      .addChild(
        // Detail and Popup Row
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('grid grid-cols-1 gap-6')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .wrapper()
              .className('bg-white dark:bg-gray-800 p-6 rounded-lg shadow')
              .addChild(detailComponent)
              .addChild(popupComponent)
              .build()
          )
          .build()
      )
      .build();

    // Create header with complex nested structure
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
              .content(`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>`)
              .event({
                onClick: 'headerActionContext.handleToggleCollapsed',
              } as any)
              .className('p-2 rounded-md hover:bg-gray-100 transition-colors')
              .build()
          )
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('HomeButton')
              .content(`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>`)
              .className('p-2 rounded-md hover:bg-gray-100 transition-colors')
              .build()
          )
          .build()
      )
      .addChild(
        // Middle section with search
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
        // Right section with user menu
        LayoutComponentDetailBuilder.create()
          .wrapper()
          .className('flex items-center space-x-3')
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('notifications')
              .content(`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width='2' d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 016-6h6a6 6 0 016 6v2" />
              </svg>
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">3</span>`)
              .className('p-2 rounded-md transition-colors relative')
              .build()
          )
          .addChild(
            LayoutComponentDetailBuilder.create()
              .button()
              .name('userDropdown')
              .content(`<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">U</div>
                <svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width='2' d="M19 9l-7 7-7-7" />
                </svg>`)
              .className('flex items-center space-x-2 p-2 rounded-md transition-colors')
              .build()
          )
          .build()
      )
      .build();

    // Create the complete dashboard layout
    const createTailwindDashboardLayout = (): LayoutRenderer => {
      return LayoutRendererBuilder.create()
        .type('tailwind')
        .className('min-h-screen')
        .withHeader(headerComponent, {
          className: 'fixed top-0 left-0 right-0 h-16 z-50 shadow-sm'
        })
        .withContent([{
          path: '/dashboard',
          ...dashboardContent
        }])
        .build();
    };

    // Execute the function and verify the result
    const result = createTailwindDashboardLayout();

    // Verify the structure
    expect(result.type).toBe('tailwind');
    expect(result.style?.className).toBe('min-h-screen');
    expect(result.header).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.sider).toBeUndefined();
    expect(result.footer).toBeUndefined();

    // Verify header structure
    expect(result.header?.style?.className).toBe('fixed top-0 left-0 right-0 h-16 z-50 shadow-sm');
    expect(result.header?.meta?.meta?.component).toBe('WrapperRenderer');
    
    const headerChildren = (result.header?.meta?.meta?.properties as any)?.children;
    expect(headerChildren).toHaveLength(3); // left, middle, right sections

    // Verify content structure
    expect(result.content.meta[0]?.meta?.component).toBe('WrapperRenderer');
    const contentChildren = (result.content.meta[0]?.meta?.properties as any)?.children;
    expect(contentChildren).toHaveLength(3); // charts, form+table, detail+popup rows

    // Verify charts section
    const chartsRow = contentChildren[0];
    expect(chartsRow.meta?.component).toBe('WrapperRenderer');
    expect((chartsRow.meta?.properties as any)?.style?.style?.background).toBe('linear-gradient(135deg, #ff7e5f, #feb47b)');
    
    const chartChildren = (chartsRow.meta?.properties as any)?.children;
    expect(chartChildren).toHaveLength(1);
    expect(chartChildren[0].meta?.component).toBe('ChartRenderer');
    
    const charts = (chartChildren[0].meta?.properties as any)?.charts;
    expect(charts).toHaveLength(4); // bar, line, pie, scatter

    // Verify form and table section
    const formTableRow = contentChildren[1];
    expect(formTableRow.meta?.component).toBe('WrapperRenderer');
    const formTableChildren = (formTableRow.meta?.properties as any)?.children;
    expect(formTableChildren).toHaveLength(2);
    expect(formTableChildren[0].meta?.component).toBe('TableRenderer');
    expect(formTableChildren[1].meta?.component).toBe('FormRenderer');

    // Verify detail and popup section
    const detailPopupRow = contentChildren[2];
    expect(detailPopupRow.meta?.component).toBe('WrapperRenderer');
    const detailPopupChildren = (detailPopupRow.meta?.properties as any)?.children;
    expect(detailPopupChildren).toHaveLength(1);
    
    const innerWrapper = detailPopupChildren[0];
    expect(innerWrapper.meta?.component).toBe('WrapperRenderer');
    const innerChildren = (innerWrapper.meta?.properties as any)?.children;
    expect(innerChildren).toHaveLength(2);
    expect(innerChildren[0].meta?.component).toBe('DetailRenderer');
    expect(innerChildren[1].meta?.component).toBe('PopupRenderer');

    console.log('✅ Successfully recreated the dashboard layout using fluent builders!');
    console.log('🏗️ Total components created:', JSON.stringify(result).length + ' characters');
    console.log('📊 Charts:', charts.length);
    console.log('📝 Form fields:', userFormFields.length);
    console.log('📋 Table columns:', 5);
    console.log('🎯 All nested structures verified successfully!');
  });
});