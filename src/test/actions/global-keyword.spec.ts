import {
    ActionExecutionContext,
    ActionContext,
    ActiveContentContext,
    ComponentStateStore,
    runAction,
    SerializableAction
} from "../../core/expressions";

describe('GLOBAL Keyword Implementation', () => {
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

        // Mock global context with makeApiCall
        mockGlobalContext = {
            getAllState: jest.fn(() => Object.fromEntries(mockStateMap)),
            getState: jest.fn((key: string) => mockStateMap.get(`global_${key}`)),
            setState: jest.fn((key: string, value: unknown) => {
                mockStateMap.set(`global_${key}`, value);
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
            showToast: jest.fn()
        } as any;

        // Add makeApiCall method
        (mockGlobalContext as any).makeApiCall = jest.fn();

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

        // Create execution context with correct structure
        executionContext = {
            global: mockGlobalContext,
            content: mockActiveContentContext
        };
    });

    it('should set component state when componentId is specified', async () => {
        const action: SerializableAction = {
            action: 'setState',
            args: {
                key: 'userMode',
                value: 'dark',
                componentId: 'test-component'
            }
        };

        await runAction(action, executionContext);

        expect(mockComponentStore.setState).toHaveBeenCalledWith('userMode', 'dark');
        expect(mockStateMap.get('comp_userMode')).toBe('dark');
        expect(mockGlobalContext.setState).not.toHaveBeenCalled();
    });

    it('should set global state with GLOBAL. prefix', async () => {
        const action: SerializableAction = {
            action: 'setState',
            args: {
                key: 'GLOBAL.appTheme',
                value: 'dark'
            }
        };

        await runAction(action, executionContext);

        expect(mockGlobalContext.setState).toHaveBeenCalledWith('appTheme', 'dark');
        expect(mockStateMap.get('global_appTheme')).toBe('dark');
        expect(mockComponentStore.setState).not.toHaveBeenCalled();
    });

    // Core GLOBAL keyword functionality tests completed above

    it('should toggle component state when componentId is specified', async () => {
        // Set up initial component state
        mockStateMap.set('comp_isVisible', false);

        const action: SerializableAction = {
            action: 'toggleState',
            args: {
                key: 'isVisible',
                componentId: 'test-component'
            }
        };

        await runAction(action, executionContext);

        expect(mockComponentStore.setState).toHaveBeenCalledWith('isVisible', true);
        expect(mockGlobalContext.setState).not.toHaveBeenCalled();
    });

    it('should toggle global state with GLOBAL. prefix', async () => {
        // Set up initial global state
        mockStateMap.set('global_debugMode', false);

        const action: SerializableAction = {
            action: 'toggleState',
            args: {
                key: 'GLOBAL.debugMode'
            }
        };

        await runAction(action, executionContext);

        expect(mockGlobalContext.setState).toHaveBeenCalledWith('debugMode', true);
        expect(mockComponentStore.setState).not.toHaveBeenCalled();
    });

    it('should handle makeApiCall through global context regardless of component context', async () => {
        const mockApiResponse = { success: true, data: { message: 'API Success' } };
        (mockGlobalContext as any).makeApiCall.mockResolvedValue(mockApiResponse);

        const action: SerializableAction = {
            action: 'makeApiCall',
            args: {
                url: '/api/test',
                method: 'GET'
            }
        };

        const result = await runAction(action, executionContext);

        expect((mockGlobalContext as any).makeApiCall).toHaveBeenCalledWith({
            url: '/api/test',
            method: 'GET'
        });
        expect(result).toEqual({
            success: true,
            result: mockApiResponse
        });
    });
});
