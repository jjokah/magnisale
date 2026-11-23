import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { companyPolicy, timestamptz } from "./columns.js";
import { companies } from "./core.js";

export const profileSections = pgTable(
  "profile_sections",
  {
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    section: text("section").notNull(),
    schemaVersion: integer("schema_version").notNull(),
    /** Typed by @magnisale/profiler, which owns the shape. */
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.companyId, t.section] }), companyPolicy("profile_sections")],
);
