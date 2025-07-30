import { EventBindings, SerializableAction, EventActionContext } from '../expressions/action';
import { ConditionalExpression } from '../expressions/operators';

/**
 * Event Builder for creating event bindings with fluent API
 * Provides a convenient way to bind actions to UI events
 */
export class EventBuilder {
    private events: EventBindings = {};

    /**
     * Create a new EventBuilder instance
     */
    static create(): EventBuilder {
        return new EventBuilder();
    }

    /**
     * Bind an action to onClick event
     */
    onClick(action: SerializableAction): EventBuilder {
        this.events.onClick = action;
        return this;
    }

    /**
     * Bind an action to onHover event
     */
    onHover(action: SerializableAction): EventBuilder {
        this.events.onHover = action;
        return this;
    }

    /**
     * Bind an action to onInit event
     */
    onInit(action: SerializableAction): EventBuilder {
        this.events.onInit = action;
        return this;
    }

    /**
     * Bind an action to onChange event
     */
    onChange(action: SerializableAction): EventBuilder {
        this.events.onChange = action;
        return this;
    }

    /**
     * Bind an action to onInput event
     */
    onInput(action: SerializableAction): EventBuilder {
        this.events.onInput = action;
        return this;
    }

    /**
     * Bind an action to onFocus event
     */
    onFocus(action: SerializableAction): EventBuilder {
        this.events.onFocus = action;
        return this;
    }

    /**
     * Bind an action to onBlur event
     */
    onBlur(action: SerializableAction): EventBuilder {
        this.events.onBlur = action;
        return this;
    }

    /**
     * Bind an action to onSubmit event
     */
    onSubmit(action: SerializableAction): EventBuilder {
        this.events.onSubmit = action;
        return this;
    }

    /**
     * Bind an action to onClear event
     */
    onClear(action: SerializableAction): EventBuilder {
        this.events.onClear = action;
        return this;
    }

    /**
     * Bind an action to onKeyDown event
     */
    onKeyDown(action: SerializableAction): EventBuilder {
        this.events.onKeyDown = action;
        return this;
    }

    /**
     * Bind an action to onKeyUp event
     */
    onKeyUp(action: SerializableAction): EventBuilder {
        this.events.onKeyUp = action;
        return this;
    }

    /**
     * Build the final EventBindings object
     */
    build(): EventBindings {
        return { ...this.events };
    }

    /**
     * Helper methods for common action patterns
     */
    
    /**
     * Quick helper to create a setState action
     */
    static setState(key: string, value: unknown, valueFromEvent = false): SerializableAction {
        return {
            action: 'setState',
            args: { key, value },
            valueFromEvent
        };
    }

    /**
     * Quick helper to create a navigate action
     */
    static navigate(path: string): SerializableAction {
        return {
            action: 'navigate',
            args: { path }
        };
    }

    /**
     * Quick helper to create a makeApiCall action
     */
    static makeApiCall(url: string, method = 'GET', body?: unknown): SerializableAction {
        return {
            action: 'makeApiCall',
            args: { url, method, body }
        };
    }

    /**
     * Quick helper to create a login flow (makeApiCall + conditional chains)
     */
    static loginFlow(username: string, password: string, loginUrl = '/api/auth/login'): SerializableAction {
        return {
            action: 'makeApiCall',
            args: {
                url: loginUrl,
                method: 'POST',
                body: { username, password }
            },
            then: [
                {
                    action: 'setLocalStorage',
                    args: { key: 'authToken', value: '#{__result.token}' }
                },
                {
                    action: 'setState',
                    args: { key: 'currentUser', value: '#{__result.user}' }
                },
                {
                    action: 'showToast',
                    args: { message: 'Welcome back, #{__result.user.name || "User"}!', type: 'success' }
                }
            ],
            chains: [
                {
                    // On API error - authentication failed
                    condition: {
                        or: [
                            { field: '__success', operator: 'eq', value: false },
                            { field: '__result.token', operator: 'eq', value: null },
                            { field: '__result.token', operator: 'eq', value: undefined },
                            { field: '__result.token', operator: 'eq', value: '' }
                        ]
                    },
                    action: {
                        action: 'showToast',
                        args: { message: 'Login failed. Please check your credentials.', type: 'error' }
                    }
                }
            ]
        };
    }

