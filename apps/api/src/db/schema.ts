import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { SectionData } from "@magnisale/profile";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Stored lower-case, so the unique constraint is case-insensitive. */
  email: text("email").notNull().unique(),
  /** Null for accounts that only sign in with Google. */
  passwordHash: text("password_hash"),
  googleSub: text("google_sub").unique(),
  name: text("name").notNull(),
  /** Set once the person has proved they own the email (Google or a reset link). */
  emailVerifiedAt: timestamptz("email_verified_at"),
  /** NDPA consent. Null until given: Google sign-ups give it on the welcome step. */
  consentAt: timestamptz("consent_at"),
  consentVersion: text("consent_version"),
  isStaff: boolean("is_staff").notNull().default(false),
  passwordChangedAt: timestamptz("password_changed_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** Magnisale staff can see a profile only while this is set. */
  sharedWithMagnisaleAt: timestamptz("shared_with_magnisale_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    // The primary key on user_id is v1's "one organisation per account".
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_memberships_org").on(t.orgId)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the cookie's token, so a database leak yields no usable session. */
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamptz("expires_at").notNull(),
    lastSeenAt: timestamptz("last_seen_at").notNull().defaultNow(),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_sessions_user").on(t.userId), index("idx_sessions_expires").on(t.expiresAt)],
);

export const passwordResets = pgTable(
  "password_resets",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamptz("expires_at").notNull(),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_password_resets_user").on(t.userId)],
);

export const profileSections = pgTable(
  "profile_sections",
  {
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    section: text("section").notNull(),
    schemaVersion: integer("schema_version").notNull(),
    data: jsonb("data").$type<SectionData>().notNull().default(sql`'{}'::jsonb`),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.section] })],
);

export const orgAssets = pgTable(
  "org_assets",
  {
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    mime: text("mime").notNull(),
    bytes: bytea("bytes").notNull(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.kind] })],
);
