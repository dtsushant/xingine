import "reflect-metadata";

import {
  ColumnMeta,
  FieldMeta,
  FormMeta,
} from "./component/component-meta-map";
import { DetailFieldMeta } from "./component/detail-meta-map";

export const FORM_FIELD_METADATA = "xingine:form-field";
export const DETAIL_FIELD_METADATA = "xingine:detail-field";
export const COLUMN_PROPERTY_METADATA = "xingine:column-property";


export function FormField(meta: FieldMeta): PropertyDecorator {
  return (target, propertyKey) => {
    const existing: FieldMeta[] =
      Reflect.getMetadata(FORM_FIELD_METADATA, target.constructor) || [];
    meta.name = propertyKey.toString(); // ensure name is always set
    Reflect.defineMetadata(
      FORM_FIELD_METADATA,
      [...existing, meta],
      target.constructor,
    );
  };
}

export function generateFormMeta(dtoClass: new () => any): FormMeta {
  const fields: FieldMeta[] =
    Reflect.getMetadata(FORM_FIELD_METADATA, dtoClass) || [];
  return {
    action: "",
    fields,
  };
}

export function DetailField(meta: DetailFieldMeta): PropertyDecorator {
  return (target, propertyKey) => {
    const existing: DetailFieldMeta[] =
      Reflect.getMetadata(DETAIL_FIELD_METADATA, target.constructor) || [];
    meta.name = propertyKey.toString(); // ensure name is always set
    Reflect.defineMetadata(
      DETAIL_FIELD_METADATA,
      [...existing, meta],
      target.constructor,
    );
  };
}

export function ColumnProperty(meta: ColumnMeta): PropertyDecorator {
  return (target, propertyKey) => {
    const existing: ColumnMeta[] =
      Reflect.getMetadata(COLUMN_PROPERTY_METADATA, target.constructor) || [];
    meta.title = propertyKey.toString();
    meta.dataIndex = propertyKey.toString();
    Reflect.defineMetadata(
      COLUMN_PROPERTY_METADATA,
      [...existing, meta],
      target.constructor,
    );
  };
}

