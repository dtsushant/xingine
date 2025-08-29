import { 
    runAction, 
    ActionExecutionContext, 
    ActionContext, 
    ComponentStateStore,
    ActiveContentContext,
    SerializableAction 
} from '../../core/expressions';

describe('runAction - Hierarchical State Management for React Framework', () => {
    let mockGlobalContext: ActionContext;
    let mockContentContext: ActiveContentContext;
    let mockExecutionContext: ActionExecutionContext;
    let mockComponentStores: Map<string, ComponentStateStore>;
    let globalStateMap: Map<string, unknown>;
    let contentStateMap: Map<string, unknown>;
    let componentStateMaps: Map<string, Map<string, unknown>>;
    let mockNavigate: jest.Mock;
    let mockMakeApiCall: jest.Mock;
    let mockShowToast: jest.Mock;

    beforeEach(() => {
        // Reset state maps
        globalStateMap = new Map();
        contentStateMap = new Map();
        componentStateMaps = new Map();
        mockComponentStores = new Map();

        // Mock functions
        mockNavigate = jest.fn();
        mockMakeApiCall = jest.fn();
        mockShowToast = jest.fn();

        // Mock Global Context (page-wide state)
        mockGlobalContext = {
            setState: jest.fn((key: string, value: unknown) => {
                globalStateMap.set(key, value);
                console.log(`Global setState: ${key} = ${value}`);
            }),
            getState: jest.fn((key: string) => {
                const value = globalStateMap.get(key);
                console.log(`Global getState: ${key} = ${value}`);
                return value;
            }),
            getAllState: jest.fn(() => {
                const state: Record<string, unknown> = {};
                for (const [key, value] of globalStateMap.entries()) {
                    state[key] = value;
                }
                return state;
            }),
            navigate: mockNavigate,
            makeApiCall: mockMakeApiCall,
            setLocalStorage: jest.fn((key: string, value: unknown) => {
                console.log(`LocalStorage set: ${key} = ${value}`);
            }),
            getLocalStorage: jest.fn((key: string) => {
                console.log(`LocalStorage get: ${key}`);
                return null;
            }),
            removeLocalStorage: jest.fn(),
            clearLocalStorage: jest.fn(),
            showToast: mockShowToast,
            error: jest.fn((message: string, details?: unknown) => {
                console.error(`Error: ${message}`, details);
            }),
            dynamic: jest.fn(),
            logout: jest.fn()
        };

        // Helper to create component state store
        const createComponentStore = (componentId: string): ComponentStateStore => {
            if (!componentStateMaps.has(componentId)) {
                componentStateMaps.set(componentId, new Map());
            }
            const componentStateMap = componentStateMaps.get(componentId)!;

            return {
                componentId,
                setState: jest.fn((key: string, value: unknown) => {
                    componentStateMap.set(key, value);
                    console.log(`Component[${componentId}] setState: ${key} = ${value}`);
                }),
                getState: jest.fn((key: string) => {
                    const value = componentStateMap.get(key);
                    console.log(`Component[${componentId}] getState: ${key} = ${value}`);
                    return value;
                }),
                getAllState: jest.fn(() => {
                    const state: Record<string, unknown> = {};
                    for (const [key, value] of componentStateMap.entries()) {
                        state[key] = value;
                    }
                    return state;
                })
            };
        };

        // Mock Content Context (content area state)
        mockContentContext = {
            getComponentStateStore: jest.fn((componentId: string) => {
                if (!mockComponentStores.has(componentId)) {
                    const store = createComponentStore(componentId);
                    mockComponentStores.set(componentId, store);
                }
                return mockComponentStores.get(componentId)!;
            }),
            getContentState: jest.fn((key: string) => {
                const value = contentStateMap.get(key);
                console.log(`Content getState: ${key} = ${value}`);
                return value;
            }),
            setContentState: jest.fn((key: string, value: unknown) => {
                contentStateMap.set(key, value);
                console.log(`Content setState: ${key} = ${value}`);
            }),
            getAllContentState: jest.fn(() => {
                const state: Record<string, unknown> = {};
                for (const [key, value] of contentStateMap.entries()) {
                    state[key] = value;
                }
                return state;
            }),
            chainContext: {}
        };

        // Mock Execution Context (hierarchical combination)
        mockExecutionContext = {
            global: mockGlobalContext,
            content: mockContentContext
        };
    });

    describe('State Management Actions - Hierarchical Targeting', () => {
        test('setState with GLOBAL prefix should update global state', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'GLOBAL.userTheme',
                    value: 'dark'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockGlobalContext.setState).toHaveBeenCalledWith('userTheme', 'dark');
            expect(globalStateMap.get('userTheme')).toBe('dark');
        });

        test('setState with CONTENT prefix should update content state', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'CONTENT.pageTitle',
                    value: 'Dashboard',
                    componentId: 'main-content'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockContentContext.setContentState).toHaveBeenCalledWith('pageTitle', 'Dashboard');
            expect(contentStateMap.get('pageTitle')).toBe('Dashboard');
        });

        test('setState without prefix should update component state', async () => {
            const componentId = 'button-123';
            const action: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isLoading',
                    value: true,
                    componentId
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            const componentStore = mockComponentStores.get(componentId);
            expect(componentStore?.setState).toHaveBeenCalledWith('isLoading', true);
            expect(componentStateMaps.get(componentId)?.get('isLoading')).toBe(true);
        });

        test('getState with GLOBAL prefix should retrieve global state', async () => {
            // Setup global state
            globalStateMap.set('currentUser', { name: 'John Doe', role: 'admin' });

            const action: SerializableAction = {
                action: 'getState',
                args: {
                    key: 'GLOBAL.currentUser',
                    stateKey: 'retrievedUser'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockGlobalContext.getState).toHaveBeenCalledWith('currentUser');
            expect(result?.result).toEqual({ name: 'John Doe', role: 'admin' });
        });

        test('getState with CONTENT prefix should retrieve content state', async () => {
            // Setup content state
            contentStateMap.set('currentPage', 'users');

            const action: SerializableAction = {
                action: 'getState',
                args: {
                    key: 'CONTENT.currentPage',
                    componentId: 'nav-component'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockContentContext.getContentState).toHaveBeenCalledWith('currentPage');
            expect(result?.result).toBe('users');
        });

        test('toggleState with GLOBAL prefix should toggle global boolean state', async () => {
            // Setup initial state
            globalStateMap.set('sidebarOpen', true);

            const action: SerializableAction = {
                action: 'toggleState',
                args: {
                    key: 'GLOBAL.sidebarOpen'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockGlobalContext.setState).toHaveBeenCalledWith('sidebarOpen', false);
            expect((result?.result as any)?.value).toBe(false);
        });

        test('toggleState with CONTENT prefix should toggle content boolean state', async () => {
            // Mock content state retrieval and setting
            const mockContentGetState = jest.fn().mockReturnValue(false);
            const mockContentSetState = jest.fn();
            
            mockContentContext.getContentState = mockContentGetState;
            mockContentContext.setContentState = mockContentSetState;

            const action: SerializableAction = {
                action: 'toggleState',
                args: {
                    key: 'CONTENT.modalVisible',
                    componentId: 'modal-container'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockContentGetState).toHaveBeenCalledWith('modalVisible');
            expect(mockContentSetState).toHaveBeenCalledWith('modalVisible', true);
        });
    });

    describe('Component State Isolation', () => {
        test('multiple components should have isolated state', async () => {
            const buttonId1 = 'button-primary';
            const buttonId2 = 'button-secondary';

            // Set state for first button
            const action1: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isPressed',
                    value: true,
                    componentId: buttonId1
                }
            };

            // Set different state for second button
            const action2: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isPressed',
                    value: false,
                    componentId: buttonId2
                }
            };

            await runAction(action1, mockExecutionContext);
            await runAction(action2, mockExecutionContext);

            // Verify isolation
            const store1 = mockComponentStores.get(buttonId1);
            const store2 = mockComponentStores.get(buttonId2);

            expect(componentStateMaps.get(buttonId1)?.get('isPressed')).toBe(true);
            expect(componentStateMaps.get(buttonId2)?.get('isPressed')).toBe(false);
            expect(store1?.setState).toHaveBeenCalledWith('isPressed', true);
            expect(store2?.setState).toHaveBeenCalledWith('isPressed', false);
        });

        test('component state should not affect global or content state', async () => {
            const componentId = 'isolated-component';

            const action: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'localValue',
                    value: 'component-specific',
                    componentId
                }
            };

            await runAction(action, mockExecutionContext);

            // Verify component state was set
            expect(componentStateMaps.get(componentId)?.get('localValue')).toBe('component-specific');

            // Verify global and content state remain unchanged
            expect(globalStateMap.has('localValue')).toBe(false);
            expect(contentStateMap.has('localValue')).toBe(false);
            expect(mockGlobalContext.setState).not.toHaveBeenCalled();
            expect(mockContentContext.setContentState).not.toHaveBeenCalled();
        });
    });

    describe('React Framework Integration', () => {
        test('should handle React component lifecycle events', async () => {
            const componentId = 'form-component';

            // Simulate onInit event
            const initAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isInitialized',
                    value: true,
                    componentId
                }
            };

            // Simulate onSubmit event
            const submitAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isSubmitting',
                    value: true,
                    componentId
                }
            };

            await runAction(initAction, mockExecutionContext);
            await runAction(submitAction, mockExecutionContext);

            const componentMap = componentStateMaps.get(componentId);
            expect(componentMap?.get('isInitialized')).toBe(true);
            expect(componentMap?.get('isSubmitting')).toBe(true);
        });

        test('should handle navigation actions for React Router', async () => {
            const action: SerializableAction = {
                action: 'navigate',
                args: {
                    path: '/dashboard/users'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard/users');
        });

        test('should handle API calls with global context', async () => {
            mockMakeApiCall.mockResolvedValue({ users: [], total: 0 });

            const action: SerializableAction = {
                action: 'makeApiCall',
                args: {
                    url: '/api/users',
                    method: 'GET'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockMakeApiCall).toHaveBeenCalledWith({
                url: '/api/users',
                method: 'GET'
            });
        });

        test('should handle toast notifications', async () => {
            const action: SerializableAction = {
                action: 'showToast',
                args: {
                    message: 'User saved successfully',
                    type: 'success'
                }
            };

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(mockShowToast).toHaveBeenCalledWith('User saved successfully', 'success');
        });
    });

    describe('Complex React Scenarios', () => {
        test('should handle form submission with validation and API call', async () => {
            const formComponentId = 'user-form';

            // Step 1: Set form as submitting
            const setSubmittingAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isSubmitting',
                    value: true,
                    componentId: formComponentId
                }
            };

            // Step 2: Validate and set errors (content level)
            const setErrorsAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'CONTENT.formErrors',
                    value: { email: 'Invalid email format' }
                }
            };

            // Step 3: Mock API call
            mockMakeApiCall.mockResolvedValue({ success: true, userId: 123 });
            const apiAction: SerializableAction = {
                action: 'makeApiCall',
                args: {
                    url: '/api/users',
                    method: 'POST',
                    body: { email: 'test@example.com', name: 'Test User' }
                }
            };

            // Step 4: Update global user state
            const updateUserAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'GLOBAL.currentUser',
                    value: { id: 123, email: 'test@example.com', name: 'Test User' }
                }
            };

            // Execute sequence
            await runAction(setSubmittingAction, mockExecutionContext);
            await runAction(setErrorsAction, mockExecutionContext);
            await runAction(apiAction, mockExecutionContext);
            await runAction(updateUserAction, mockExecutionContext);

            // Verify all states
            expect(componentStateMaps.get(formComponentId)?.get('isSubmitting')).toBe(true);
            expect(contentStateMap.get('formErrors')).toEqual({ email: 'Invalid email format' });
            expect(globalStateMap.get('currentUser')).toEqual({ 
                id: 123, 
                email: 'test@example.com', 
                name: 'Test User' 
            });
            expect(mockMakeApiCall).toHaveBeenCalledWith({
                url: '/api/users',
                method: 'POST',
                body: { email: 'test@example.com', name: 'Test User' }
            });
        });

        test('should handle nested component interactions', async () => {
            const parentComponentId = 'dashboard-layout';
            const childComponentId = 'user-list';
            const grandchildComponentId = 'user-item-123';

            // Parent component sets loading state
            const parentAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isLoading',
                    value: true,
                    componentId: parentComponentId
                }
            };

            // Child component receives data and updates
            const childAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'users',
                    value: [{ id: 123, name: 'John Doe' }],
                    componentId: childComponentId
                }
            };

            // Grandchild component updates individual user
            const grandchildAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isSelected',
                    value: true,
                    componentId: grandchildComponentId
                }
            };

            // Content-level state for selected items
            const contentAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'CONTENT.selectedUserIds',
                    value: [123]
                }
            };

            await runAction(parentAction, mockExecutionContext);
            await runAction(childAction, mockExecutionContext);
            await runAction(grandchildAction, mockExecutionContext);
            await runAction(contentAction, mockExecutionContext);

            // Verify isolated states
            expect(componentStateMaps.get(parentComponentId)?.get('isLoading')).toBe(true);
            expect(componentStateMaps.get(childComponentId)?.get('users')).toEqual([{ id: 123, name: 'John Doe' }]);
            expect(componentStateMaps.get(grandchildComponentId)?.get('isSelected')).toBe(true);
            expect(contentStateMap.get('selectedUserIds')).toEqual([123]);

            // Verify other components are not affected
            expect(componentStateMaps.get(parentComponentId)?.has('users')).toBe(false);
            expect(componentStateMaps.get(childComponentId)?.has('isSelected')).toBe(false);
        });

        test('should handle component unmounting scenario', async () => {
            const componentId = 'temporary-modal';

            // Component sets up initial state
            const setupAction: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'isVisible',
                    value: true,
                    componentId
                }
            };

            await runAction(setupAction, mockExecutionContext);

            // Verify component store exists
            expect(mockComponentStores.has(componentId)).toBe(true);
            expect(componentStateMaps.get(componentId)?.get('isVisible')).toBe(true);

            // Simulate component unmounting (cleanup would happen in React useEffect cleanup)
            // The state remains in our mock but in real React, this would be garbage collected
            mockComponentStores.delete(componentId);
            componentStateMaps.delete(componentId);

            // Verify cleanup
            expect(mockComponentStores.has(componentId)).toBe(false);
            expect(componentStateMaps.has(componentId)).toBe(false);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle missing component store gracefully', async () => {
            const action: SerializableAction = {
                action: 'setState',
                args: {
                    key: 'someKey',
                    value: 'someValue',
                    componentId: 'non-existent-component'
                }
            };

            // Mock getComponentStateStore to throw error for non-existent component
            mockContentContext.getComponentStateStore = jest.fn().mockImplementation(() => {
                throw new Error('Component store not found for componentId: non-existent-component');
            });

            const result = await runAction(action, mockExecutionContext);

            expect(result?.success).toBe(false);
            expect(result?.error).toBeInstanceOf(Error);
        });

        test('should handle invalid action gracefully', async () => {
            const action: SerializableAction = {
                action: 'invalidAction' as any,
                args: {}
            };

            // Remove dynamic method to ensure invalid action fails
            const contextWithoutDynamic = {
                ...mockExecutionContext,
                global: {
                    ...mockGlobalContext,
                    dynamic: undefined
                }
            };

            const result = await runAction(action, contextWithoutDynamic);

            expect(result?.success).toBe(false);
            expect(result?.error).toBeInstanceOf(Error);
            expect((result?.error as Error).message).toContain('Unknown action: invalidAction');
        });

        test('should handle undefined action', async () => {
            const result = await runAction(undefined, mockExecutionContext);

            expect(result?.success).toBe(true);
            expect(result?.result).toBeUndefined();
        });
    });

    describe('Performance Optimization Scenarios', () => {
        test('should demonstrate state isolation benefits', async () => {
            const components = Array.from({ length: 100 }, (_, i) => `component-${i}`);

            // Update 100 components simultaneously
            const actions = components.map((componentId, index) => ({
                action: 'setState' as const,
                args: {
                    key: 'value',
                    value: index,
                    componentId
                }
            }));

            // Execute all actions
            const results = await Promise.all(
                actions.map(action => runAction(action, mockExecutionContext))
            );

            // Verify all succeeded
            expect(results.every(result => result?.success)).toBe(true);

            // Verify each component has its own isolated state
            components.forEach((componentId, index) => {
                expect(componentStateMaps.get(componentId)?.get('value')).toBe(index);
            });

            // Verify global and content state remain clean
            expect(globalStateMap.size).toBe(0);
            expect(contentStateMap.size).toBe(0);
        });

        test('should handle rapid state updates without conflicts', async () => {
            const componentId = 'rapid-updates-component';

            // Simulate rapid state updates
            const updates = Array.from({ length: 10 }, (_, i) => ({
                action: 'setState' as const,
                args: {
                    key: 'counter',
                    value: i,
                    componentId
                }
            }));

            // Execute updates rapidly
            await Promise.all(updates.map(action => runAction(action, mockExecutionContext)));

            // Verify final state (last update should win)
            expect(componentStateMaps.get(componentId)?.get('counter')).toBe(9);
        });
    });
});
