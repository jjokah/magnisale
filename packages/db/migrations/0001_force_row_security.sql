-- Row-level security also binds the table owner, so running the app with the
-- wrong role by mistake cannot read across companies. Foreign-key cascades are
-- exempt, so deleting a company still removes its rows.
ALTER TABLE "company_assets" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profile_sections" FORCE ROW LEVEL SECURITY;
