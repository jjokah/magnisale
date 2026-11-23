# Magnisale

One TypeScript monorepo for the Magnisale website, customer platform, API and background workers. The first product feature is **Profiler**: a business pours in what it already has about itself, and Profiler turns it into one structured company profile that people and AI tools can reuse.

```
apps/
  web/            Astro marketing site, magnisale.com (GitHub Pages)
  platform/       React + Vite + TanStack Router, app.magnisale.com
  api/            Hono API, served at app.magnisale.com/api
  workers/        Background jobs on pg-boss, and the migrate step
packages/
  ui/             Design System 1.1: tokens, fonts, React components
  db/             Drizzle schema, migrations, row-level security, withCompany
  auth/           Better Auth, with organisations as companies
  profiler/       Profiler's domain logic ("." is browser-safe, "./server" is not)
  validation/     Request schemas shared by the API and platform
  queue/          pg-boss setup and typed job definitions
  integrations/   Third-party services (email today)
  config/         TypeScript, ESLint and server build configuration
docker/           Dockerfiles, Caddyfile and compose files
```

`agent-core` arrives with Profiler milestone 2. Closer stays in its own repo until after the Profiler pilot, then moves in here.

## Status

| Profiler milestone | State |
|---|---|
| 1. Foundations: accounts, companies, editable profile, data export and deletion | Done |
| 2. Input and extraction: website, files, interview, AI extraction | Next |
| 3. Review and purge | |
| 4. Gaps and follow-ups | |
| 5. Export and handoff to Closer | |
| 6. Pilot | |

## Getting started

Requires Node 24, Docker and pnpm (`corepack enable`).

```bash
pnpm install
pnpm db:up      # Postgres on port 5433
pnpm dev        # migrates, then runs the API, workers and platform
```

Open <http://localhost:5173>. Vite proxies `/api` to the API on port 8080, so the browser sees one origin, as in production. No `.env` is needed for development; `.env.example` lists every setting.

Without SMTP configured, the password reset link is printed in the API log. The Google button appears once `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

For the website alone, run `pnpm dev:web` and see [apps/web/README.md](apps/web/README.md).

## Commands

```bash
pnpm dev            # API, workers and platform
pnpm dev:web        # the marketing site
pnpm test           # needs the database; uses a separate magnisale_test database
pnpm typecheck
pnpm lint
pnpm build
pnpm db:generate    # write a migration after changing packages/db/src/schema
pnpm db:migrate     # apply migrations
```

## How it fits together

- **Business logic lives in packages**, so the API and workers share it. Routes and jobs stay thin. ESLint stops browser apps importing server code, and stops apps importing each other. The platform may import only *types* from the API, which is how its calls are type-checked end to end.
- **To add a profile field**, add it to `packages/profiler/src/fields.ts`. Validation and the profile page pick it up from there. Core sections must keep totalling a weight of 80 and flexible sections 20; a test checks this.
- **Tenant isolation is enforced by Postgres.** Tables with a `company_id` have row-level security, and the API and workers connect as `magnisale_app`, which cannot bypass it. Read and write them inside `withCompany(db, companyId, ...)`. Outside it, a query sees no rows. Give every new tenant table a `companyPolicy` and add it to a `FORCE ROW LEVEL SECURITY` migration.
- **Job data is IDs only.** pg-boss keeps finished jobs for a while, so customer content in a job would outlive the promise to delete raw input. `sendJob` refuses anything else.
- **Migrations run once**, in the `migrate` step, as the database owner. The API and workers wait for it.

## Security notes

- Session cookies are httpOnly and signed, so a database leak alone cannot produce a working session.
- State-changing `/api/v1` calls need the `x-magnisale-csrf` header. Better Auth checks the `Origin` of its own routes, forced on in every environment because it otherwise switches off under `NODE_ENV=test`.
- A Google sign-in never joins an existing account by email alone, which blocks pre-account hijacking.
- `TRUST_PROXY` must name the real reverse proxy, or all visitors share one sign-in rate limit. Do not set it to a number: Fastify-style hop counts are not supported.

## Deploying the platform

```bash
cp .env.example .env   # fill in the production section
docker compose --env-file .env -f docker/compose.yaml up -d --build
```

Caddy is the only service with a public port. It gets a certificate for `APP_DOMAIN`, serves the platform and routes `/api` to the API. The website deploys separately to GitHub Pages when it changes on `main`.

## Before the pilot

- Check every `TO CONFIRM` line in `apps/platform/src/content/privacy.ts`, set `draft` to `false`, and bump `PRIVACY_VERSION` in `packages/auth/src/index.ts`.
- Create the Google OAuth client and choose an SMTP provider.
- Decide hosting, and keep backup retention at 30 days or less to honour the deletion promise.
