// Module-local types for the visual Database builder.

export type FieldType = "text" | "number" | "boolean" | "date" | "relation" | "json";

export interface TableField {
  name: string;
  type: FieldType;
  required: boolean;
}

export type RelationKind = "has_many" | "belongs_to";

export interface TableRelation {
  to: string;
  kind: RelationKind;
}

export interface DbTable {
  id: string;
  name: string;
  description: string;
  fields: TableField[];
  relations: TableRelation[];
  records: number;
  updatedAt: string;
}
