import { Entity, Field } from "./model-interfaces";

export class DocumentMapper {
  static toEntity(data: any): Entity {
    let entity: Entity = {
      name: data.name,
      fields: [],
      createTime: data.createTime,
      updateTime: data.updateTime,
    };
    const fieldNames = Object.keys(data.fields);
    fieldNames.forEach((fieldName) => {
      const value = Object.values<String>(data.fields[fieldName])[0];
      entity.fields.push({ name: fieldName, value: value } as Field);
    });

    return entity;
  }

  static toListEntity(data: any): Entity[] {
    let entities: Entity[] = [];

    const documents = Object.values(data)[0];
    const dataEntities = Object.values(documents);

    dataEntities.forEach((entity) => {
      entities.push(this.toEntity(entity));
    });

    return entities;
  }
}
