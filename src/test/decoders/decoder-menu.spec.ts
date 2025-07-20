import { menuMetaDecoder, menuItemsDecoder } from "../../core/decoders/menu.decoder";

describe('menuDecoder', () => {
    describe('menuItemsDecoder', () => {
        it('should decode valid menu item with all properties', () => {
            const json = {
                key: 'dashboard',
                label: 'Dashboard',
                icon: {
                    name: 'DashboardOutlined',
                    size: 16
                },
                path: '/dashboard',
                event: {
                    onClick: '#this.navigateTo'
                }
            };

            const result = menuItemsDecoder.verify(json);
            
            expect(result).toEqual({
                key: 'dashboard',
                label: 'Dashboard',
                icon: {
                    name: 'DashboardOutlined',
                    size: 16
                },
                path: '/dashboard',
                event: {
                    onClick: '#this.navigateTo'
                }
            });
        });

        it('should decode minimal menu item with only required fields', () => {
            const json = {
                key: 'home',
                label: 'Home'
            };

            const result = menuItemsDecoder.verify(json);
            
            expect(result).toEqual({
                key: 'home',
                label: 'Home'
            });
        });

        it('should decode menu item with nested children', () => {
            const json = {
                key: 'management',
                label: 'Management',
                children: [
                    {
                        key: 'users',
                        label: 'Users',
                        path: '/users'
                    },
                    {
                        key: 'roles',
                        label: 'Roles',
                        path: '/roles'
                    }
                ]
            };

            const result = menuItemsDecoder.verify(json);
            
            expect(result).toEqual({
                key: 'management',
                label: 'Management',
                children: [
                    {
                        key: 'users',
                        label: 'Users',
                        path: '/users'
                    },
                    {
                        key: 'roles',
                        label: 'Roles',
                        path: '/roles'
                    }
                ]
            });
        });

        it('should decode deeply nested menu structure', () => {
            const json = {
                key: 'admin',
                label: 'Administration',
                children: [
                    {
                        key: 'user-mgmt',
                        label: 'User Management',
                        children: [
                            {
                                key: 'create-user',
                                label: 'Create User',
                                path: '/admin/users/create'
                            }
                        ]
                    }
                ]
            };

            const result = menuItemsDecoder.verify(json);
            
            expect(result.children![0].children![0].key).toBe('create-user');
            expect(result.children![0].children![0].path).toBe('/admin/users/create');
        });

        it('should reject menu item without required key', () => {
            const json = {
                label: 'Invalid Item'
            };

            expect(() => menuItemsDecoder.verify(json)).toThrow();
        });

        it('should reject menu item without required label', () => {
            const json = {
                key: 'invalid'
            };

            expect(() => menuItemsDecoder.verify(json)).toThrow();
        });

        it('should reject menu item with invalid icon structure', () => {
            const json = {
                key: 'test',
                label: 'Test',
                icon: 'invalid-icon-string'
            };

            expect(() => menuItemsDecoder.verify(json)).toThrow();
        });
    });

    describe('menuMetaDecoder', () => {
        it('should decode valid menu meta with all properties', () => {
            const json = {
                menuItems: [
                    {
                        key: 'home',
                        label: 'Home',
                        path: '/'
                    },
                    {
                        key: 'about',
                        label: 'About',
                        path: '/about'
                    }
                ],
                event: {
                    onClick: '#this.handleMenuSelect'
                }
            };

            const result = menuMetaDecoder.verify(json);
            
            expect(result).toEqual({
                menuItems: [
                    {
                        key: 'home',
                        label: 'Home',
                        path: '/'
                    },
                    {
                        key: 'about',
                        label: 'About',
                        path: '/about'
                    }
                ],
                event: {
                    onClick: '#this.handleMenuSelect'
                }
            });
        });

        it('should decode empty menu meta', () => {
            const json = {};

            const result = menuMetaDecoder.verify(json);
            
            expect(result).toEqual({});
        });

        it('should decode menu meta with only menuItems', () => {
            const json = {
                menuItems: [
                    {
                        key: 'dashboard',
                        label: 'Dashboard'
                    }
                ]
            };

            const result = menuMetaDecoder.verify(json);
            
            expect(result.menuItems).toHaveLength(1);
            expect(result.menuItems![0].key).toBe('dashboard');
        });

        it('should decode menu meta with only event', () => {
            const json = {
                event: {
                    onClick: '#this.handleClick'
                }
            };

            const result = menuMetaDecoder.verify(json);
            
            expect(result.event).toEqual({
                onClick: '#this.handleClick'
            });
        });

        it('should decode complex menu structure with nested items and icons', () => {
            const json = {
                menuItems: [
                    {
                        key: 'main',
                        label: 'Main Navigation',
                        icon: {
                            name: 'MenuOutlined'
                        },
                        children: [
                            {
                                key: 'dashboard',
                                label: 'Dashboard',
                                path: '/dashboard',
                                icon: {
                                    name: 'DashboardOutlined',
                                    color: '#1890ff'
                                }
                            },
                            {
                                key: 'reports',
                                label: 'Reports',
                                children: [
                                    {
                                        key: 'sales',
                                        label: 'Sales Report',
                                        path: '/reports/sales'
                                    }
                                ]
                            }
                        ]
                    }
                ],
                event: {
                    onChange: '#this.trackMenuSelection'
                }
            };

            const result = menuMetaDecoder.verify(json);
            
            expect(result.menuItems).toHaveLength(1);
            expect(result.menuItems![0].children).toHaveLength(2);
            expect(result.menuItems![0].children![1].children).toHaveLength(1);
            expect(result.menuItems![0].children![0].icon?.color).toBe('#1890ff');
        });

        it('should reject menu meta with invalid menuItems array', () => {
            const json = {
                menuItems: [
                    {
                        // Missing required key and label
                        path: '/invalid'
                    }
                ]
            };

            expect(() => menuMetaDecoder.verify(json)).toThrow();
        });

        it('should reject menu meta with invalid event structure', () => {
            const json = {
                event: 'invalid-event-string'
            };

            expect(() => menuMetaDecoder.verify(json)).toThrow();
        });
    });
});
