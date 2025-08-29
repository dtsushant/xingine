import {resolvePath} from "./type";

export function extrapolate(template: string, context: Record<string, unknown>): string {
    return template.replace(/#\{([^}]+)\}/g, (_, expression: string) => {
        try {
            const result = evaluateExpression(expression.trim(), context);
            return result !== undefined && result !== null ? String(result) : 'undefined';
        } catch {
            return 'undefined';
        }
    });
}

const functionMap: Record<string, (...args: unknown[]) => unknown> = {
    exists: (value) => value !== undefined && value !== null,
    notExists: (value) => value === undefined || value === null
};

export function unsafeEvaluateExpression(expression: string, context: Record<string, unknown>): unknown {
    const allowedGlobals = ['true', 'false', 'null', 'undefined'];

    const topLevelKeys = Object.keys(context);
    const args = [...topLevelKeys, ...Object.keys(functionMap)];
    const values = [...topLevelKeys.map(k => context[k]), ...Object.values(functionMap)];

    try {
        const fnBody = `'use strict'; return (${expression});`;
        const evaluator = new Function(...args, fnBody);
        return evaluator(...values);
    } catch (err) {
        console.error('Evaluation error:', err);
        return undefined;
    }
}

export function evaluateExpression(expression: string, context: Record<string, unknown>): unknown {
    try {
        const parsed = parseTernary(expression);
        if (parsed) {
            const [conditionExpr, trueExpr, falseExpr] = parsed;
            const condition = evaluateExpression(conditionExpr, context);
            const chosen = condition ? trueExpr : falseExpr;

            if (/^['"].*['"]$/.test(chosen)) {
                return chosen.slice(1, -1);
            }

            return evaluateExpression(chosen, context);
        }

        // Function calls
        const fnCallMatch = expression.match(/^(\w+)\(([^)]*)\)$/);
        if (fnCallMatch) {
            const fnName = fnCallMatch[1];
            const argPath = fnCallMatch[2].trim();
            if (fnName in functionMap) {
                const argValue = resolvePath(context, argPath);
                return functionMap[fnName](argValue);
            }
        }

        // Parentheses
        while (expression.includes('(')) {
            expression = expression.replace(/\(([^()]+)\)/g, (_, inner) => {
                const result = evaluateExpression(inner, context);
                // Preserve boolean values as strings that can be parsed back
                if (typeof result === 'boolean') {
                    return result ? 'true' : 'false';
                }
                return String(result);
            });
        }

        // Logical OR
        const orParts = splitByTopLevelOperator(expression, '||');
        if (orParts.length > 1) return orParts.some(part => Boolean(evaluateExpression(part.trim(), context)));

        // Logical AND
        const andParts = splitByTopLevelOperator(expression, '&&');
        if (andParts.length > 1) return andParts.every(part => Boolean(evaluateExpression(part.trim(), context)));

        // Comparisons
        const operators = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
        for (const op of operators) {
            const idx = expression.indexOf(op);
            if (idx !== -1) {
                const left = expression.substring(0, idx).trim();
                const right = expression.substring(idx + op.length).trim();
                const leftVal = resolvePath(context, left);
                const rightVal = parseValue(right);

                switch (op) {
                    case '===':
                        // Special handling: treat undefined as false when comparing with false
                        if (rightVal === false && leftVal === undefined) {
                            return true;
                        }
                        if (leftVal === false && rightVal === undefined) {
                            return true;
                        }
                        return leftVal === rightVal;
                    case '!==':
                        // Special handling: treat undefined as false when comparing with false
                        if (rightVal === false && leftVal === undefined) {
                            return false;
                        }
                        if (leftVal === false && rightVal === undefined) {
                            return false;
                        }
                        return leftVal !== rightVal;
                    case '==': return leftVal == rightVal;
                    case '!=': return leftVal != rightVal;
                    case '>=': return Number(leftVal) >= Number(rightVal);
                    case '<=': return Number(leftVal) <= Number(rightVal);
                    case '>': return Number(leftVal) > Number(rightVal);
                    case '<': return Number(leftVal) < Number(rightVal);
                }
            }
        }

        // Handle boolean strings from parentheses processing
        if (expression === 'true') return true;
        if (expression === 'false') return false;

        return resolvePath(context, expression);
    } catch {
        return undefined;
    }
}

function parseTernary(expression: string): [string, string, string] | null {
    let depth = 0, qIndex = -1, cIndex = -1;

    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (depth === 0 && char === '?' && qIndex === -1) qIndex = i;
        else if (depth === 0 && char === ':' && qIndex !== -1) {
            cIndex = i;
            break;
        }
    }

    if (qIndex !== -1 && cIndex !== -1) {
        return [
            expression.slice(0, qIndex).trim(),
            expression.slice(qIndex + 1, cIndex).trim(),
            expression.slice(cIndex + 1).trim()
        ];
    }

    return null;
}

function parseValue(value: string): unknown {
    if (/^['"].*['"]$/.test(value)) return value.slice(1, -1);
    if (!isNaN(Number(value))) return Number(value);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
}

function splitByTopLevelOperator(expr: string, operator: '&&' | '||'): string[] {
    const result: string[] = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
        const c = expr[i];
        if (c === '(') depth++;
        else if (c === ')') depth--;

        if (depth === 0 && expr.slice(i, i + operator.length) === operator) {
            result.push(current);
            current = '';
            i += operator.length - 1;
        } else {
            current += c;
        }
    }
    if (current) result.push(current);
    return result;
}
