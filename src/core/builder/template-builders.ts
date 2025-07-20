import { LayoutComponentDetail, LayoutRenderer } from '../xingine.type';
import { LayoutComponentDetailBuilder } from './layout-component-detail-builder';
import { LayoutRendererBuilder } from './layout-renderer-builder';

/**
 * Template builders providing default configurations for common components
 */
export class TemplateBuilders {
  /**
   * Creates a default dashboard layout with header, content, and optional sider
   */
  static dashboardLayout(): LayoutRendererBuilder {
    return LayoutRendererBuilder.create()
      .type('tailwind')
      .className('min-h-screen bg-gray-100 dark:bg-gray-900');
  }

  /**
   * Creates a default header with navigation and user menu
   */
  static defaultHeader(): LayoutComponentDetail {
    const menuButton = LayoutComponentDetailBuilder.create()
      .button()
      .name('menuToggle')
      .content('☰')
      .className('p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors')
      .build();
    
    const homeButton = LayoutComponentDetailBuilder.create()
      .button()
      .name('homeButton')
      .content('🏠')
      .className('p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors')
      .build();
    
    const searchInput = LayoutComponentDetailBuilder.create()
      .input()
      .name('search')
      .placeholder('Search...')
      .className('w-full h-10 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500')
      .build();
    
    const notificationButton = LayoutComponentDetailBuilder.create()
      .button()
      .name('notifications')
      .content('🔔')
      .className('p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative')
      .build();
    
    const userButton = LayoutComponentDetailBuilder.create()
      .button()
      .name('userMenu')
      .content('👤')
      .className('p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors')
      .build();
    
    // Build wrapper sections
    const leftWrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('flex items-center space-x-4')
      .addChild(menuButton)
      .addChild(homeButton)
      .build();
    
    const searchWrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('flex-1 max-w-md mx-4')
      .addChild(searchInput)
      .build();
    
    const rightWrapper = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('flex items-center space-x-3')
      .addChild(notificationButton)
      .addChild(userButton)
      .build();
    
    // Build main wrapper
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm')
      .addChild(leftWrapper)
      .addChild(searchWrapper)
      .addChild(rightWrapper)
      .build();
  }

