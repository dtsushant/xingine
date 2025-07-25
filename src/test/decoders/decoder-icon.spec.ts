import {iconMetaDecoder} from "../../core/decoders/icon.decoder";

describe('iconMetaDecoder', () => {
    it('should decode valid config', () => {
        const json = {
            name: 'UserOutlined',
            color: '#123456',
            size: 24,
            spin: true,
            rotate: 90,
            twoToneColor: '#abc',
        };

        const result = iconMetaDecoder.verify(json);
        console.log("the result ", result)
        expect(result).toEqual({
            name: 'UserOutlined',
            color: '#123456',
            size: 24,
            spin: true,
            rotate: 90,
            twoToneColor: '#abc',
        });
    });

    it('should reject invalid size', () => {
        const json = { name: 'UserOutlined', size: { foo: 'bar' } };

        expect(() => iconMetaDecoder.verify(json)).toThrow();
    });

    it('should decode partial config', () => {
        const result = iconMetaDecoder.verify({ name: 'HomeOutlined' });
        expect(result.name).toBe('HomeOutlined');
    });
});
