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
    })
});