import {
  LayoutComponentRegistryImpl,
  LayoutExpositionUtils,
  defaultLayoutRegistry,
  layoutUtils
} from '../../core/utils/layout-exposition.util';
import {
  LayoutComponentDetail,
  Commissar,
  TypedLayoutExposition,
  LayoutRenderer,
  LayoutExpositionMap
} from '../../core/xingine.type';

describe('LayoutComponentRegistryImpl', () => {
  let registry: LayoutComponentRegistryImpl;

  beforeEach(() => {
    registry = new LayoutComponentRegistryImpl();
  });

  describe('register', () => {
    it('should register a component successfully', () => {
      const component: LayoutComponentDetail = {
        meta: { component: 'HeaderRenderer', properties: {} }
      };

      registry.register('header', component);
      expect(registry.has('header')).toBe(true);
      expect(registry.get('header')).toEqual(component);
    });

    it('should prevent duplicate registration with warning', () => {
      const component1: LayoutComponentDetail = {
        meta: { component: 'HeaderRenderer', properties: { title: 'First' } }
      };
      const component2: LayoutComponentDetail = {
        meta: { component: 'HeaderRenderer', properties: { title: 'Second' } }
      };

      console.warn = jest.fn();

      registry.register('header', component1);
      registry.register('header', component2); // This should warn and be ignored

      expect(console.warn).toHaveBeenCalledWith(
        '[LayoutComponentRegistry] Key "header" already exists. Keeping the first registration and ignoring the new one.'
      );
      expect(registry.get('header')).toEqual(component1); // Should keep the first one
    });

    it('should throw error for empty key', () => {
      const component: LayoutComponentDetail = {
        meta: { component: 'HeaderRenderer', properties: {} }
      };

      expect(() => registry.register('', component)).toThrow('Component key cannot be empty');
      expect(() => registry.register('  ', component)).toThrow('Component key cannot be empty');
    });

    it('should register Commissar components', () => {
      const commissar: Commissar = {
        path: '/dashboard',
        permission: ['dashboard.read'],
        meta: { component: 'TableRenderer', properties: {} }
      };

      registry.register('dashboard', commissar);
      expect(registry.has('dashboard')).toBe(true);
      expect(registry.get('dashboard')).toEqual(commissar);
    });
  });

  describe('get', () => {
    it('should return component if exists', () => {
      const component: LayoutComponentDetail = {
        meta: { component: 'HeaderRenderer', properties: {} }
      };

      registry.register('header', component);
      expect(registry.get('header')).toEqual(component);
    });

    it('should return undefined if component does not exist', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true if component exists', () => {
      const component: LayoutComponentDetail = {
        meta: { component: 'HeaderRenderer', properties: {} }
      };

      registry.register('header', component);
      expect(registry.has('header')).toBe(true);
    });

    it('should return false if component does not exist', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing component and return true', () => {
      const component: LayoutComponentDetail = {
        meta: { component: 'HeaderRenderer', properties: {} }
      };

      registry.register('header', component);
      expect(registry.delete('header')).toBe(true);
      expect(registry.has('header')).toBe(false);
    });

    it('should return false if component does not exist', () => {
      expect(registry.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all components', () => {
      registry.register('header', { meta: { component: 'HeaderRenderer', properties: {} } });
      registry.register('footer', { meta: { component: 'FooterRenderer', properties: {} } });

      expect(registry.size()).toBe(2);
      
      registry.clear();
      
      expect(registry.size()).toBe(0);
      expect(registry.has('header')).toBe(false);
      expect(registry.has('footer')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(registry.size()).toBe(0);

      registry.register('header', { meta: { component: 'HeaderRenderer', properties: {} } });
      expect(registry.size()).toBe(1);

      registry.register('footer', { meta: { component: 'FooterRenderer', properties: {} } });
      expect(registry.size()).toBe(2);
    });
  });

  describe('getKeys', () => {
    it('should return all registered keys', () => {
      registry.register('header', { meta: { component: 'HeaderRenderer', properties: {} } });
      registry.register('footer', { meta: { component: 'FooterRenderer', properties: {} } });

      const keys = registry.getKeys();
      expect(keys).toContain('header');
      expect(keys).toContain('footer');
      expect(keys.length).toBe(2);
    });

    it('should return empty array if no components', () => {
      expect(registry.getKeys()).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('should return all components', () => {
      const header: LayoutComponentDetail = { meta: { component: 'HeaderRenderer', properties: {} } };
      const footer: LayoutComponentDetail = { meta: { component: 'FooterRenderer', properties: {} } };

      registry.register('header', header);
      registry.register('footer', footer);

      const all = registry.getAll();
      expect(all.header).toEqual(header);
      expect(all.footer).toEqual(footer);
    });

    it('should return copy of internal map', () => {
      const header: LayoutComponentDetail = { meta: { component: 'HeaderRenderer', properties: {} } };
      registry.register('header', header);

      const all = registry.getAll();
      all.modified = { meta: { component: 'TestRenderer', properties: {} } };

      expect(registry.has('modified')).toBe(false);
    });
  });
});

describe('LayoutExpositionUtils', () => {
  let registry: LayoutExpositionMap;
  let exposition: TypedLayoutExposition;

  beforeEach(() => {
    registry = {
      'admin-header': {
        meta: { component: 'HeaderRenderer', properties: { title: 'Admin Panel' } }
      },
      'main-content': {
        path: '/dashboard',
        permission: ['dashboard.read'],
        meta: { component: 'TableRenderer', properties: {} }
      } as Commissar,
      'sidebar-nav': {
        meta: { component: 'SiderRenderer', properties: { width: 250 } }
      },
      'simple-footer': {
        meta: { component: 'FooterRenderer', properties: { copyright: '2023' } }
      }
    };

    exposition = {
      type: 'admin-layout',
      presidium: 'admin-header',
      assembly: ['main-content'],
      sider: 'sidebar-nav',
      doctrine: 'simple-footer'
    };
  });

  describe('buildRenderer', () => {
    it('should build complete LayoutRenderer', () => {
      const renderer = LayoutExpositionUtils.buildRenderer(exposition, registry);

      expect(renderer.type).toBe('admin-layout');
      expect(renderer.header?.meta).toEqual(registry['admin-header']);
      expect(renderer.content.meta).toEqual([registry['main-content']]);
      expect(renderer.sider?.meta).toEqual(registry['sidebar-nav']);
      expect(renderer.footer?.meta).toEqual(registry['simple-footer']);
    });

    it('should handle missing optional components', () => {
      const invalidExposition: TypedLayoutExposition = {
        type: 'minimal-layout',
        assembly: ['main-content']
      };

      const renderer = LayoutExpositionUtils.buildRenderer(invalidExposition, registry);

      expect(renderer.type).toBe('minimal-layout');
      expect(renderer.header).toBeUndefined();
      expect(renderer.content.meta).toEqual([registry['main-content']]);
      expect(renderer.sider).toBeUndefined();
      expect(renderer.footer).toBeUndefined();
    });

    it('should handle minimal exposition with only assembly', () => {
      const minimalExposition: TypedLayoutExposition = {
        type: 'basic-layout',
        assembly: ['main-content']
      };

      const renderer = LayoutExpositionUtils.buildRenderer(minimalExposition, registry);

      expect(renderer).toBeDefined();
      expect(renderer.type).toBe('basic-layout');
      expect(renderer.content.meta).toEqual([registry['main-content']]);
    });

    it('should apply custom style options', () => {
      const renderer = LayoutExpositionUtils.buildRenderer(exposition, registry, {
        style: { className: 'custom-layout' }
      });

      expect(renderer.style).toEqual({ className: 'custom-layout' });
    });

    it('should throw error for missing components', () => {
      const invalidExposition: TypedLayoutExposition = {
        type: 'invalid-layout',
        presidium: 'missing-header',
        assembly: ['main-content']
      };

      expect(() => LayoutExpositionUtils.buildRenderer(invalidExposition, registry))
        .toThrow('Missing components in registry: missing-header');
    });
  });

  describe('validate', () => {
    it('should validate successful exposition', () => {
      const minimalExposition: TypedLayoutExposition = {
        type: 'valid-layout',
        assembly: ['main-content']
      };

      const result = LayoutExpositionUtils.validate(minimalExposition, registry);
      expect(result.isValid).toBe(true);
      expect(result.missingKeys).toEqual([]);
    });

    it('should detect missing components', () => {
      const invalidExposition: TypedLayoutExposition = {
        type: 'invalid-layout',
        presidium: 'missing-header',
        assembly: ['main-content']
      };

      const result = LayoutExpositionUtils.validate(invalidExposition, registry);
      expect(result.isValid).toBe(false);
      expect(result.missingKeys).toContain('missing-header');
    });

    it('should handle multiple assembly components', () => {
      const multiAssemblyExposition: TypedLayoutExposition = {
        type: 'multi-layout',
        assembly: ['main-content', 'admin-header']
      };

      const result = LayoutExpositionUtils.validate(multiAssemblyExposition, registry);
      expect(result.isValid).toBe(true);
      expect(result.missingKeys).toEqual([]);
    });
  });

  describe('createFactory', () => {
    it('should create working factory function', () => {
      const registryImpl = new LayoutComponentRegistryImpl();
      registryImpl.register('admin-header', registry['admin-header']);
      registryImpl.register('main-content', registry['main-content']);
      registryImpl.register('sidebar-nav', registry['sidebar-nav']);
      registryImpl.register('simple-footer', registry['simple-footer']);

      const factory = LayoutExpositionUtils.createFactory(registryImpl);
      const renderer = factory(exposition, { style: { className: 'factory-test' } });

      expect(renderer).toBeDefined();
      expect(renderer.type).toBe('admin-layout');
      expect(renderer.style).toEqual({ className: 'factory-test' });
    });
  });

  describe('mergeRegistries', () => {
    it('should merge multiple registries', () => {
      const registry1 = new LayoutComponentRegistryImpl();
      registry1.register('header', { meta: { component: 'HeaderRenderer', properties: {} } });

      const registry2 = new LayoutComponentRegistryImpl();
      registry2.register('footer', { meta: { component: 'FooterRenderer', properties: {} } });

      const merged = LayoutExpositionUtils.mergeRegistries(registry1, registry2);

      expect(merged.has('header')).toBe(true);
      expect(merged.has('footer')).toBe(true);
      expect(merged.size()).toBe(2);
    });

    it('should handle duplicate keys with warning', () => {
      const registry1 = new LayoutComponentRegistryImpl();
      const component1 = { meta: { component: 'HeaderRenderer', properties: { title: 'First' } } };
      registry1.register('header', component1);

      const registry2 = new LayoutComponentRegistryImpl();
      const component2 = { meta: { component: 'HeaderRenderer', properties: { title: 'Second' } } };
      registry2.register('header', component2);

      console.warn = jest.fn();

      const merged = LayoutExpositionUtils.mergeRegistries(registry1, registry2);

      expect(console.warn).toHaveBeenCalledWith(
        '[LayoutComponentRegistry] Key "header" already exists. Keeping the first registration and ignoring the new one.'
      );
      expect(merged.get('header')).toEqual(component1); // Should keep the first one
    });
  });
});

describe('layoutUtils (Default Registry)', () => {
  beforeEach(() => {
    layoutUtils.clear();
  });

  afterEach(() => {
    layoutUtils.clear();
  });

  it('should register and build renderer with default registry', () => {
    layoutUtils.register('header', {
      meta: { component: 'HeaderRenderer', properties: { title: 'App' } }
    });
    layoutUtils.register('content', {
      path: '/home',
      meta: { component: 'ContentRenderer', properties: {} }
    } as Commissar);

    const exposition: TypedLayoutExposition = {
      type: 'app-layout',
      presidium: 'header',
      assembly: ['content']
    };

    const renderer = layoutUtils.buildRenderer(exposition);

    expect(renderer.type).toBe('app-layout');
    expect(renderer.header?.meta).toBeDefined();
    expect(renderer.content.meta.length).toBe(1);
  });

  it('should validate exposition with default registry', () => {
    layoutUtils.register('content', {
      meta: { component: 'ContentRenderer', properties: {} }
    });

    const exposition: TypedLayoutExposition = {
      type: 'simple-layout',
      assembly: ['content']
    };

    const result = layoutUtils.validate(exposition);
    expect(result.isValid).toBe(true);
  });

  it('should validate invalid exposition', () => {
    const validExposition: TypedLayoutExposition = {
      type: 'valid-layout',
      assembly: ['content']
    };

    const invalidExposition: TypedLayoutExposition = {
      type: 'invalid-layout',
      assembly: ['missing-content']
    };

    layoutUtils.register('content', {
      meta: { component: 'ContentRenderer', properties: {} }
    });

    expect(layoutUtils.validate(validExposition).isValid).toBe(true);
    expect(layoutUtils.validate(invalidExposition).isValid).toBe(false);
  });

  it('should provide registry access methods', () => {
    const component = { meta: { component: 'HeaderRenderer', properties: {} } };
    
    layoutUtils.register('header', component);
    
    expect(layoutUtils.has('header')).toBe(true);
    expect(layoutUtils.get('header')).toEqual(component);
    expect(layoutUtils.size()).toBe(1);
    expect(layoutUtils.getKeys()).toContain('header');
    
    expect(layoutUtils.delete('header')).toBe(true);
    expect(layoutUtils.has('header')).toBe(false);
  });

  it('should create factory from default registry', () => {
    layoutUtils.register('header', {
      meta: { component: 'HeaderRenderer', properties: {} }
    });
    layoutUtils.register('content', {
      path: '/dashboard',
      meta: { component: 'ContentRenderer', properties: {} }
    } as Commissar);

    const factory = layoutUtils.createFactory();
    
    const exposition: TypedLayoutExposition = {
      type: 'dashboard-layout',
      presidium: 'header',
      assembly: ['content']
    };

    const renderer = factory(exposition);
    expect(renderer.type).toBe('dashboard-layout');
  });
});

describe('Integration Tests', () => {
  let registry: LayoutComponentRegistryImpl;

  beforeEach(() => {
    registry = new LayoutComponentRegistryImpl();
    
    // Setup comprehensive test data
    registry.register('admin-header', {
      meta: { component: 'HeaderRenderer', properties: { title: 'Admin Panel', showUser: true } }
    });
    
    registry.register('user-header', {
      meta: { component: 'HeaderRenderer', properties: { title: 'User Portal', showUser: false } }
    });
    
    registry.register('dashboard-content', {
      path: '/dashboard',
      permission: ['dashboard.read'],
      meta: { component: 'TableRenderer', properties: { columns: ['name', 'email'] } }
    } as Commissar);
    
    registry.register('nav-sidebar', {
      meta: { component: 'SiderRenderer', properties: { width: 250, collapsible: true } }
    });
    
    registry.register('simple-footer', {
      meta: { component: 'FooterRenderer', properties: { copyright: '2023 My App' } }
    });
  });

  it('should build complete admin layout', () => {
    const exposition: TypedLayoutExposition = {
      type: 'admin-dashboard',
      presidium: 'admin-header',
      assembly: ['dashboard-content'],
      sider: 'nav-sidebar'
    };

    const renderer = LayoutExpositionUtils.buildRenderer(
      exposition, 
      registry.getAll(),
      { style: { background: '#f0f0f0' } as any }
    );

    expect(renderer.type).toBe('admin-dashboard');
    expect(renderer.style).toEqual({ background: '#f0f0f0' });
    expect(renderer.header?.meta).toEqual(registry.get('admin-header'));
    expect(renderer.content.meta).toEqual([registry.get('dashboard-content')]);
    expect(renderer.sider?.meta).toEqual(registry.get('nav-sidebar'));
    expect(renderer.footer).toBeUndefined();
  });

  it('should handle component reuse across layouts', () => {
    const adminLayout: TypedLayoutExposition = {
      type: 'admin-layout',
      presidium: 'admin-header',
      assembly: ['dashboard-content'],
      sider: 'nav-sidebar'
    };

    const userLayout: TypedLayoutExposition = {
      type: 'user-layout',
      presidium: 'user-header',
      assembly: ['dashboard-content'], // Reused component
      sider: 'nav-sidebar'              // Reused component
    };

    const adminRenderer = LayoutExpositionUtils.buildRenderer(adminLayout, registry.getAll());
    const userRenderer = LayoutExpositionUtils.buildRenderer(userLayout, registry.getAll());

    // Different headers
    expect(adminRenderer.header?.meta).not.toEqual(userRenderer.header?.meta);
    
    // Same content and sidebar (reused)
    expect(adminRenderer.content.meta).toEqual(userRenderer.content.meta);
    expect(adminRenderer.sider?.meta).toEqual(userRenderer.sider?.meta);
  });

  it('should handle empty assembly gracefully', () => {
    const emptyExposition: TypedLayoutExposition = {
      type: 'empty-layout',
      assembly: []
    };

    const renderer = LayoutExpositionUtils.buildRenderer(emptyExposition, registry.getAll());

    expect(renderer.type).toBe('empty-layout');
    expect(renderer.content.meta).toEqual([]);
    expect(renderer.header).toBeUndefined();
    expect(renderer.sider).toBeUndefined();
    expect(renderer.footer).toBeUndefined();
  });
});
