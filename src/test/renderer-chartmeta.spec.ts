import { Renderer, ChartMeta, ChartConfig, ChartType } from '../core/component/component-meta-map';

describe('Renderer Interface', () => {
  describe('Basic Renderer properties', () => {
    it('should accept a complete Renderer configuration', () => {
      const renderer: Renderer = {
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
        mode: 'default'
      };

      expect(renderer).toBeDefined();
      expect(renderer.mode).toBe('default');
      expect(renderer.layout).toBeUndefined();
      expect(renderer.interaction).toBeUndefined();
    });

    it('should accept empty Renderer configuration', () => {
      const renderer: Renderer = {};

      expect(renderer).toBeDefined();
      expect(Object.keys(renderer)).toHaveLength(0);
    });
  });

  describe('Layout configuration', () => {
    it('should support various layout configurations', () => {
      const flexLayout: Renderer = {
        layout: {
          display: 'flex',
          alignment: 'justify',
          spacing: '1rem'
        }
      };

      const gridLayout: Renderer = {
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

describe('Enhanced ChartMeta with Renderer', () => {
  describe('ChartConfig with Renderer', () => {
    it('should support ChartConfig with renderer configuration', () => {
      const chartConfig: ChartConfig = {
        type: 'bar' as ChartType,
        title: 'Sales Data',
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Revenue',
          data: [100, 150, 120, 180],
          backgroundColor: '#4CAF50'
        }],
        renderer: {
          mode: 'interactive',
          layout: {
            display: 'block',
            spacing: 16
          },
          interaction: {
            clickable: true,
            hoverable: true
          },
          animation: {
            type: 'scale',
            duration: 400,
            animateOnMount: true
          }
        }
      };

      expect(chartConfig).toBeDefined();
      expect(chartConfig.type).toBe('bar');
      expect(chartConfig.renderer?.mode).toBe('interactive');
      expect(chartConfig.renderer?.interaction?.clickable).toBe(true);
      expect(chartConfig.renderer?.animation?.type).toBe('scale');
    });

    it('should work without renderer configuration', () => {
      const chartConfig: ChartConfig = {
        type: 'line' as ChartType,
        title: 'Temperature Trend',
        datasets: [{
          label: 'Temperature',
          data: [20, 22, 25, 23, 21]
        }]
      };

      expect(chartConfig).toBeDefined();
      expect(chartConfig.renderer).toBeUndefined();
    });
  });

  describe('ChartMeta with global and individual renderers', () => {
    it('should support global renderer configuration', () => {
      const chartMeta: ChartMeta = {
        charts: [
          {
            type: 'pie' as ChartType,
            title: 'Market Share',
            datasets: [{
              label: 'Share',
              data: [30, 25, 20, 25]
            }]
          }
        ],
        renderer: {
          mode: 'dashboard',
          layout: {
            display: 'grid',
            columns: 2,
            spacing: 20
          },
          display: {
            showBorder: true,
            borderRadius: 8,
            showShadow: true
          }
        }
      };

      expect(chartMeta).toBeDefined();
      expect(chartMeta.renderer?.mode).toBe('dashboard');
      expect(chartMeta.renderer?.layout?.columns).toBe(2);
      expect(chartMeta.renderer?.display?.showBorder).toBe(true);
    });

    it('should support individual chart renderers overriding global settings', () => {
      const chartMeta: ChartMeta = {
        charts: [
          {
            type: 'bar' as ChartType,
            title: 'Revenue',
            datasets: [{ label: 'Revenue', data: [100, 200] }],
            renderer: {
              mode: 'detailed',
              interaction: { clickable: true }
            }
          },
          {
            type: 'line' as ChartType,
            title: 'Growth',
            datasets: [{ label: 'Growth', data: [10, 15] }]
            // No individual renderer - will use global
          }
        ],
        renderer: {
          mode: 'compact',
          interaction: { clickable: false }
        }
      };

      expect(chartMeta.charts[0].renderer?.mode).toBe('detailed');
      expect(chartMeta.charts[0].renderer?.interaction?.clickable).toBe(true);
      expect(chartMeta.charts[1].renderer).toBeUndefined();
      expect(chartMeta.renderer?.mode).toBe('compact');
      expect(chartMeta.renderer?.interaction?.clickable).toBe(false);
    });

    it('should work with multiple chart types and mixed renderer configurations', () => {
      const chartMeta: ChartMeta = {
        charts: [
          {
            type: 'scatter' as ChartType,
            title: 'Correlation',
            datasets: [{
              label: 'Data Points',
              data: [{ x: 1, y: 2 }, { x: 2, y: 4 }]
            }],
            renderer: {
              animation: { type: 'fade', duration: 600 }
            }
          },
          {
            type: 'pie' as ChartType,
            title: 'Distribution',
            datasets: [{
              label: 'Categories',
              data: [40, 30, 20, 10]
            }]
          }
        ],
        renderer: {
          layout: { display: 'flex', alignment: 'center' },
          responsive: {
            breakpoints: {
              mobile: { layout: { display: 'block' } }
            }
          }
        }
      };

      expect(chartMeta.charts).toHaveLength(2);
      expect(chartMeta.charts[0].type).toBe('scatter');
      expect(chartMeta.charts[1].type).toBe('pie');
      expect(chartMeta.charts[0].renderer?.animation?.duration).toBe(600);
      expect(chartMeta.renderer?.responsive?.breakpoints?.mobile?.layout?.display).toBe('block');
    });
  });

  describe('Renderer interface serialization', () => {
    it('should be fully serializable with JSON', () => {
      const renderer: Renderer = {
        mode: 'test',
        layout: { columns: 3 },
        interaction: { clickable: true },
        display: { backgroundColor: '#fff' },
        cssClasses: ['test-class'],
        customStyles: { margin: '10px' }
      };

      const serialized = JSON.stringify(renderer);
      const deserialized = JSON.parse(serialized) as Renderer;

      expect(deserialized.mode).toBe('test');
      expect(deserialized.layout?.columns).toBe(3);
      expect(deserialized.interaction?.clickable).toBe(true);
      expect(deserialized.cssClasses).toContain('test-class');
    });

    it('should maintain type safety after serialization', () => {
      const chartMeta: ChartMeta = {
        charts: [{
          type: 'bar' as ChartType,
          title: 'Test Chart',
          datasets: [{ label: 'Test', data: [1, 2, 3] }],
          renderer: { mode: 'interactive' }
        }],
        renderer: { layout: { columns: 2 } }
      };

      const serialized = JSON.stringify(chartMeta);
      const deserialized = JSON.parse(serialized) as ChartMeta;

      expect(deserialized.charts[0].type).toBe('bar');
      expect(deserialized.charts[0].renderer?.mode).toBe('interactive');
      expect(deserialized.renderer?.layout?.columns).toBe(2);
    });
  });
});