// complete test for file xingine.utils

import {extrapolate, getActionRef, getTypedValue} from "../../core/utils/type";
import {SerializableAction} from "../../core/expressions/action";

describe("Xingine-utils",()=>{
    it("getTypedValueTest return proper Value",()=>{
        const meta: { [key: string]: unknown } = {
            showMeta: true,
            title: "Component"
        };
        const showMeta = getTypedValue<boolean>(meta, "showMeta");
        expect(showMeta).toBe(true);
    })
})

describe('extrapolate', () => {
    const context = {
        user: {
            name: 'Alice',
            profile: {
                email: 'alice@example.com'
            }
        },
        balance: 150,
        items: [
            { name: 'Item A', price: 10 },
            { name: 'Item B', price: 20 }
        ]
    };

    it('replaces simple keys', () => {
        const result = extrapolate('User: #{user.name}, Balance: #{balance}', context);
        expect(result).toBe('User: Alice, Balance: 150');
    });

    it('replaces nested keys', () => {
        const result = extrapolate('Email: #{user.profile.email}', context);
        expect(result).toBe('Email: alice@example.com');
    });

    it('replaces array values', () => {
        const result = extrapolate('First item: #{items[0].name}, Price: #{items[0].price}', context);
        expect(result).toBe('First item: Item A, Price: 10');
    });

    it('handles missing keys gracefully', () => {
        const result = extrapolate('Missing: #{user.age}, Deep: #{user.profile.age}', context);
        expect(result).toBe('Missing: undefined, Deep: undefined');
    });

    it('handles invalid array index', () => {
        const result = extrapolate('Out of bounds: #{items[10].name}', context);
        expect(result).toBe('Out of bounds: undefined');
    });

    it('handles mixed keys in one string', () => {
        const result = extrapolate('User: #{user.name}, Item: #{items[1].name}, Missing: #{nothing}', context);
        expect(result).toBe('User: Alice, Item: Item B, Missing: undefined');
    });
});

describe('getActionRef', () => {
    const mockScope = {
        toggleSidebar: jest.fn(),
        nested: {
            fn: jest.fn(),
        },
        array: [
            () => 'item0',
            () => 'item1',
        ],
        notAFunction: 'hello',
        echo: (x: string) => `Echo: ${x}`,
        add: (a: number, b: number) => a + b,
        log: jest.fn(),
        submitForm: jest.fn(),
        handleInput: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should resolve and return direct function reference', () => {
        const fn = getActionRef('toggleSidebar', mockScope);
        expect(typeof fn).toBe('function');
        fn?.();
        expect(mockScope.toggleSidebar).toHaveBeenCalled();
    });

    it('should resolve nested function reference', () => {
        const fn = getActionRef('nested.fn', mockScope);
        expect(typeof fn).toBe('function');
        fn?.();
        expect(mockScope.nested.fn).toHaveBeenCalled();
    });

    it('should resolve array index function', () => {
        const fn = getActionRef('array[1]', mockScope);
        expect(typeof fn).toBe('function');
        expect(fn?.()).toBe('item1');
    });

    it('should return undefined for non-function value', () => {
        const fn = getActionRef('notAFunction', mockScope);
        expect(fn).toBeUndefined();
    });

    it('should return undefined for invalid path', () => {
        const fn = getActionRef('invalid.path', mockScope);
        expect(fn).toBeUndefined();
    });

    it('should allow calling the resolved function with arguments', () => {
        const fn = getActionRef('echo', mockScope);
        expect(typeof fn).toBe('function');
        expect(fn?.('world')).toBe('Echo: world');
    });

    it('should support multiple arguments', () => {
        const fn = getActionRef('add', mockScope);
        expect(typeof fn).toBe('function');
        expect(fn?.(10, 5)).toBe(15);
    });

    it('resolves and calls a string action (#this.log)', () => {
        const action: SerializableAction = 'log';
        const fn = getActionRef(action, mockScope);
        fn?.();
        expect(mockScope.log).toHaveBeenCalled();
    });

    it('resolves and calls an object action with args', () => {
        const action: SerializableAction = {
            action: 'submitForm',
            args: { userId: 123 },
        };
        const fn = getActionRef(action, mockScope);
        fn?.();
        expect(mockScope.submitForm).toHaveBeenCalledWith({ userId: 123 });
    });

    it('calls function with value and event when valueFromEvent is true', () => {
        const action: SerializableAction = {
            action: 'handleInput',
            valueFromEvent: true,
        };
        const fn = getActionRef(action, mockScope);
        const fakeEvent = { type: 'input' };
        fn?.('hello', fakeEvent);
        expect(mockScope.handleInput).toHaveBeenCalledWith('hello', fakeEvent);
    });

    it('returns undefined for invalid function path', () => {
        const action: SerializableAction = 'doesNotExist';
        const fn = getActionRef(action, mockScope);
        expect(fn).toBeUndefined();
    });
});
