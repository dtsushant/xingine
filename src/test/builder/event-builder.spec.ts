import { EventBuilder, createEvents, Events } from '../../core/builder/event-builder';
import { SerializableAction } from '../../core/expressions/action';

describe('EventBuilder', () => {
    describe('Basic Event Binding', () => {
        it('should create onClick event binding', () => {
            const action: SerializableAction = {
                action: 'navigate',
                args: { path: '/home' }
            };

            const events = EventBuilder.create()
                .onClick(action)
                .build();

            expect(events.onClick).toEqual(action);
        });

        it('should create multiple event bindings', () => {
            const clickAction: SerializableAction = {
                action: 'setState',
                args: { key: 'clicked', value: true }
            };

            const hoverAction: SerializableAction = {
                action: 'setState',
                args: { key: 'hovered', value: true }
            };

            const events = EventBuilder.create()
                .onClick(clickAction)
                .onHover(hoverAction)
                .build();

            expect(events.onClick).toEqual(clickAction);
            expect(events.onHover).toEqual(hoverAction);
        });

        it('should create form-related events', () => {
            const submitAction: SerializableAction = 'submitForm';
            const changeAction: SerializableAction = {
                action: 'setState',
                args: { key: 'formValue', value: 'test' },
                valueFromEvent: true
            };

            const events = EventBuilder.create()
                .onSubmit(submitAction)
                .onChange(changeAction)
                .onFocus({ action: 'setState', args: { key: 'focused', value: true } })
                .onBlur({ action: 'setState', args: { key: 'focused', value: false } })
                .build();

            expect(events.onSubmit).toEqual(submitAction);
            expect(events.onChange).toEqual(changeAction);
            expect(events.onFocus).toBeDefined();
            expect(events.onBlur).toBeDefined();
        });

        it('should create keyboard events', () => {
            const keyDownAction: SerializableAction = {
                action: 'handleKeyDown',
                valueFromEvent: true
            };

            const keyUpAction: SerializableAction = {
                action: 'handleKeyUp',
                valueFromEvent: true
            };

            const events = EventBuilder.create()
                .onKeyDown(keyDownAction)
                .onKeyUp(keyUpAction)
                .build();

            expect(events.onKeyDown).toEqual(keyDownAction);
            expect(events.onKeyUp).toEqual(keyUpAction);
        });
    });

    describe('Helper Methods', () => {
        it('should create setState helper', () => {
            const action = EventBuilder.setState('myKey', 'myValue', true);

            expect(action).toEqual({
                action: 'setState',
                args: { key: 'myKey', value: 'myValue' },
                valueFromEvent: true
            });
        });

        it('should create navigate helper', () => {
            const action = EventBuilder.navigate('/dashboard');

            expect(action).toEqual({
                action: 'navigate',
                args: { path: '/dashboard' }
            });
        });

        it('should create makeApiCall helper', () => {
            const action = EventBuilder.makeApiCall('/api/users', 'POST', { name: 'John' });

            expect(action).toEqual({
                action: 'makeApiCall',
                args: { url: '/api/users', method: 'POST', body: { name: 'John' } }
            });
        });
    });

    describe('Advanced Workflows', () => {


        it('should create logout flow', () => {
            const logoutAction = EventBuilder.logoutFlow();
            const complexAction = logoutAction as Exclude<SerializableAction, string>;

            expect(complexAction.action).toBe('removeLocalStorage');
            expect(complexAction.args).toEqual({ key: 'authToken' });
            expect(complexAction.chains).toHaveLength(1);

            const chain = complexAction.chains![0];
            expect(chain.condition).toEqual({
                field: '__success', operator: 'eq', value: true
            });
            expect((chain.action as any).action).toBe('showToast');
            expect((chain.action as any).chains).toHaveLength(1);
            expect(((chain.action as any).chains![0].action as any).action).toBe('navigate');
        });

        it('should create form submission flow', () => {
            const formAction = EventBuilder.formSubmit('/api/contact', '/thank-you');
            const complexAction = formAction as Exclude<SerializableAction, string>;

            expect(complexAction.action).toBe('makeApiCall');
            expect(complexAction.args).toEqual({ url: '/api/contact', method: 'POST' });
            expect(complexAction.valueFromEvent).toBe(true);
            expect(complexAction.chains).toHaveLength(2);

            // Success chain with redirect
            const successChain = complexAction.chains![0];
            expect(successChain.condition).toEqual({
                field: '__success', operator: 'eq', value: true
            });
            expect((successChain.action as any).action).toBe('showToast');
            expect((successChain.action as any).chains).toHaveLength(1);
            expect(((successChain.action as any).chains![0].action as any).action).toBe('navigate');

            // Error chain
            const errorChain = complexAction.chains![1];
            expect(errorChain.condition).toEqual({
                field: '__success', operator: 'eq', value: false
            });
            expect((errorChain.action as any).action).toBe('showToast');
        });

        it('should create form submission without redirect', () => {
            const formAction = EventBuilder.formSubmit('/api/newsletter');
            const complexAction = formAction as Exclude<SerializableAction, string>;

            expect(((complexAction.chains![0].action as any).chains)).toBeUndefined();
        });
    });

    describe('Convenience Functions', () => {
        it('should create events with createEvents function', () => {
            const events = createEvents()
                .onClick({ action: 'test' })
                .build();

            expect(events.onClick).toEqual({ action: 'test' });
        });

        it('should create single event with Events object', () => {
            const clickEvents = Events.onClick({ action: 'handleClick' });
            expect(clickEvents.onClick).toEqual({ action: 'handleClick' });

            const changeEvents = Events.onChange({ action: 'handleChange' });
            expect(changeEvents.onChange).toEqual({ action: 'handleChange' });

            const submitEvents = Events.onSubmit({ action: 'handleSubmit' });
            expect(submitEvents.onSubmit).toEqual({ action: 'handleSubmit' });
        });
    });

    describe('Complex Event Scenarios', () => {
        it('should create a complete form with multiple events', () => {
            const formEvents = EventBuilder.create()
                .onInit({ action: 'loadFormData' })
                .onChange({
                    action: 'setState',
                    args: { key: 'formData' },
                    valueFromEvent: true
                })
                .onSubmit(EventBuilder.formSubmit('/api/users', '/users'))
                .onClear({
                    action: 'setState',
                    args: { key: 'formData', value: {} }
                })
                .build();

            expect(Object.keys(formEvents)).toHaveLength(4);
            expect(formEvents.onInit).toBeDefined();
            expect(formEvents.onChange).toBeDefined();
            expect(formEvents.onSubmit).toBeDefined();
            expect(formEvents.onClear).toBeDefined();
        });

        it('should create login form events', () => {
            const loginFormEvents = EventBuilder.create()
                .onSubmit(EventBuilder.loginFlow('${formData.username}', '${formData.password}'))
                .onChange({
                    action: 'setState',
                    args: { key: 'formData' },
                    valueFromEvent: true
                })
                .onKeyDown({
                    action: 'handleKeyDown',
                    valueFromEvent: true,
                    chains: [
                        {
                            condition: { field: '__result.key', operator: 'eq', value: 'Enter' },
                            action: EventBuilder.loginFlow('${formData.username}', '${formData.password}')
                        }
                    ]
                })
                .build();

            expect(loginFormEvents.onSubmit).toBeDefined();
            expect(loginFormEvents.onChange).toBeDefined();
            expect(loginFormEvents.onKeyDown).toBeDefined();
            expect((loginFormEvents.onKeyDown as any).chains).toHaveLength(1);
        });

        it('should create interactive button events', () => {
            const buttonEvents = EventBuilder.create()
                .onClick({
                    action: 'makeApiCall',
                    args: { url: '/api/like', method: 'POST' },
                    chains: [
                        {
                            condition: { field: '__success', operator: 'eq', value: true },
                            action: {
                                action: 'setState',
                                args: { key: 'liked', value: true }
                            }
                        },
                        {
                            condition: { field: '__success', operator: 'eq', value: false },
                            action: {
                                action: 'showToast',
                                args: { message: 'Failed to like', type: 'error' }
                            }
                        }
                    ]
                })
                .onHover({
                    action: 'setState',
                    args: { key: 'buttonHovered', value: true }
                })
                .build();

            expect(buttonEvents.onClick).toBeDefined();
            expect(buttonEvents.onHover).toBeDefined();
            expect((buttonEvents.onClick as any).chains).toHaveLength(2);
        });
    });

    describe('Builder Pattern', () => {
        it('should allow method chaining', () => {
            const builder = EventBuilder.create();
            const result = builder
                .onClick({ action: 'click' })
                .onHover({ action: 'hover' })
                .onChange({ action: 'change' });

            expect(result).toBe(builder); // Should return the same instance
        });

        it('should not modify original events when building multiple times', () => {
            const builder = EventBuilder.create()
                .onClick({ action: 'click' });

            const events1 = builder.build();
            const events2 = builder.onHover({ action: 'hover' }).build();

            expect(events1.onHover).toBeUndefined();
            expect(events2.onHover).toBeDefined();
            expect(events1).not.toBe(events2);
        });
    });
});
