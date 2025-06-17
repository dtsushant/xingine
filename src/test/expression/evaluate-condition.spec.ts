import {evaluateCondition} from "../../core/utils/type";
import {SearchCondition} from "../../core/expressions/operators";


describe('evaluateCondition', () => {
    const context = {
        user: {
            role: 'admin',
            age: 30,
            active: true,
        },
        tags: ['foo', 'bar'],
    };

    it('should evaluate eq', () => {
        const cond: SearchCondition = { field: 'user.role', operator: 'eq', value: 'admin' };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate ne', () => {
        const cond: SearchCondition = { field: 'user.role', operator: 'ne', value: 'user' };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate gt', () => {
        const cond: SearchCondition = { field: 'user.age', operator: 'gt', value: 25 };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate gte', () => {
        const cond: SearchCondition = { field: 'user.age', operator: 'gte', value: 30 };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate lt', () => {
        const cond: SearchCondition = { field: 'user.age', operator: 'lt', value: 40 };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate lte', () => {
        const cond: SearchCondition = { field: 'user.age', operator: 'lte', value: 30 };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate like', () => {
        const cond: SearchCondition = { field: 'user.role', operator: 'like', value: 'adm' };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate ilike', () => {
        const cond: SearchCondition = { field: 'user.role', operator: 'ilike', value: 'AdMiN' };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate in', () => {
        const cond: SearchCondition = { field: 'user.role', operator: 'in', value: ['admin', 'user'] };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate nin', () => {
        const cond: SearchCondition = { field: 'user.role', operator: 'nin', value: ['guest', 'super'] };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate and group', () => {
        const cond: SearchCondition = {
            and: [
                { field: 'user.age', operator: 'gte', value: 18 },
                { field: 'user.role', operator: 'eq', value: 'admin' },
            ],
        };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should evaluate or group', () => {
        const cond: SearchCondition = {
            or: [
                { field: 'user.age', operator: 'lt', value: 18 },
                { field: 'user.role', operator: 'eq', value: 'admin' },
            ],
        };
        expect(evaluateCondition(cond, context)).toBe(true);
    });

    it('should return false if none match in or group', () => {
        const cond: SearchCondition = {
            or: [
                { field: 'user.age', operator: 'lt', value: 18 },
                { field: 'user.role', operator: 'eq', value: 'guest' },
            ],
        };
        expect(evaluateCondition(cond, context)).toBe(false);
    });
});
