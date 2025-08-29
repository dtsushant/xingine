import { resolvePath } from '../../core/utils/type';

describe('resolvePath function', () => {
    it('should extract simple values', () => {
        const data = {
            user: {
                name: 'Alice',
                age: 30,
                email: 'alice@example.com'
            }
        };

        expect(resolvePath(data, 'user.name')).toBe('Alice');
        expect(resolvePath(data, 'user.age')).toBe(30);
        expect(resolvePath(data, 'user.email')).toBe('alice@example.com');
    });

    it('should handle arrays', () => {
        const data = {
            items: ['first', 'second', 'third'],
            users: [
                { name: 'Alice', id: 1 },
                { name: 'Bob', id: 2 }
            ]
        };

        expect(resolvePath(data, 'items[0]')).toBe('first');
        expect(resolvePath(data, 'users[0].name')).toBe('Alice');
        expect(resolvePath(data, 'users[1].id')).toBe(2);
    });

    it('should return undefined for missing paths', () => {
        const data = { user: { name: 'Alice' } };

        expect(resolvePath(data, 'user.missing')).toBeUndefined();
        expect(resolvePath(data, 'missing.user')).toBeUndefined();
    });

    it('should handle __result context', () => {
        const context = {
            __result: {
                user: {
                    name: 'Alice',
                    age: 30
                },
                token: 'abc123'
            }
        };

        expect(resolvePath(context, '__result.user.name')).toBe('Alice');
        expect(resolvePath(context, '__result.token')).toBe('abc123');
        expect(resolvePath(context, '__result.user.age')).toBe(30);
    });
});
