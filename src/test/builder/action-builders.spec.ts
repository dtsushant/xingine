/**
 * Action Builders Test Suite
 * 
 * Comprehensive tests for the new builder pattern implementation
 * including ConditionBuilder, ActionBuilder, ChainBuilder, and helper functions.
 */

import {
    ConditionBuilder,
    FieldBuilder,
    ActionBuilder,
    ChainBuilder,
    Actions,
    Conditions
} from '../../core/builder/action-builders';
import { SerializableAction, ConditionalChain } from '../../core/expressions/action';
import { ConditionalExpression } from '../../core/expressions/operators';

describe('ActionBuilders', () => {
    
    // ===== CONDITION BUILDER TESTS =====
    describe('ConditionBuilder', () => {
        
        describe('field() static method', () => {
            it('should create a FieldBuilder instance', () => {
                const fieldBuilder = ConditionBuilder.field('username');
                expect(fieldBuilder).toBeInstanceOf(FieldBuilder);
            });
        });

        describe('and() static method', () => {
            it('should create an AND condition with multiple conditions', () => {
                const condition1: ConditionalExpression = { field: 'status', operator: 'eq', value: 200 };
                const condition2: ConditionalExpression = { field: 'user', operator: 'ne', value: null };
                
                const result = ConditionBuilder.and(condition1, condition2).build();
                
                expect(result).toEqual({
                    and: [condition1, condition2]
                });
            });

            it('should handle empty conditions array', () => {
                const result = ConditionBuilder.and().build();
                expect(result).toEqual({ and: [] });
            });
        });

        describe('or() static method', () => {
            it('should create an OR condition with multiple conditions', () => {
                const condition1: ConditionalExpression = { field: 'role', operator: 'eq', value: 'admin' };
                const condition2: ConditionalExpression = { field: 'role', operator: 'eq', value: 'user' };
                
                const result = ConditionBuilder.or(condition1, condition2).build();
                
                expect(result).toEqual({
                    or: [condition1, condition2]
                });
            });
        });

        describe('build() method', () => {
            it('should return the built condition', () => {
                const builder = new ConditionBuilder('test', 'eq', 'value');
                const result = builder.build();
                
                expect(result).toEqual({
                    field: 'test',
                    operator: 'eq',
                    value: 'value'
                });
            });
        });
    });

    // ===== FIELD BUILDER TESTS =====
    describe('FieldBuilder', () => {
        let fieldBuilder: FieldBuilder;

        beforeEach(() => {
            fieldBuilder = new FieldBuilder('testField');
        });

        it('should create equals condition', () => {
            const result = fieldBuilder.equals('testValue').build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'eq',
                value: 'testValue'
            });
        });

        it('should create notEquals condition', () => {
            const result = fieldBuilder.notEquals('testValue').build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'ne',
                value: 'testValue'
            });
        });

        it('should create greaterThan condition', () => {
            const result = fieldBuilder.greaterThan(100).build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'gt',
                value: 100
            });
        });

        it('should create lessThan condition', () => {
            const result = fieldBuilder.lessThan(50).build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'lt',
                value: 50
            });
        });

        it('should create greaterThanOrEqual condition', () => {
            const result = fieldBuilder.greaterThanOrEqual(100).build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'gte',
                value: 100
            });
        });

        it('should create lessThanOrEqual condition', () => {
            const result = fieldBuilder.lessThanOrEqual(50).build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'lte',
                value: 50
            });
        });

        it('should create like condition', () => {
            const result = fieldBuilder.like('%pattern%').build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'like',
                value: '%pattern%'
            });
        });

        it('should create in condition', () => {
            const values = ['value1', 'value2', 'value3'];
            const result = fieldBuilder.in(values).build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'in',
                value: values
            });
        });

        it('should create notIn condition', () => {
            const values = ['exclude1', 'exclude2'];
            const result = fieldBuilder.notIn(values).build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'nin',
                value: values
            });
        });

        it('should create isNull condition', () => {
            const result = fieldBuilder.isNull().build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'eq',
                value: null
            });
        });

        it('should create isNotNull condition', () => {
            const result = fieldBuilder.isNotNull().build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'ne',
                value: null
            });
        });

        it('should create isTrue condition', () => {
            const result = fieldBuilder.isTrue().build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'eq',
                value: true
            });
        });

        it('should create isFalse condition', () => {
            const result = fieldBuilder.isFalse().build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'eq',
                value: false
            });
        });
    });

    // ===== ACTION BUILDER TESTS =====
    describe('ActionBuilder', () => {
        
        describe('create() static method', () => {
            it('should create ActionBuilder with action name', () => {
                const builder = ActionBuilder.create('testAction');
                expect(builder).toBeInstanceOf(ActionBuilder);
                
                const result = builder.build();
                expect(result).toEqual({ action: 'testAction' });
            });
        });

        describe('withArgs() method', () => {
            it('should add arguments to action', () => {
                const result = ActionBuilder
                    .create('testAction')
                    .withArgs({ key1: 'value1', key2: 'value2' })
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    args: { key1: 'value1', key2: 'value2' }
                });
            });

            it('should merge multiple withArgs calls', () => {
                const result = ActionBuilder
                    .create('testAction')
                    .withArgs({ key1: 'value1' })
                    .withArgs({ key2: 'value2' })
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    args: { key1: 'value1', key2: 'value2' }
                });
            });
        });

        describe('withArg() method', () => {
            it('should add single argument', () => {
                const result = ActionBuilder
                    .create('testAction')
                    .withArg('key', 'value')
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    args: { key: 'value' }
                });
            });
        });

        describe('withValueFromEvent() method', () => {
            it('should enable valueFromEvent', () => {
                const result = ActionBuilder
                    .create('testAction')
                    .withValueFromEvent()
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    valueFromEvent: true
                });
            });

            it('should disable valueFromEvent when false', () => {
                const result = ActionBuilder
                    .create('testAction')
                    .withValueFromEvent(false)
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    valueFromEvent: false
                });
            });
        });

        describe('withMap() method', () => {
            it('should add mapped actions', () => {
                const mappedAction1: SerializableAction = { action: 'action1' };
                const mappedAction2: SerializableAction = { action: 'action2' };
                
                const result = ActionBuilder
                    .create('testAction')
                    .then(mappedAction1, mappedAction2)
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    then: [mappedAction1, mappedAction2]
                });
            });

            it('should append to existing mapped actions', () => {
                const mappedAction1: SerializableAction = { action: 'action1' };
                const mappedAction2: SerializableAction = { action: 'action2' };
                const mappedAction3: SerializableAction = { action: 'action3' };
                
                const result = ActionBuilder
                    .create('testAction')
                    .then(mappedAction1)
                    .then(mappedAction2, mappedAction3)
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    then: [mappedAction1, mappedAction2, mappedAction3]
                });
            });
        });

        describe('withMappedAction() method', () => {
            it('should add single mapped action', () => {
                const mappedAction: SerializableAction = { action: 'mappedAction' };
                
                const result = ActionBuilder
                    .create('testAction')
                    .withMappedAction(mappedAction)
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    then: [mappedAction]
                });
            });
        });

        describe('withChains() method', () => {
            it('should add conditional chains', () => {
                const chain1: ConditionalChain = {
                    condition: { field: 'test', operator: 'eq', value: 'value' },
                    action: 'chainAction1'
                };
                const chain2: ConditionalChain = {
                    condition: { field: 'test2', operator: 'ne', value: 'value2' },
                    action: 'chainAction2'
                };
                
                const result = ActionBuilder
                    .create('testAction')
                    .withChains(chain1, chain2)
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    chains: [chain1, chain2]
                });
            });
        });

        describe('withChain() method', () => {
            it('should add single conditional chain', () => {
                const condition: ConditionalExpression = { field: 'test', operator: 'eq', value: 'value' };
                
                const result = ActionBuilder
                    .create('testAction')
                    .withChain(condition, 'chainAction', { arg: 'value' })
                    .build();
                
                expect(result).toEqual({
                    action: 'testAction',
                    chains: [{
                        condition,
                        action: 'chainAction',
                        args: { arg: 'value' }
                    }]
                });
            });
        });

        describe('complex builder combinations', () => {
            it('should handle all builder methods together', () => {
                const condition: ConditionalExpression = { field: 'status', operator: 'eq', value: 200 };
                const mappedAction: SerializableAction = { action: 'mappedAction' };
                const chain: ConditionalChain = {
                    condition: { field: 'error', operator: 'ne', value: null },
                    action: 'errorHandler'
                };
                
                const result = ActionBuilder
                    .create('complexAction')
                    .withArgs({ url: '/api/test', method: 'POST' })
                    .withValueFromEvent(true)
                    .then(mappedAction)
                    .withChains(chain)
                    .build();
                
                expect(result).toEqual({
                    action: 'complexAction',
                    args: { url: '/api/test', method: 'POST' },
                    valueFromEvent: true,
                    then: [mappedAction],
                    chains: [chain]
                });
            });
        });
    });

    // ===== CHAIN BUILDER TESTS =====
    describe('ChainBuilder', () => {
        
        describe('create() static method', () => {
            it('should create ChainBuilder instance', () => {
                const builder = ChainBuilder.create();
                expect(builder).toBeInstanceOf(ChainBuilder);
            });
        });

        describe('when() method', () => {
            it('should set condition', () => {
                const condition: ConditionalExpression = { field: 'test', operator: 'eq', value: 'value' };
                
                const result = ChainBuilder
                    .create()
                    .when(condition)
                    .thenAction('testAction')
                    .build();
                
                expect(result.condition).toEqual(condition);
            });
        });

        describe('whenCondition() method', () => {
            it('should set condition from ConditionBuilder', () => {
                const conditionBuilder = ConditionBuilder.field('test').equals('value');
                
                const result = ChainBuilder
                    .create()
                    .whenCondition(conditionBuilder)
                    .thenAction('testAction')
                    .build();
                
                expect(result.condition).toEqual({
                    field: 'test',
                    operator: 'eq',
                    value: 'value'
                });
            });
        });

        describe('thenAction() method', () => {
            it('should set string action without args', () => {
                const condition: ConditionalExpression = { field: 'test', operator: 'eq', value: 'value' };
                
                const result = ChainBuilder
                    .create()
                    .when(condition)
                    .thenAction('testAction')
                    .build();
                
                expect(result).toEqual({
                    condition,
                    action: 'testAction',
                    args: undefined
                });
            });

            it('should set string action with args', () => {
                const condition: ConditionalExpression = { field: 'test', operator: 'eq', value: 'value' };
                const args = { key: 'value' };
                
                const result = ChainBuilder
                    .create()
                    .when(condition)
                    .thenAction('testAction', args)
                    .build();
                
                expect(result).toEqual({
                    condition,
                    action: 'testAction',
                    args
                });
            });
        });

        describe('thenSerializableAction() method', () => {
            it('should set SerializableAction', () => {
                const condition: ConditionalExpression = { field: 'test', operator: 'eq', value: 'value' };
                const action: SerializableAction = {
                    action: 'complexAction',
                    args: { complex: 'args' }
                };
                
                const result = ChainBuilder
                    .create()
                    .when(condition)
                    .thenSerializableAction(action)
                    .build();
                
                expect(result).toEqual({
                    condition,
                    action
                });
            });
        });

        describe('thenActionBuilder() method', () => {
            it('should set action from ActionBuilder', () => {
                const condition: ConditionalExpression = { field: 'test', operator: 'eq', value: 'value' };
                const actionBuilder = ActionBuilder
                    .create('builderAction')
                    .withArgs({ builderArg: 'builderValue' });
                
                const result = ChainBuilder
                    .create()
                    .when(condition)
                    .thenActionBuilder(actionBuilder)
                    .build();
                
                expect(result).toEqual({
                    condition,
                    action: {
                        action: 'builderAction',
                        args: { builderArg: 'builderValue' }
                    }
                });
            });
        });

        describe('build() method', () => {
            it('should throw error if condition is missing', () => {
                expect(() => {
                    ChainBuilder
                        .create()
                        .thenAction('testAction')
                        .build();
                }).toThrow('ConditionalChain requires both condition and action');
            });

            it('should throw error if action is missing', () => {
                const condition: ConditionalExpression = { field: 'test', operator: 'eq', value: 'value' };
                
                expect(() => {
                    ChainBuilder
                        .create()
                        .when(condition)
                        .build();
                }).toThrow('ConditionalChain requires both condition and action');
            });
        });
    });

    // ===== PREDEFINED CONDITIONS TESTS =====
    describe('Conditions helper', () => {
        
        it('should create onSuccess condition', () => {
            const result = Conditions.onSuccess().build();
            expect(result).toEqual({
                field: '__success',
                operator: 'eq',
                value: true
            });
        });

        it('should create onError condition', () => {
            const result = Conditions.onError().build();
            expect(result).toEqual({
                field: '__hasError',
                operator: 'eq',
                value: true
            });
        });

        it('should create onLoginSuccess condition', () => {
            const result = Conditions.onLoginSuccess().build();
            expect(result).toEqual({
                field: '__result.user.token',
                operator: 'ne',
                value: null
            });
        });

        it('should create onLoginFailure condition', () => {
            const result = Conditions.onLoginFailure().build();
            expect(result).toEqual({
                field: '__result.user',
                operator: 'eq',
                value: null
            });
        });

        it('should create onValidationError condition', () => {
            const result = Conditions.onValidationError().build();
            expect(result).toEqual({
                and: [
                    { field: '__result.message', operator: 'eq', value: 'Input data validation failed' },
                    { field: '__result.errors', operator: 'ne', value: null }
                ]
            });
        });

        it('should create fieldExists condition', () => {
            const result = Conditions.fieldExists('testField').build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'ne',
                value: null
            });
        });

        it('should create fieldEquals condition', () => {
            const result = Conditions.fieldEquals('testField', 'testValue').build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'eq',
                value: 'testValue'
            });
        });

        it('should create fieldNotEquals condition', () => {
            const result = Conditions.fieldNotEquals('testField', 'testValue').build();
            expect(result).toEqual({
                field: 'testField',
                operator: 'ne',
                value: 'testValue'
            });
        });
    });

    // ===== PREDEFINED ACTIONS TESTS =====
    describe('Actions helper', () => {
        
        it('should create navigate action', () => {
            const result = Actions.navigate('/dashboard').build();
            expect(result).toEqual({
                action: 'navigate',
                args: { path: '/dashboard' }
            });
        });

        it('should create setState action', () => {
            const result = Actions.setState('key', 'value').build();
            expect(result).toEqual({
                action: 'setState',
                args: { key: 'key', value: 'value' }
            });
        });

        it('should create toggleState action', () => {
            const result = Actions.toggleState('key').build();
            expect(result).toEqual({
                action: 'toggleState',
                args: { key: 'key' }
            });
        });

        it('should create setStorage action', () => {
            const result = Actions.setStorage('key', 'value').build();
            expect(result).toEqual({
                action: 'setLocalStorage',
                args: { key: 'key', value: 'value' }
            });
        });

        it('should create getStorage action without stateKey', () => {
            const result = Actions.getStorage('key').build();
            expect(result).toEqual({
                action: 'getLocalStorage',
                args: { key: 'key', stateKey: undefined }
            });
        });

        it('should create getStorage action with stateKey', () => {
            const result = Actions.getStorage('key', 'stateKey').build();
            expect(result).toEqual({
                action: 'getLocalStorage',
                args: { key: 'key', stateKey: 'stateKey' }
            });
        });

        it('should create removeStorage action', () => {
            const result = Actions.removeStorage('key').build();
            expect(result).toEqual({
                action: 'removeLocalStorage',
                args: { key: 'key' }
            });
        });

        it('should create showToast action with default type', () => {
            const result = Actions.showToast('message').build();
            expect(result).toEqual({
                action: 'showToast',
                args: { message: 'message', type: 'info' }
            });
        });

        it('should create showToast action with specific type', () => {
            const result = Actions.showToast('error message', 'error').build();
            expect(result).toEqual({
                action: 'showToast',
                args: { message: 'error message', type: 'error' }
            });
        });

        it('should create apiCall action with default method', () => {
            const result = Actions.apiCall('/api/test').build();
            expect(result).toEqual({
                action: 'makeApiCall',
                args: { url: '/api/test', method: 'GET', body: undefined }
            });
        });

        it('should create apiCall action with custom method and body', () => {
            const body = { data: 'test' };
            const result = Actions.apiCall('/api/test', 'POST', body).build();
            expect(result).toEqual({
                action: 'makeApiCall',
                args: { url: '/api/test', method: 'POST', body }
            });
        });

        it('should create login action', () => {
            const result = Actions.login('user', 'pass').build();
            expect(result).toEqual({
                action: 'login',
                args: { username: 'user', password: 'pass' }
            });
        });

        it('should create logout action', () => {
            const result = Actions.logout().build();
            expect(result).toEqual({
                action: 'logout'
            });
        });
    });

    // ===== INTEGRATION TESTS =====
    describe('Integration tests', () => {
        
        it('should create complete login flow using builders', () => {
            const loginAction = ActionBuilder
                .create('makeApiCall')
                .withArgs({
                    url: '/api/login',
                    method: 'POST',
                    body: 'formValues'
                })
                .withChains(
                    ChainBuilder
                        .create()
                        .whenCondition(Conditions.onLoginSuccess())
                        .thenActionBuilder(
                            Actions.setStorage('token', '__result.user.token')
                                .then(
                                    Actions.setState('authenticated', true).build(),
                                    Actions.showToast('Login successful!', 'success').build(),
                                    Actions.navigate('/dashboard').build()
                                )
                        )
                        .build(),
                    
                    ChainBuilder
                        .create()
                        .whenCondition(Conditions.onError())
                        .thenAction('showToast', {
                            message: 'Login failed',
                            type: 'error'
                        })
                        .build()
                )
                .build();

            expect(loginAction).toEqual({
                action: 'makeApiCall',
                args: {
                    url: '/api/login',
                    method: 'POST',
                    body: 'formValues'
                },
                chains: [
                    {
                        condition: { field: '__result.user.token', operator: 'ne', value: null },
                        action: {
                            action: 'setLocalStorage',
                            args: { key: 'token', value: '__result.user.token' },
                            then: [
                                { action: 'setState', args: { key: 'authenticated', value: true } },
                                { action: 'showToast', args: { message: 'Login successful!', type: 'success' } },
                                { action: 'navigate', args: { path: '/dashboard' } }
                            ]
                        }
                    },
                    {
                        condition: { field: '__hasError', operator: 'eq', value: true },
                        action: 'showToast',
                        args: { message: 'Login failed', type: 'error' }
                    }
                ]
            });
        });

        it('should create complex conditional logic using builders', () => {
            const complexCondition = ConditionBuilder.and(
                ConditionBuilder.field('__result.status').equals(200).build(),
                ConditionBuilder.or(
                    ConditionBuilder.field('__result.user.role').equals('admin').build(),
                    ConditionBuilder.field('__result.user.permissions').in(['read', 'write']).build()
                ).build()
            ).build();

            expect(complexCondition).toEqual({
                and: [
                    { field: '__result.status', operator: 'eq', value: 200 },
                    {
                        or: [
                            { field: '__result.user.role', operator: 'eq', value: 'admin' },
                            { field: '__result.user.permissions', operator: 'in', value: ['read', 'write'] }
                        ]
                    }
                ]
            });
        });
    });
});
