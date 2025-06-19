import {
  array,
  Decoder,
  lazy,
  object,
  oneOf,
  optional,
  string,
  unknown,
} from "decoders";
import {
  BaseFilterCondition, ConditionalExpression,
  GroupCondition,
  Operator,
  SearchCondition,
  SearchQuery,
} from "../expressions/operators";
import { isBaseCondition, isGroupCondition } from "../utils/type";

export const operatorDecoder: Decoder<Operator> = oneOf([
  "eq",
  "ne",
  "like",
  "ilike",
  "in",
  "nin",
  "gt",
  "gte",
  "lt",
  "lte",
]);

const baseConditionDecoderBase = object({
  field: string,
  operator: operatorDecoder,
  value: unknown,
});

function baseFilterConditionDecoder(): Decoder<BaseFilterCondition> {
  return baseConditionDecoderBase.transform((baseFilterCondition) => {
    return baseFilterCondition as BaseFilterCondition;
  });
}

const groupConditionDecoder: Decoder<GroupCondition> = object({
  and: optional(array(lazy(() => searchConditionDecoder))),
  or: optional(array(lazy(() => searchConditionDecoder))),
});

export const searchConditionDecoder: Decoder<SearchCondition> = lazy(() =>
  unknown.transform((value) => {
    if (isBaseCondition(value)) {
      return baseFilterConditionDecoder().verify(value);
    }
    if (isGroupCondition(value)) {
      return groupConditionDecoder.verify(value);
    }
    throw new Error("Invalid SearchCondition: must be base or group condition");
  }),
);

const expressionDecoder = object({
  and: optional(array(searchConditionDecoder)),
  or: optional(array(searchConditionDecoder)),
});

export const searchQueryDecoder: Decoder<SearchQuery> = expressionDecoder;
export const conditionalExpressionDecoder: Decoder<ConditionalExpression> = expressionDecoder;