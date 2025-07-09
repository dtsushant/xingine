import {layoutComponentDetailDecoder, wrapperMetaDecoder} from "../../core/xingine.decoder";
import {styleDecoder} from "../../core/decoders";

describe('XingineDecoder', () => {

    it('should decode valid Wrappermeta', () => {
        const json = {
            children:[
                {
                    component: 'WrapperRenderer',
                    properties: {
                        style: {
                            className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8',
                            style: {
                                background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', // orange to peach gradient
                                color: '#ffffff',
                                padding: '16px',
                                borderRadius: '8px',
                            }
                        }
                    }
                }
            ],
            style:{
                className: 'a abc customclass',
                style: {
                    color: 'red',
                    fontSize: '16px',
                    margin: '10px'
                }
            },
            customAttrib1: 'value1',
            customAttrib2: 'value2'
        };
        const result = wrapperMetaDecoder.verify(json);
        const result2 = styleDecoder.verify(json);

        expect(result).toBeDefined();
        expect(result).toMatchObject({
            style: {
                className: 'a abc customclass',
                style: {
                    color: 'red',
                    fontSize: '16px',
                    margin: '10px'
                }
            },
            children: [
                {
                    component: 'WrapperRenderer',
                    properties: {
                        style: {
                            className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8',
                            style: {
                                background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', // orange to peach gradient
                                color: '#ffffff',
                                padding: '16px',
                                borderRadius: '8px',
                            }
                        }
                    }
                }
            ],

            customAttrib1: 'value1',
            customAttrib2: 'value2'
        });

        expect(result2).toBeDefined();
        expect(result2).toMatchObject({
            style: {
                className: 'a abc customclass',
                style: {
                    color: 'red',
                    fontSize: '16px',
                    margin: '10px'
                }
            }
        });
        expect(result2.style).not.toHaveProperty('customAttrib1');
        expect(result2.style).not.toHaveProperty('customAttrib2');
    });
    it('should decode valid ComponentLayoutDetail', () => {
        const input = {
            meta: {
                component: 'WrapperRenderer',
                properties: {
                    style: {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8',
                        style: {
                            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', // orange to peach gradient
                            color: '#ffffff',
                            padding: '16px',
                            borderRadius: '8px',
                        }
                    },
                    children: [
                        {
                        meta:{
                            component:'UserDefinedComponent',
                                properties:{
                                customProperty: 'customValue',
                                    customPropertyNested:{
                                    nested1: 'nestedValue1',
                                    nested2:'nestedValue2'
                            }
                        }
                        }
                    }
                    ]
                }
            },
        };

        const result = layoutComponentDetailDecoder.verify(input);
        expect(result).toEqual(input);
    });

});