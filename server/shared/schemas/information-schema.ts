import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const informationSchemaColumns = pgTable('information_schema.columns', {
  columnName: text('column_name'),
  dataType: text('data_type'),
  tableName: text('table_name'),
});