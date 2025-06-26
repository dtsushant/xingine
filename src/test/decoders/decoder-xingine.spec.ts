import {styleDecoder, wrapperMetaDecoder} from "../../core/xingine.decoder";

describe('XingineDecoder', () => {

    it('should decode valid Wrappermeta', () => {
        const json = {
            className: 'a abc customclass',
            children:[
                {
                    component: 'WrapperRenderer',
                    properties: {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8',
                        style: {
                            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', // orange to peach gradient
                            color: '#ffffff',
                            padding: '16px',
                            borderRadius: '8px',
                        }
                    }
                }
            ],
            style: {
                color: 'red',
                fontSize: '16px',
                margin: '10px'
            },
            customAttrib1: 'value1',
            customAttrib2: 'value2'
        };
        const result = wrapperMetaDecoder.verify(json);
        const result2 = styleDecoder.verify(json);

        expect(result).toBeDefined();
        expect(result).toMatchObject({
            className: 'a abc customclass',
            style: {
                color: 'red',
                fontSize: '16px',
                margin: '10px'
            },
            children: [
                {
                    component: 'WrapperRenderer',
                    properties: {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8',
                        style: {
                            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', // orange to peach gradient
                            color: '#ffffff',
                            padding: '16px',
                            borderRadius: '8px',
                        }
                    }
                }
            ],

            customAttrib1: 'value1',
            customAttrib2: 'value2'
        });

        expect(result2).toBeDefined();
        expect(result2).toMatchObject({
            className: 'a abc customclass',
            style: {
                color: 'red',
                fontSize: '16px',
                margin: '10px'
            }
        });
        expect(result2.style).not.toHaveProperty('customAttrib1');
        expect(result2.style).not.toHaveProperty('customAttrib2');
    });
});