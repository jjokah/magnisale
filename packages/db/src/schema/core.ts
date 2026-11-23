import { bigint, boolean, index, integer, pgTable, primaryKey, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { bytea, companyPolicy, timestamptz } from "./columns.js";

/**
 * Accounts and companies. Better Auth reads and writes these tables through its
 * Drizzle adapter (see packages/auth): its "organization" is a company and its
 * "member" a membership. Their property names follow what it expects.
 */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** Stored lower-case by Better Auth, so the constraint is case-insensitive. */
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  /** NDPA consent. Null until given: Google sign-ups give it on the welcome step. */
  consentAt: timestamptz("consent_at"),
  consentVersion: text("consent_version"),
  isStaff: boolean("is_staff").notNull().default(false),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeOrganizationId: uuid("active_company_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamptz("expires_at").notNull(),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_sessions_user").on(t.userId), index("idx_sessions_expires").on(t.expiresAt)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamptz("access_token_expires_at"),
    refreshTokenExpiresAt: timestamptz("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_accounts_user").on(t.userId),
    uniqueIndex("uq_accounts_provider").on(t.providerId, t.accountId),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamptz("expires_at").notNull(),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_verifications_identifier").on(t.identifier), index("idx_verifications_expires").on(t.expiresAt)],
);

export const rateLimits = pgTable("rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  /** Magnisale staff can see a profile only while this is set. */
  sharedWithMagnisaleAt: timestamptz("shared_with_magnisale_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  // One company per account in v1. Dropping this index is what opens up teams.
  (t) => [uniqueIndex("uq_memberships_user").on(t.userId), index("idx_memberships_company").on(t.organizationId)],
);

/** Required by Better Auth's organization plugin. Unused until teams ship. */
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull().default("pending"),
    expiresAt: timestamptz("expires_at").notNull(),
    inviterId: uuid("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_invitations_company").on(t.organizationId), index("idx_invitations_email").on(t.email)],
);

export const companyAssets = pgTable(
  "company_assets",
  {
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    mime: text("mime").notNull(),
    bytes: bytea("bytes").notNull(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.companyId, t.kind] }), companyPolicy("company_assets")],
);
