import { sql } from "drizzle-orm";
import { customType, pgPolicy, timestamp } from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

export const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

/** The setting `withCompany` writes for the length of a transaction. */
export const COMPANY_SETTING = "app.company_id";

const currentCompany = sql.raw(`nullif(current_setting('${COMPANY_SETTING}', true), '')::uuid`);

/**
 * Row-level security for a table with a `company_id` column. Outside
 * `withCompany` the setting is empty, so a query sees no rows and can write none.
 */
export const companyPolicy = (table: string) =>
  pgPolicy(`${table}_company_isolation`, {
    for: "all",
    using: sql`company_id = ${currentCompany}`,
    withCheck: sql`company_id = ${currentCompany}`,
  });
