export type Operator =
  | "eq"
  | "ne"
  | "like"
  | "ilike"
  | "in"
  | "nin"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export interface BaseFilterCondition {
  field: string;
  operator: Operator;
  value: unknown;
}

export interface GroupCondition {
  and?: SearchCondition[];
  or?: SearchCondition[];
}

export type SearchCondition = BaseFilterCondition | GroupCondition;

export type SearchQuery = GroupCondition;
export type ConditionalExpression = SearchCondition;

export type ConditionalChain = {
    condition: ConditionalExpression;
    action: SerializableAction[]; // Array of actions to execute when condition is met
};

export type ActionResult = {
    success: boolean;
    result?: unknown;
    error?: unknown;
};

export type SerializableAction =
    | string // shorthand: "toggleDarkMode"
    | {
    action: string;            // e.g., "setState", "navigate"
    args?: Record<string, unknown>; // optional arguments
    valueFromEvent?: boolean;  // useful for input/change handlers
    chains?: ConditionalChain[]; // conditional chains based on result
    then?: SerializableAction[]; // unconditional action sequence - executes after main action
};


type StateSetter<T> = (value: T | ((prev: T) => T)) => void;
