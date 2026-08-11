import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const uploads = sqliteTable("uploads", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  datasetType: text("dataset_type").notNull(),
  filename: text("filename").notNull(),
  objectKey: text("object_key").notNull(),
  bytes: integer("bytes").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  status: text("status").notNull().default("stored"),
  createdAt: integer("created_at").notNull(),
}, table => [index("idx_uploads_owner_created").on(table.ownerId, table.createdAt)]);

export const snapshots = sqliteTable("snapshots", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  objectKey: text("object_key").notNull(),
  createdAt: integer("created_at").notNull(),
}, table => [index("idx_snapshots_owner_created").on(table.ownerId, table.createdAt)]);
