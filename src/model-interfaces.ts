export interface Document {
  documents: Entity[];
  documentCount: number;
  missing: Object[];
  readTime: String;
  transaction: String;
}

export interface Entity {
  name: String;
  fields: Field[];
  createTime: String;
  updateTime: String;
}

export interface Field {
  name: String;
  value: String;
}
