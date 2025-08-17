import {
  BaseFilterCondition, ConditionalExpression,
  GroupCondition,
  SearchCondition,
  SearchQuery, SerializableAction
} from "../expressions";
import {FieldMeta} from "../component";

export type Constructor<T = unknown> = new (...args: unknown[]) => T;

export function extractRouteParams(path: string): string[] {
  const matches = path.match(/:([a-zA-Z0-9_.]+)/g);
  return matches?.map((param) => param.slice(1)) ?? [];
}
export function resolveSluggedPath(
  template: string,
  params: unknown,
  conditionalNamedPath?: Record<string, string>,
): string {
  return template.replace(/:([a-zA-Z0-9_.]+)/g, (_, key) => {
    let keyToResolve = key;
    if (conditionalNamedPath) {
      keyToResolve = conditionalNamedPath[key];
    }
    const value = resolvePath(params, keyToResolve);
    if (value === undefined) {
      console.warn(`Missing route param: ${key}`);
      return `:${key}`;
    }
    return encodeURIComponent(String(value));
  });
}

export function resolvePath(input: unknown, path: string): unknown {
  if (input === null || typeof input !== 'object') return undefined;

  // Split path into segments: supports "items[0].name" or "user.profile.name"
  const parts = path.split(/[\.\[\]]/).filter(Boolean); // removes empty strings

  return parts.reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;

    if (Array.isArray(acc)) {
      const index = Number(key);
      return isNaN(index) ? undefined : acc[index];
    }

    if (typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, input);
}

export function isBaseCondition(val: unknown): val is BaseFilterCondition {
  return (
    typeof val === "object" &&
    val !== null &&
    "field" in val &&
    "operator" in val &&
    "value" in val
  );
}

export function isGroupCondition(val: unknown): val is GroupCondition {
  return (
    typeof val === "object" && val !== null && ("and" in val || "or" in val)
  );
}

export const isObjectField = (field: FieldMeta): field is FieldMeta & {
    inputType: 'object';
    properties: { fields: FieldMeta[] }
} => {
    return field.inputType === 'object' &&
        field.properties !== undefined &&
        'fields' in field.properties &&
        Array.isArray(field.properties.fields);
};

export const isObjectArrayField = (field: FieldMeta): field is FieldMeta & {
    inputType: 'object[]';
    properties: { itemFields: FieldMeta[] }
} => {
    return field.inputType === 'object[]' &&
        field.properties !== undefined &&
        'itemFields' in field.properties &&
        Array.isArray(field.properties.itemFields);
};

export function buildMikroOrmWhereFromNestedCondition(
  query: SearchQuery,
): Record<string, unknown> {
  return transformConditionGroup(query);
}

function transformConditionGroup(
  group: GroupCondition,
): Record<string, unknown> {
  const conditions: Record<string, unknown> = {};

  if (group.and && group.and.length > 0) {
    conditions.$and = group.and.map(transformCondition);
  }

  if (group.or && group.or.length > 0) {
    conditions.$or = group.or.map(transformCondition);
  }

  return conditions;
}

function transformCondition(cond: SearchCondition): Record<string, unknown> {
  if (isBaseCondition(cond)) {
    const { field, operator, value } = cond;
    const wildcardValue =
      typeof value === "string" && (operator === "like" || operator === "ilike")
        ? `%${value}%`
        : value;
    switch (operator) {
      case "eq":
        return { [field]: value };
      case "ne":
        return { [field]: { $ne: value } };
      case "like":
        return { [field]: { $like: wildcardValue } };
      case "ilike":
        return { [field]: { $ilike: wildcardValue } };
      case "in":
        return { [field]: { $in: Array.isArray(value) ? value : [value] } };
      case "nin":
        return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
      case "gt":
        return { [field]: { $gt: value } };
      case "gte":
        return { [field]: { $gte: value } };
      case "lt":
        return { [field]: { $lt: value } };
      case "lte":
        return { [field]: { $lte: value } };
      default:
        return {};
    }
  }

  if (isGroupCondition(cond)) {
    return transformConditionGroup(cond);
  }

  throw new Error("Invalid SearchCondition: must be base or group");
}

