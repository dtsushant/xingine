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
    const wrapper = LayoutComponentDetailBuilder.create().wrapper();
    
    wrapper.className('h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm');
    
    // Left section with menu and home buttons
    const leftSection = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('flex items-center space-x-4')
      .build();
    
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
    
    // Middle section with search
    const searchSection = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('flex-1 max-w-md mx-4')
      .build();
    
    const searchInput = LayoutComponentDetailBuilder.create()
      .input()
      .name('search')
      .placeholder('Search...')
      .className('w-full h-10 px-4 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500')
      .build();
    
    // Right section with notifications and user menu
    const rightSection = LayoutComponentDetailBuilder.create()
      .wrapper()
      .className('flex items-center space-x-3')
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
    
    // Add components to their sections
    const leftWrapper = LayoutComponentDetailBuilder.create().wrapper().className('flex items-center space-x-4');
    leftWrapper.addChild(menuButton);
    leftWrapper.addChild(homeButton);
    
    const searchWrapper = LayoutComponentDetailBuilder.create().wrapper().className('flex-1 max-w-md mx-4');
    searchWrapper.addChild(searchInput);
    
    const rightWrapper = LayoutComponentDetailBuilder.create().wrapper().className('flex items-center space-x-3');
    rightWrapper.addChild(notificationButton);
    rightWrapper.addChild(userButton);
    
    // Add all sections to main wrapper
    wrapper.addChild(leftWrapper.build());
    wrapper.addChild(searchWrapper.build());
    wrapper.addChild(rightWrapper.build());
    
    return wrapper.build();
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
}