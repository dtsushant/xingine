import {
    ActionExecutionContext,
    ActionContext,
    ActiveContentContext,
    ComponentStateStore,
    runAction,
    SerializableAction,
    ConditionalChain,
    ActionResult
} from "../../core/expressions";
import {ActionBuilder, Actions, ChainBuilder, ConditionBuilder} from "../../core/builder";

// Helper function to create success condition
const onSuccess = (): ConditionalChain['condition'] => ({
    field: '__success',
    operator: 'eq',
    value: true
});

// Helper function to create error condition  
const onError = (): ConditionalChain['condition'] => ({
    field: '__hasError',
    operator: 'eq', 
    value: true
});

describe('New runAction Implementation with Dual Context', () => {
    let mockGlobalContext: ActionContext;
    let mockActiveContentContext: ActiveContentContext;
    let mockComponentStore: ComponentStateStore;
    let executionContext: ActionExecutionContext;
    let mockStateMap: Map<string, unknown>;
    let mockLocalStorageMap: Map<string, unknown>;

    beforeEach(() => {
        // Mock state storage
        mockStateMap = new Map();
        mockLocalStorageMap = new Map();

        // Mock global context
        mockGlobalContext = {
            getAllState: jest.fn(() => Object.fromEntries(mockStateMap)),
            getState: jest.fn((key: string) => mockStateMap.get(key)),
            setState: jest.fn((key: string, value: unknown) => {
                mockStateMap.set(key, value);
            }),
            navigate: jest.fn(),
            setLocalStorage: jest.fn((key: string, value: unknown) => {
                mockLocalStorageMap.set(key, value);
            }),
            getLocalStorage: jest.fn((key: string) => mockLocalStorageMap.get(key) as string || null),
            removeLocalStorage: jest.fn((key: string) => {
                mockLocalStorageMap.delete(key);
            }),
            clearLocalStorage: jest.fn(() => {
                mockLocalStorageMap.clear();
            }),
            showToast: jest.fn(),
            makeApiCall: jest.fn() // Add makeApiCall for testing
        } as ActionContext & { makeApiCall: jest.Mock };

        // Mock component state store
        mockComponentStore = {
            componentId: 'test-component',
            getState: jest.fn((key: string) => mockStateMap.get(`comp_${key}`)),
            setState: jest.fn((key: string, value: unknown) => {
                mockStateMap.set(`comp_${key}`, value);
            }),
            getAllState: jest.fn(() => {
                const compState: Record<string, unknown> = {};
                for (const [key, value] of mockStateMap.entries()) {
                    if (key.startsWith('comp_')) {
                        compState[key.substring(5)] = value;
                    }
                }
                return compState;
            })
        };

        // Mock active content context
        mockActiveContentContext = {
            event: undefined,
            chainContext: undefined,
            getComponentStateStore: jest.fn(() => mockComponentStore)
        };

        // Create execution context
        executionContext = {
            global: mockGlobalContext,
            content: mockActiveContentContext
        };
    });

    describe('Basic Action Execution', () => {

        it('Login working sample ', async () => {
            // Mock API response with user data
            const mockApiResponse = {
                success: true,
                user: {
                    name: 'Alice',
                    age: 30,
                    email: 'alice@example.com',
                    profile: {
                        bio: 'Software Developer',
                        avatar: 'https://example.com/avatar.jpg'
                    },
                    preferences: {
                        theme: 'dark',
                        language: 'en'
                    }
                },
                token: 'jwt-token-12345'
            };


            mockGlobalContext.makeApiCall = jest.fn().mockResolvedValue(mockApiResponse);

            mockGlobalContext.setLocalStorage = jest.fn((key: string, value: unknown) => {
                mockLocalStorageMap.set(key, value);
            });

            /*const sample:SerializableAction = {
                action: 'makeApiCall',
                args: { url: '/api/user', method: 'GET' },
                then: [
                    {
                        action: 'setLocalStorage',
                        args: {key: 'token', value: 'result.token'}
                    },
                    {
                        action: 'setLocalStorage',
                        args: {key: 'name', value: 'result.user.name'}
                    }
                ]
            }*/
            const sample:SerializableAction = ActionBuilder.create('makeApiCall')
                .withArgs({ url: '/api/user', method: 'GET' })
                .withChains(ChainBuilder.create()
                    .whenCondition(ConditionBuilder
                        .field('__result.success')
                        .equals(true)
                    )
                    .thenActionBuilders(
                        Actions.setStorage('token','__result.token'),
                        Actions.navigate('/'),

                    )
                    .build())
                .build();
            console.log("the sample action is ", JSON.stringify(sample, null, 2));
            const res = await runAction(sample, executionContext);
            console.log("the result here is ", res);
            console.log("the localstorage here is ", JSON.stringify(Object.fromEntries(mockLocalStorageMap),null,2));
            console.log("the state here is ", JSON.stringify(Object.fromEntries(mockStateMap),null,2));

            //      console.log("resolve path", resolvePath(res, 'result'));
        });
        it('should execute navigate action using global context', async () => {
            const action: SerializableAction = {
                action: 'navigate',
                args: { path: '/dashboard' }
            };

            await runAction(action, executionContext);

            expect(mockGlobalContext.navigate).toHaveBeenCalledWith('/dashboard');
        });

        it('should execute setState with global context by default', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'userName', value: 'Alice' }
            };

            await runAction(action, executionContext);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('userName', 'Alice');
            expect(mockStateMap.get('userName')).toBe('Alice');
        });

        it('should execute setState with component context when componentId is specified', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'userName', value: 'Bob', componentId: 'userCard' }
            };

            await runAction(action, executionContext);

            expect(mockComponentStore.setState).toHaveBeenCalledWith('userName', 'Bob');
            expect(mockStateMap.get('comp_userName')).toBe('Bob');
        });

        it('should execute makeApiCall with global store regardless of componentId', async () => {
            const mockApiResponse = { success: true, data: { id: 1, name: 'Alice' } };
            (mockGlobalContext as any).makeApiCall.mockResolvedValue(mockApiResponse);

            const action: SerializableAction = {
                action: 'makeApiCall',
                args: { 
                    url: '/api/user/1', 
                    method: 'GET',
                    componentId: 'userProfile'
                }
            };

            const result = await runAction(action, executionContext);

            expect((mockGlobalContext as any).makeApiCall).toHaveBeenCalledWith({
                url: '/api/user/1',
                method: 'GET',
                componentId: 'userProfile'
            });
            expect(result).toEqual({
                success: true,
                result: mockApiResponse
            });
        });
    });

    describe('Path Resolution with New Context Structure', () => {
        it('should resolve __global.* paths from global state', async () => {
            // Set up global state
            mockStateMap.set('currentUser', 'Alice');

            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'displayName', value: '__global.currentUser' }
            };

            // Set up chain context to trigger path resolution
            const chainContext = {
                result: { token: 'jwt-123' },
                success: true
            };

            await runAction(action, executionContext, undefined, chainContext);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('displayName', 'Alice');
        });

        it('should resolve __current.* paths from component state', async () => {
            // Set up component state
            mockStateMap.set('comp_userRole', 'admin');

            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'accessLevel', value: '__current.userRole', componentId: 'dashboard' }
            };

            // Set up chain context to trigger path resolution
            const chainContext = {
                result: { token: 'jwt-123' },
                success: true
            };

            await runAction(action, executionContext, undefined, chainContext);

            expect(mockComponentStore.setState).toHaveBeenCalledWith('accessLevel', 'admin');
        });

        it('should resolve __result.* paths from chain context', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'authToken', value: '__result.token' }
            };

            // Set up chain context with result data
            const chainContext = {
                result: { 
                    token: 'jwt-token-12345',
                    user: { name: 'Alice', role: 'admin' }
                },
                success: true
            };

            await runAction(action, executionContext, undefined, chainContext);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('authToken', 'jwt-token-12345');
        });

        it('should resolve legacy result.* paths for backward compatibility', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'userEmail', value: 'result.user.email' }
            };

            // Set up chain context with result data
            const chainContext = {
                result: { 
                    user: { 
                        name: 'Alice', 
                        email: 'alice@example.com',
                        role: 'admin' 
                    }
                },
                success: true
            };

            await runAction(action, executionContext, undefined, chainContext);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('userEmail', 'alice@example.com');
        });

        it('should handle nested path resolution correctly', async () => {
            const action: SerializableAction = {
                action: 'setLocalStorage',
                args: { key: 'userPreferences', value: '__result.user.profile.preferences' }
            };

            const chainContext = {
                result: { 
                    user: { 
                        profile: {
                            preferences: { theme: 'dark', language: 'en' }
                        }
                    }
                },
                success: true
            };

            await runAction(action, executionContext, undefined, chainContext);

            expect(mockGlobalContext.setLocalStorage).toHaveBeenCalledWith('userPreferences', { theme: 'dark', language: 'en' });
        });

        it('should return undefined for missing paths gracefully', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'missingData', value: 'result.nonexistent.path' }
            };

            const chainContext = {
                result: { user: { name: 'Alice' } },
                success: true
            };

            await runAction(action, executionContext, undefined, chainContext);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('missingData', undefined);
        });
    });

    describe('Component Isolation', () => {
        it('should maintain separate state between components', async () => {
            const mockComponent1Store = {
                getState: jest.fn(),
                setState: jest.fn(),
                getAllState: jest.fn(() => ({ comp1Data: 'value1' })),
                makeApiCall: jest.fn()
            };

            const mockComponent2Store = {
                getState: jest.fn(),
                setState: jest.fn(),
                getAllState: jest.fn(() => ({ comp2Data: 'value2' })),
                makeApiCall: jest.fn()
            };

            // Mock different component stores
            (mockActiveContentContext.getComponentStateStore as jest.Mock).mockImplementation((componentId: string) => {
                if (componentId === 'component1') return mockComponent1Store;
                if (componentId === 'component2') return mockComponent2Store;
                return mockComponentStore;
            });

            // Action for component 1
            const action1: SerializableAction = {
                action: 'setState',
                args: { key: 'data', value: 'component1Value', componentId: 'component1' }
            };

            // Action for component 2
            const action2: SerializableAction = {
                action: 'setState',
                args: { key: 'data', value: 'component2Value', componentId: 'component2' }
            };

            await runAction(action1, executionContext);
            await runAction(action2, executionContext);

            expect(mockComponent1Store.setState).toHaveBeenCalledWith('data', 'component1Value');
            expect(mockComponent2Store.setState).toHaveBeenCalledWith('data', 'component2Value');
            expect(mockComponent1Store.setState).not.toHaveBeenCalledWith('data', 'component2Value');
            expect(mockComponent2Store.setState).not.toHaveBeenCalledWith('data', 'component1Value');
        });

        it('should allow components to access their own state via __current.* paths', async () => {
            const mockUserCardStore = {
                getState: jest.fn(),
                setState: jest.fn(),
                getAllState: jest.fn(() => ({ userId: '123', userName: 'Alice' })),
                makeApiCall: jest.fn()
            };

            (mockActiveContentContext.getComponentStateStore as jest.Mock).mockImplementation((componentId: string) => {
                if (componentId === 'userCard') return mockUserCardStore;
                return mockComponentStore;
            });

            const action: SerializableAction = {
                action: 'setState',
                args: { 
                    key: 'displayText', 
                    value: '__current.userName',
                    componentId: 'userCard'
                }
            };

            const chainContext = {
                result: { token: 'jwt-123' },
                success: true
            };

            await runAction(action, executionContext, undefined, chainContext);

            expect(mockUserCardStore.setState).toHaveBeenCalledWith('displayText', 'Alice');
        });
    });

    describe('Conditional Chains with Dual Context', () => {
        it('should execute conditional chains based on API results', async () => {
            const mockApiResponse = {
                success: true,
                user: { name: 'Alice', role: 'admin', token: 'jwt-admin-123' }
            };

            ((mockGlobalContext as any).makeApiCall as jest.Mock).mockResolvedValue(mockApiResponse);

            const action: SerializableAction = {
                action: 'makeApiCall',
                args: { url: '/api/login', method: 'POST', body: { username: 'alice', password: 'pass' } },
                chains: [
                    {
                        condition: {
                            field: '__result.user.role',
                            operator: 'eq',
                            value: 'admin'
                        },
                        action: [
                            {
                                action: 'setState',
                                args: { key: 'isAdmin', value: true }
                            },
                            {
                                action: 'setLocalStorage',
                                args: { key: 'adminToken', value: '__result.user.token' }
                            }
                        ]
                    }
                ]
            };

            await runAction(action, executionContext);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('isAdmin', true);
            expect(mockGlobalContext.setLocalStorage).toHaveBeenCalledWith('adminToken', 'jwt-admin-123');
        });

        it('should execute then actions with proper context propagation', async () => {
            const mockApiResponse = {
                success: true,
                data: { id: 1, name: 'Alice', email: 'alice@example.com' }
            };

            ((mockGlobalContext as any).makeApiCall as jest.Mock).mockResolvedValue(mockApiResponse);

            const action: SerializableAction = {
                action: 'makeApiCall',
                args: { url: '/api/user/profile' },
                then: [
                    {
                        action: 'setState',
                        args: { key: 'userName', value: 'result.data.name' }
                    },
                    {
                        action: 'setState',
                        args: { key: 'userEmail', value: 'result.data.email' }
                    },
                    {
                        action: 'setLocalStorage',
                        args: { key: 'lastProfileFetch', value: 'result.data.id' }
                    }
                ]
            };

            await runAction(action, executionContext);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('userName', 'Alice');
            expect(mockGlobalContext.setState).toHaveBeenCalledWith('userEmail', 'alice@example.com');
            expect(mockGlobalContext.setLocalStorage).toHaveBeenCalledWith('lastProfileFetch', 1);
        });
    });

    describe('Error Handling with Dual Context', () => {
        it('should handle API errors and execute error chains', async () => {
            const mockApiError = new Error('Network error');
            ((mockGlobalContext as any).makeApiCall as jest.Mock).mockRejectedValue(mockApiError);

            const action: SerializableAction = {
                action: 'makeApiCall',
                args: { url: '/api/failing-endpoint' },
                chains: [
                    {
                        condition: onError(),
                        action: [
                            {
                                action: 'error',
                                args: { message: 'API call failed' }
                            },
                            {
                                action: 'setState',
                                args: { key: 'hasError', value: true }
                            }
                        ]
                    }
                ]
            };

            const result = await runAction(action, executionContext);

            expect(result?.success).toBe(false);
            expect(result?.error).toBe(mockApiError);
            expect(mockGlobalContext.setState).toHaveBeenCalledWith('hasError', true);
        });

        it('should handle component-level errors without affecting global state', async () => {
            const mockComponent1Store = {
                getState: jest.fn(),
                setState: jest.fn(),
                getAllState: jest.fn(() => ({})),
                makeApiCall: jest.fn().mockRejectedValue(new Error('Component API error'))
            };

            (mockActiveContentContext.getComponentStateStore as jest.Mock).mockImplementation((componentId: string) => {
                if (componentId === 'errorComponent') return mockComponent1Store;
                return mockComponentStore;
            });

            const action: SerializableAction = {
                action: 'makeApiCall',
                args: { 
                    url: '/api/component-data',
                    componentId: 'errorComponent'
                },
                chains: [
                    {
                        condition: onError(),
                        action: [
                            {
                                action: 'setState',
                                args: { 
                                    key: 'componentError', 
                                    value: true,
                                    componentId: 'errorComponent'
                                }
                            }
                        ]
                    }
                ]
            };

            await runAction(action, executionContext);

            // Component should handle its own error
            expect(mockComponent1Store.setState).toHaveBeenCalledWith('componentError', true);
            // Global state should not be affected
            expect(mockGlobalContext.setState).not.toHaveBeenCalledWith('componentError', true);
        });
    });

    describe('Event Handling with Dual Context', () => {
        it('should handle valueFromEvent with new context structure', async () => {
            const mockEvent = {
                target: { value: 'User input text' }
            };

            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'inputValue', componentId: 'inputComponent' },
                valueFromEvent: true
            };

            await runAction(action, executionContext, mockEvent);

            expect(mockComponentStore.setState).toHaveBeenCalledWith('inputValue', 'User input text');
        });

        it('should propagate events through action chains', async () => {
            const mockEvent = {
                target: { value: 'search query' }
            };

            const action: SerializableAction = {
                action: 'setState',
                args: { key: 'searchTerm' },
                valueFromEvent: true,
                then: [
                    {
                        action: 'makeApiCall',
                        args: { 
                            url: '/api/search',
                            method: 'POST',
                            body: { query: '__global.searchTerm' }
                        }
                    }
                ]
            };

            // Mock the API call to verify it receives the search term
            (mockGlobalContext as any).makeApiCall.mockImplementation((params: any) => {
                // The API call should have access to the updated global state
                expect(params.body.query).toBe('search query');
                return Promise.resolve({ results: [] });
            });

            await runAction(action, executionContext, mockEvent);

            expect(mockGlobalContext.setState).toHaveBeenCalledWith('searchTerm', 'search query');
        });
    });

    describe('Dynamic Actions with Dual Context', () => {
        it('should handle dynamic actions through global context', async () => {
            const mockDynamic = jest.fn().mockResolvedValue({ customResult: 'success' });
            (mockGlobalContext as any).dynamic = mockDynamic;

            const action: SerializableAction = {
                action: 'customDynamicAction',
                args: { data: 'test', componentId: 'dynamicComponent' },
                chains: [
                    {
                        condition: onSuccess(),
                        action: [
                            {
                                action: 'setState',
                                args: { 
                                    key: 'dynamicResult', 
                                    value: 'Dynamic action completed',
                                    componentId: 'dynamicComponent'
                                }
                            }
                        ]
                    }
                ]
            };

            await runAction(action, executionContext);

            expect(mockDynamic).toHaveBeenCalledWith('customDynamicAction', { data: 'test', componentId: 'dynamicComponent' }, undefined);
            expect(mockComponentStore.setState).toHaveBeenCalledWith('dynamicResult', 'Dynamic action completed');
        });
    });

    describe('Complex Integration Scenarios', () => {
        it('should handle complex multi-component workflow', async () => {
            // Set up multiple component stores
            const headerStore = {
                setState: jest.fn(),
                getState: jest.fn(),
                getAllState: jest.fn(() => ({ userRole: 'admin' })),
                makeApiCall: jest.fn()
            };

            const sidebarStore = {
                setState: jest.fn(),
                getState: jest.fn(),
                getAllState: jest.fn(() => ({ expanded: true })),
                makeApiCall: jest.fn()
            };

            (mockActiveContentContext.getComponentStateStore as jest.Mock).mockImplementation((componentId: string) => {
                if (componentId === 'header') return headerStore;
                if (componentId === 'sidebar') return sidebarStore;
                return mockComponentStore;
            });

            // Mock API response
            const loginResponse = {
                success: true,
                user: { name: 'Alice', role: 'admin', permissions: ['read', 'write', 'admin'] }
            };
            ((mockGlobalContext as any).makeApiCall as jest.Mock).mockResolvedValue(loginResponse);

            const loginAction: SerializableAction = {
                action: 'makeApiCall',
                args: { url: '/api/login', method: 'POST' },
                then: [
                    // Update global user state
                    {
                        action: 'setState',
                        args: { key: 'currentUser', value: 'result.user' }
                    },
                    // Update header component
                    {
                        action: 'setState',
                        args: { 
                            key: 'userDisplayName', 
                            value: 'result.user.name',
                            componentId: 'header'
                        }
                    },
                    // Update sidebar based on role
                    {
                        action: 'setState',
                        args: { 
                            key: 'showAdminPanel', 
                            value: '__global.currentUser',
                            componentId: 'sidebar'
                        }
                    }
                ]
            };

            await runAction(loginAction, executionContext);

            // Verify global state update
            expect(mockGlobalContext.setState).toHaveBeenCalledWith('currentUser', loginResponse.user);
            
            // Verify component-specific updates
            expect(headerStore.setState).toHaveBeenCalledWith('userDisplayName', 'Alice');
            expect(sidebarStore.setState).toHaveBeenCalledWith('showAdminPanel', loginResponse.user);
        });
    });
});
