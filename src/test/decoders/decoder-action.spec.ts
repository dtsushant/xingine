import {eventBindingsDecoder, serializableActionDecoder} from "../../core/decoders/action.decoder";

describe('actionDecoder', () => {
    it('should decode valid SerializableAction', () => {
        const json = {
            action: 'submitForm',
            args: { userId: 123 },
        };

        const result = serializableActionDecoder.verify(json);

        expect(result).toEqual({
            action: 'submitForm',
            args: { userId: 123 },
        });
    });

    it('should decode string action', () => {
        const json = 'log';

        const result = serializableActionDecoder.verify(json);

        expect(result).toBe('log');
    });

    it('should decode event bindings',()=>{
        const validBindings = {
            onClick: '#this.toggleSidebar',
            onChange: {
                action: '#this.updateForm',
                valueFromEvent: true,
            },
            onNotExist:'hello',
            onInput:'something'
        };
        const result = eventBindingsDecoder.verify(validBindings);
        expect(result).toEqual({
            onClick: '#this.toggleSidebar',
            onChange: {
                action: '#this.updateForm',
                valueFromEvent: true,
            },
            onInput: 'something'
        });

        expect(result).not.toHaveProperty('onNotExist');
    });

    it('should decode SerializableAction with chains and then', () => {
        const json = {
            action: 'submitForm',
            args: { userId: 123 },
            chains: [
                {
                    condition: { and: [{ field: 'status', operator: 'eq', value: 'active' }] },
                    action: [
                        { action: 'notify', args: { message: 'Active' } }
                    ]
                },
                {
                    condition: { or: [{ field: 'status', operator: 'eq', value: 'inactive' }] },
                    action: [
                        { action: 'notify', args: { message: 'Inactive' } }
                    ]
                }
            ],
            then: [
                { action: 'log', args: { message: 'Done' } }
            ]
        };

        const result = serializableActionDecoder.verify(json);

        expect(result).toEqual({
            action: 'submitForm',
            args: { userId: 123 },
            chains: [
                {
                    condition: { and: [{ field: 'status', operator: 'eq', value: 'active' }] },
                    action: [
                        { action: 'notify', args: { message: 'Active' } }
                    ]
                },
                {
                    condition: { or: [{ field: 'status', operator: 'eq', value: 'inactive' }] },
                    action: [
                        { action: 'notify', args: { message: 'Inactive' } }
                    ]
                }
            ],
            then: [
                { action: 'log', args: { message: 'Done' } }
            ]
        });
    });


    it('should provide a clear error message for invalid chains', () => {
        const invalidJson = {
            action: 'submitForm',
            chains: [
                {
                    // missing 'condition'
                    action: [
                        { action: 'notify', args: { message: 'Active' } }
                    ]
                }
            ]
        };
        try {
            serializableActionDecoder.verify(invalidJson);
        } catch (e: any) {
            console.log('e ',e.message);
            expect(e.message).toMatch(/condition/);
        }
    });
});