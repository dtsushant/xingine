import {ActionContext, runAction, SerializableAction} from "../../core/expressions/action";
import {getActionRef} from "../../core/utils/type";

describe('runAction', () => {
    let context: ActionContext;

    beforeEach(() => {
        context = {
            navigate: jest.fn(),
            setState: jest.fn(),
            getState: jest.fn(() => false),
            getAllState:jest.fn(),
            makeApiCall: jest.fn(),
            dynamic: jest.fn(),
        };
    });

    it('executes navigate action', () => {
        const action: SerializableAction = { action: 'navigate', args: { path: '/home' } };
        runAction(action, context);
        expect(context.navigate).toHaveBeenCalledWith('/home');
    });

    it('executes setState with static value', () => {
        const action: SerializableAction = {
            action: 'setState',
            args: { key: 'user', value: 'Alice' },
        };
        runAction(action, context);
        expect(context.setState).toHaveBeenCalledWith('user', 'Alice');
    });

    it('executes setState using event value', () => {
        const action: SerializableAction = {
            action: 'setState',
            args: { key: 'inputValue' },
            valueFromEvent: true,
        };
        runAction(action, context, { target: { value: 'Test' } });
        expect(context.setState).toHaveBeenCalledWith('inputValue', 'Test');
    });

   /* it('executes toggleDarkMode by flipping state', () => {
        context.getState = jest.fn(() => false);
        const action: SerializableAction = 'toggleDarkMode';
        runAction(action, context);
        expect(context.setState).toHaveBeenCalledWith('darkMode', true);
    });*/

    it('uses dynamic action handler if action is not in registry', () => {
        const action: SerializableAction = { action: 'customAction', args: { foo: 'bar' } };
        runAction(action, context);
        expect(context.dynamic).toHaveBeenCalledWith('customAction', { foo: 'bar' }, undefined);
    });

    it('throws if action is unknown and no dynamic handler is defined', () => {
        delete context.dynamic;
        const action: SerializableAction = { action: 'missingAction' };
        expect(() => runAction(action, context)).toThrow('Unknown action: missingAction');
    });
});