  /**
   * Creates a default content wrapper with grid layout
   */
  static gridContentWrapper(): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('p-6 grid grid-cols-1 lg:grid-cols-2 gap-6')
      .build();
  }

  /**
   * Creates a card wrapper for content sections
   */
  static cardWrapper(): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md')
      .build();
  }

  /**
   * Creates a default button with primary styling
   */
  static primaryButton(name: string, content: string): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .button()
      .name(name)
      .content(content)
      .className('px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors')
      .build();
  }

  /**
   * Creates a default button with secondary styling
   */
  static secondaryButton(name: string, content: string): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .button()
      .name(name)
      .content(content)
      .className('px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors')
      .build();
  }

  /**
   * Creates a default input with standard styling
   */
  static standardInput(name: string, placeholder?: string): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .input()
      .name(name)
      .placeholder(placeholder || 'Enter value...')
      .className('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent')
      .build();
  }

  /**
   * Creates a complete dashboard layout with all sections
   */
  static completeDashboard(): LayoutRenderer {
    const header = this.defaultHeader();
    const content = this.gridContentWrapper();
    
    return LayoutRendererBuilder.create()
      .type('tailwind')
      .className('min-h-screen bg-gray-100 dark:bg-gray-900')
      .header()
      .className('fixed top-0 left-0 right-0 h-16 z-50 shadow-sm')
      .withComponent(header)
      .content()
      .className('pt-16 min-h-screen')
      .withComponent(content)
      .build();
  }

  /**
   * Creates a form layout with standard styling
   */
  static formLayout(): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md')
      .build();
  }

  /**
   * Creates a table layout with standard styling
   */
  static tableLayout(): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden')
      .build();
  }

  /**
   * Creates a sidebar layout
   */
  static sidebarLayout(): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('w-64 bg-white dark:bg-gray-800 shadow-lg h-full p-4')
      .build();
  }

  /**
   * Creates a footer layout
   */
  static footerLayout(): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center text-gray-600 dark:text-gray-400')
      .content('© 2024 Your Application. All rights reserved.')
      .build();
  }

  /**
   * Creates a responsive grid container
   */
  static responsiveGrid(columns: number = 3): LayoutComponentDetail {
    const gridClass = `grid grid-cols-1 md:grid-cols-${columns > 1 ? 2 : 1} lg:grid-cols-${columns} gap-6`;
    
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className(gridClass)
      .build();
  }

  /**
   * Creates a flex container with common layouts
   */
  static flexContainer(direction: 'row' | 'column' = 'row', justify: 'start' | 'center' | 'end' | 'between' | 'around' = 'start'): LayoutComponentDetail {
    const flexClass = `flex flex-${direction} justify-${justify} items-center gap-4`;
    
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className(flexClass)
      .build();
  }

  /**
   * Creates a loading spinner component
   */
  static loadingSpinner(): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('flex items-center justify-center p-8')
      .content('<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>')
      .build();
  }

  /**
   * Creates an alert/notification component
   */
  static alert(type: 'success' | 'error' | 'warning' | 'info' = 'info', message: string): LayoutComponentDetail {
    const colorMap = {
      success: 'bg-green-100 border-green-500 text-green-700',
      error: 'bg-red-100 border-red-500 text-red-700',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      info: 'bg-blue-100 border-blue-500 text-blue-700'
    };
    
    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className(`border-l-4 p-4 ${colorMap[type]}`)
      .content(message)
      .build();
  }

  /**
   * Creates a basic form template
   */
  static basicForm(action: string, fields: any[]): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .form()
      .action(action)
      .fields(fields)
      .build();
  }

  /**
   * Creates a basic table template
   */
  static basicTable(dataSourceUrl: string, columns: any[]): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .table()
      .dataSourceUrl(dataSourceUrl)
      .columns(columns)
      .build();
  }

  /**
   * Creates a basic chart template
   */
  static basicChart(chartConfig: any): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .chart()
      .addChart(chartConfig)
      .build();
  }

  /**
   * Creates a bar chart template
   */
  static barChart(title: string, labels: string[], data: number[], backgroundColor = '#1890ff'): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .chart()
      .addChart(builder => builder
        .type('bar')
        .title(title)
        .labels(labels)
        .addDataset({
          label: title,
          data,
          backgroundColor,
        })
      )
      .build();
  }

  /**
   * Creates a line chart template
   */
  static lineChart(title: string, labels: string[], data: number[], borderColor = '#52c41a'): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .chart()
      .addChart(builder => builder
        .type('line')
        .title(title)
        .labels(labels)
        .addDataset({
          label: title,
          data,
          borderColor,
        })
      )
      .build();
  }

  /**
   * Creates a pie chart template
   */
  static pieChart(title: string, labels: string[], data: number[], backgroundColor = '#1890ff'): LayoutComponentDetail {
    return LayoutComponentDetailBuilder.create()
      .chart()
      .addChart(builder => builder
        .type('pie')
        .title(title)
        .labels(labels)
        .addDataset({
          label: title,
          data,
          backgroundColor,
        })
      )
      .build();
  }

  /**
   * Creates a conditional wrapper that shows different content based on a condition
   */
  static conditionalContent(
    field: string,
    operator: string,
    value: any,
    trueComponent: LayoutComponentDetail,
    falseComponent?: LayoutComponentDetail
  ): LayoutComponentDetail {
    const builder = LayoutComponentDetailBuilder.create()
      .conditional()
      .condition({ field, operator, value } as any)
      .trueComponent(trueComponent);
    
    if (falseComponent) {
      builder.falseComponent(falseComponent);
    }
    
    return builder.build();
  }

  /**
   * Creates a user profile card template
   */
  static userProfileCard(userData: { name: string; email: string; avatar?: string }): LayoutComponentDetail {
    const avatarContent = userData.avatar
      ? `<img src="${userData.avatar}" alt="Profile" class="w-12 h-12 rounded-full">`
      : '<div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">' +
        userData.name.charAt(0).toUpperCase() + '</div>';

    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('bg-white dark:bg-gray-800 rounded-lg shadow-md p-6')
      .content(`
        <div class="flex items-center space-x-4">
          ${avatarContent}
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${userData.name}</h3>
            <p class="text-gray-600 dark:text-gray-400">${userData.email}</p>
          </div>
        </div>
      `)
      .build();
  }

  /**
   * Creates a statistics card template
   */
  static statsCard(title: string, value: string | number, icon?: string, color = 'blue'): LayoutComponentDetail {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    const iconHtml = icon ? `<div class="text-2xl mb-2">${icon}</div>` : '';

    return LayoutComponentDetailBuilder.create()
      .wrapper()
      .className(`${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} rounded-lg border p-6 text-center`)
      .content(`
        ${iconHtml}
        <div class="text-2xl font-bold mb-1">${value}</div>
        <div class="text-sm font-medium">${title}</div>
      `)
      .build();
  }
}