    /**
     * Quick helper to create a logout flow
     */
    static logoutFlow(): SerializableAction {
        return {
            action: 'removeLocalStorage',
            args: { key: 'authToken' },
            chains: [
                {
                    condition: { field: '__success', operator: 'eq', value: true },
                    action: {
                        action: 'showToast',
                        args: { message: 'Logged out successfully', type: 'info' },
                        chains: [
                            {
                                condition: { field: '__success', operator: 'eq', value: true },
                                action: {
                                    action: 'navigate',
                                    args: { path: '/login' }
                                }
                            }
                        ]
                    }
                }
            ]
        };
    }

    /**
     * Quick helper to create a form submission with validation
     */
    static formSubmit(apiUrl: string, successRedirect?: string): SerializableAction {
        return {
            action: 'makeApiCall',
            args: { url: apiUrl, method: 'POST' },
            valueFromEvent: true,
            chains: [
                {
                    condition: { field: '__success', operator: 'eq', value: true },
                    action: {
                        action: 'showToast',
                        args: { message: 'Form submitted successfully!', type: 'success' },
                        chains: successRedirect ? [
                            {
                                condition: { field: '__success', operator: 'eq', value: true },
                                action: {
                                    action: 'navigate',
                                    args: { path: successRedirect }
                                }
                            }
                        ] : undefined
                    }
                },
                {
                    condition: { field: '__success', operator: 'eq', value: false },
                    action: {
                        action: 'showToast',
                        args: { message: 'Form submission failed', type: 'error' }
                    }
                }
            ]
        };
    }

    /**
     * Helper to create conditional action based on a simple condition
     */
    static conditional(
        condition: ConditionalExpression,
        onTrue: SerializableAction,
        onFalse?: SerializableAction
    ): SerializableAction {
        const chains = [
            {
                condition,
                action: onTrue
            }
        ];

        if (onFalse) {
            chains.push({
                condition: { field: '__success', operator: 'eq', value: true }, // This will be overridden by the opposite condition logic
                action: onFalse
            });
        }

        // Return a dummy action that just evaluates the condition
        return {
            action: 'setState',
            args: { key: '_temp', value: true },
            chains
        };
    }
}

/**
 * Convenience function to create event bindings
 */
export function createEvents(): EventBuilder {
    return EventBuilder.create();
}

/**
 * Login action with proper value mapping using extrapolation
 */
export const login: SerializableAction = {
    action: 'makeApiCall',
    args: {
        url: '/api/auth/login',
        method: 'POST',
        body: { username: 'user', password: 'pass' } // These would typically come from form data
    },
    then: [
        {
            action: 'setLocalStorage',
            args: { key: 'authToken', value: '#{__result.token}' }
        },
        {
            action: 'setState',
            args: { key: 'currentUser', value: '#{__result.user}' }
        },
        {
            action: 'setState',
            args: { key: 'userId', value: '#{__result.user.id}' }
        },
        {
            action: 'setState',
            args: { key: 'userName', value: '#{__result.user.name}' }
        },
        {
            action: 'setState',
            args: { key: 'userEmail', value: '#{__result.user.email}' }
        },
        {
            action: 'setState',
            args: { key: 'isAuthenticated', value: '#{__result.token ? true : false}' }
        }
    ],
    chains: [
        {
            condition: { field: '__success', operator: 'eq', value: false },
            action: {
                action: 'showToast',
                args: { message: 'Login failed. Please check your credentials.', type: 'error' }
            }
        }
    ]
};

/**
 * Type-safe event binding creators
 */
export const Events = {
    onClick: (action: SerializableAction) => EventBuilder.create().onClick(action).build(),
    onChange: (action: SerializableAction) => EventBuilder.create().onChange(action).build(),
    onSubmit: (action: SerializableAction) => EventBuilder.create().onSubmit(action).build(),
    onInput: (action: SerializableAction) => EventBuilder.create().onInput(action).build(),
    onFocus: (action: SerializableAction) => EventBuilder.create().onFocus(action).build(),
    onBlur: (action: SerializableAction) => EventBuilder.create().onBlur(action).build(),
    onHover: (action: SerializableAction) => EventBuilder.create().onHover(action).build(),
    onInit: (action: SerializableAction) => EventBuilder.create().onInit(action).build(),
    onClear: (action: SerializableAction) => EventBuilder.create().onClear(action).build(),
    onKeyDown: (action: SerializableAction) => EventBuilder.create().onKeyDown(action).build(),
    onKeyUp: (action: SerializableAction) => EventBuilder.create().onKeyUp(action).build(),
};
