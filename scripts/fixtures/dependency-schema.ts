// Input for local-only drizzle-kit generate; never a migration or remote schema.
import { pgTable, integer, text, uuid } from 'drizzle-orm/pg-core';

export const fixture = pgTable('nsl_dependency_fixture', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  capacity: integer('capacity').notNull().default(6),
});
