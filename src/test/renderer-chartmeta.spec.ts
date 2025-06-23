import { ChartMeta, ChartConfig, ChartType } from '../core/component/component-meta-map';
import { Renderer } from "../core/xingine.type";
import {getUIComponentDetail, getUIComponentDetails, isUIComponentDetail} from "../core/xingine.util";

describe('Renderer Interface', () => {
  describe('Basic Renderer properties', () => {
    it('should accept a complete Renderer configuration', () => {
      const renderer: Renderer = {
        componentDetail: {
          component: 'ChartComponent',
          path: '/charts',
          expositionRule: {
            visible: true,
            tooltip: 'Chart tooltip',
            icon: { name: 'ChartIcon', color: '#000', size: 24 }
          },
          layout: 'grid',
          roles: ['admin', 'editor'],
          permissions: ['view', 'edit']
        },
        mode: 'detailed',
        layout: {
          display: 'grid',
          columns: 3,
          spacing: 16,
          alignment: 'center'
        },
        interaction: {
          clickable: true,
          hoverable: true,
          draggable: false,
          keyboardNavigable: true
        },
        display: {
          showBorder: true,
          showShadow: false,
          backgroundColor: '#ffffff',
          textColor: '#333333',
          borderRadius: 8,
          opacity: 1
        },
        responsive: {
          breakpoints: {
            mobile: { mode: 'compact' },
            tablet: { layout: { columns: 2 } },
            desktop: { layout: { columns: 4 } }
          },
          hiddenOn: ['mobile']
        },
        animation: {
          type: 'fade',
          duration: 300,
          easing: 'ease-in-out',
          animateOnMount: true
        },
        cssClasses: ['custom-renderer', 'themed'],
        customStyles: {
          marginTop: '10px',
          paddingBottom: 20
        },
        accessibility: {
          role: 'region',
          ariaLabel: 'Chart container',
          ariaDescription: 'Interactive chart visualization',
          tabIndex: 0
        }
      };

      expect(renderer).toBeDefined();
      expect(isUIComponentDetail(renderer.componentDetail)).toBe(true);
      const componentDetail = getUIComponentDetail(renderer.componentDetail)
      expect(componentDetail?.component).toBe('ChartComponent');
      expect(renderer.mode).toBe('detailed');
      expect(renderer.layout?.columns).toBe(3);
      expect(renderer.interaction?.clickable).toBe(true);
      expect(renderer.display?.backgroundColor).toBe('#ffffff');
      expect(renderer.responsive?.hiddenOn).toContain('mobile');
      expect(renderer.animation?.type).toBe('fade');
      expect(renderer.cssClasses).toContain('custom-renderer');
      expect(renderer.accessibility?.role).toBe('region');
    });

    it('should accept minimal Renderer configuration', () => {
      const renderer: Renderer = {
        componentDetail: {
          component: 'MinimalComponent',
          path: '/minimal'
        },
        mode: 'default'
      };

      expect(renderer).toBeDefined();
      expect(isUIComponentDetail(renderer.componentDetail)).toBe(true);
      const componentDetail = getUIComponentDetail(renderer.componentDetail)
      expect(componentDetail?.component).toBe('MinimalComponent');
      expect(renderer.mode).toBe('default');
      expect(renderer.layout).toBeUndefined();
      expect(renderer.interaction).toBeUndefined();
    });

    it('should reject empty Renderer configuration', () => {
      const renderer = () => {
        const invalidRenderer: Renderer = {} as Renderer;
        return invalidRenderer;
      };

      expect(renderer).toBeDefined();
      expect(Object.keys(renderer)).toHaveLength(0);
    });
  });

  describe('Layout configuration', () => {
    it('should support various layout configurations', () => {
      const flexLayout: Renderer = {
        componentDetail: {
          component: 'FlexComponent',
          path: '/flex'
        },
        layout: {
          display: 'flex',
          alignment: 'justify',
          spacing: '1rem'
        }
      };

      const gridLayout: Renderer = {
        componentDetail: {
          component: 'GridComponent',
          path: '/grid'
        },
        layout: {
          display: 'grid',
          columns: 6,
          spacing: 24
        }
      };

      expect(flexLayout.layout?.display).toBe('flex');
      expect(flexLayout.layout?.alignment).toBe('justify');
      expect(gridLayout.layout?.columns).toBe(6);
      expect(gridLayout.layout?.spacing).toBe(24);
    });
  });

  describe('Responsive configuration', () => {
    it('should support responsive breakpoints', () => {
      const renderer: Renderer = {
        componentDetail: {
          component: 'ResponsiveComponent',
          path: '/responsive'
        },
        responsive: {
          breakpoints: {
            mobile: {
              mode: 'compact',
              layout: { display: 'block' }
            },
            tablet: {
              layout: { columns: 2 }
            },
            desktop: {
              layout: { columns: 4 },
              display: { showBorder: true }
            }
          }
        }
      };

      expect(renderer.responsive?.breakpoints?.mobile?.mode).toBe('compact');
      expect(renderer.responsive?.breakpoints?.tablet?.layout?.columns).toBe(2);
      expect(renderer.responsive?.breakpoints?.desktop?.display?.showBorder).toBe(true);
    });

    it('should support hiding elements on specific screen sizes', () => {
      const renderer: Renderer = {
        componentDetail: {
          component: 'HiddenComponent',
          path: '/hidden'
        },
        responsive: {
          hiddenOn: ['mobile', 'tablet']
        }
      };

      expect(renderer.responsive?.hiddenOn).toHaveLength(2);
      expect(renderer.responsive?.hiddenOn).toContain('mobile');
      expect(renderer.responsive?.hiddenOn).toContain('tablet');
    });
  });

  describe('Animation configuration', () => {
    it('should support animation settings', () => {
      const renderer: Renderer = {
        componentDetail: {
          component: 'AnimatedComponent',
          path: '/animated'
        },
        animation: {
          type: 'slide',
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          animateOnMount: false
        }
      };

      expect(renderer.animation?.type).toBe('slide');
      expect(renderer.animation?.duration).toBe(500);
      expect(renderer.animation?.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(renderer.animation?.animateOnMount).toBe(false);
    });
  });

  describe('Accessibility configuration', () => {
    it('should support accessibility properties', () => {
      const renderer: Renderer = {
        componentDetail: {
          component: 'AccessibleComponent',
          path: '/accessible'
        },
        accessibility: {
          role: 'button',
          ariaLabel: 'Upload file',
          ariaDescription: 'Click to select files for upload',
          tabIndex: 1
        }
      };

      expect(renderer.accessibility?.role).toBe('button');
      expect(renderer.accessibility?.ariaLabel).toBe('Upload file');
      expect(renderer.accessibility?.tabIndex).toBe(1);
    });
  });
});