export function evaluateCondition(
    condition: ConditionalExpression,
    context: Record<string, unknown>
): boolean {
  // Handle group condition
  if ('and' in condition) {
    return Array.isArray(condition.and) && condition.and.every((sub) => evaluateCondition(sub, context));
  }

  if ('or' in condition) {
    return Array.isArray(condition.or) && condition.or.some((sub) => evaluateCondition(sub, context));
  }

  const base = condition as BaseFilterCondition;
  const actualValue = resolvePath(context, base.field);

  switch (base.operator) {
    case 'eq':
      return actualValue === base.value;
    case 'ne':
      return actualValue !== base.value;
    case 'like':
      return typeof actualValue === 'string' && typeof base.value === 'string' && actualValue.includes(base.value);
    case 'ilike':
      return typeof actualValue === 'string' && typeof base.value === 'string' &&
          actualValue.toLowerCase().includes(base.value.toLowerCase());
    case 'in':
      return Array.isArray(base.value) && base.value.includes(actualValue);
    case 'nin':
      return Array.isArray(base.value) && !base.value.includes(actualValue);
    case 'gt':
      return typeof actualValue === 'number' && typeof base.value === 'number' && actualValue > base.value;
    case 'gte':
      return typeof actualValue === 'number' && typeof base.value === 'number' && actualValue >= base.value;
    case 'lt':
      return typeof actualValue === 'number' && typeof base.value === 'number' && actualValue < base.value;
    case 'lte':
      return typeof actualValue === 'number' && typeof base.value === 'number' && actualValue <= base.value;
    default:
      return false;
  }
}

export function extractFieldsFromCondition(
    condition?: SearchCondition
): string[] {
  const fields = new Set<string>();

  const walk = (cond?: SearchCondition) => {
    if (!cond) return;

    if ('field' in cond && typeof cond.field === 'string') {
      fields.add(cond.field);
    }

    if ('and' in cond && Array.isArray(cond.and)) {
      cond.and.forEach(walk);
    }

    if ('or' in cond && Array.isArray(cond.or)) {
      cond.or.forEach(walk);
    }
  };

  walk(condition);
  return [...fields];
}

/**
 * Safely retrieves a typed value from an object by key.
 * @param obj The object to retrieve the value from.
 * @param key The key to look up in the object.
 * @returns The value cast to type T, or undefined if the key does not exist.
 */
export function getTypedValue<T>(obj: { [key: string]: unknown }, key: string): T | undefined {
  const value = resolvePath(obj, key);
  return value as T | undefined;
}

/*export function extrapolate(template: string, context: Record<string, unknown>): string {
  return template.replace(/#\{([^}]+)\}/g, function (_match: string, expression: string): string {
    try {
      const [conditionPart, truePart, falsePart] = parseTernary(expression.trim());

      if (falsePart !== undefined) {
        const conditionResult = resolvePath(context, conditionPart.trim());
        return conditionResult ? truePart ?? '' : falsePart ?? '';
      } else {
        const result = resolvePath(context, conditionPart.trim());
        return result !== undefined && result !== null ? String(result) : 'undefined';
      }
    } catch (e) {
      return `#{ERROR: ${String(e)}}`;
    }
  });
}

function parseTernary(expr: string): [string, string?, string?] {
  const ternaryMatch = expr.match(/^(.+?)\?(.*?)\:(.*)$/);
  if (ternaryMatch) {
    return [
      ternaryMatch[1].trim(),
      ternaryMatch[2].trim().replace(/^['"]|['"]$/g, ''),
      ternaryMatch[3].trim().replace(/^['"]|['"]$/g, '')
    ];
  } else {
    return [expr];
  }
}*/

export function getActionRef(
    expression: SerializableAction,
    context: Record<string, unknown>
): ((...args: unknown[]) => unknown) | undefined {

  const resolveFunction = (key: string) => {
    const fn = resolvePath(context, key);
    return typeof fn === 'function' ? (fn as (...args: unknown[]) => unknown) : undefined;
  };

  if (typeof expression === 'string') {
    return resolveFunction(expression);
  }

  if (typeof expression === 'object' && typeof expression.action === 'string') {
    const baseFn = resolveFunction(expression.action);
    if (!baseFn) return undefined;

    return (...args: unknown[]) => {
      if (expression.valueFromEvent) {
        const [value, event] = args;
        return baseFn(value, event);
      } else {
        return baseFn(expression.args);
      }
    };
  }

  return undefined;
}
