# Magnisale app

The Magnisale product app, built with Node.js and React. Its first feature is **Profiler**: a business pours in what it already has about itself, and Profiler turns it into one structured company profile that people and AI tools can reuse.

The marketing site is a separate repo (`magnisale`). Closer, the outreach product, will read profiles from this app through an internal API.

## Status

Built in the order of the Profiler PRD's milestones.

| Milestone | State |
|---|---|
| 1. Foundations: accounts, organisations, profile page with manual editing, data export and deletion | Done |
| 2. Input and extraction: website, files, interview, AI extraction | Next |
| 3. Review and purge | |
| 4. Gaps and follow-ups | |
| 5. Export and handoff to Closer | |
| 6. Pilot | |

## Getting started

Requires Node 24 and Docker.

```bash
npm install
docker compose up -d --wait db
npm run dev
```

Open <http://localhost:5173>. The API runs on port 8080 and Vite proxies `/api` to it. Migrations run when the API starts. No `.env` is needed for development; `.env.example` lists every setting.

Without SMTP configured, the password reset link is printed in the API log. The Google button appears once `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

## Commands

```bash
npm run dev          # API and web together
npm test             # needs the database running; uses a separate magnisale_test database
npm run typecheck
npm run lint
npm run build
npm run db:generate  # write a migration after changing apps/api/src/db/schema.ts
```

## Structure

```
packages/profile/   The profile itself, shared by API and web
  src/fields.ts     The field registry: every field, once
  src/values.ts     Validation and how values are stored
apps/api/           Fastify, Drizzle, Postgres
  src/auth/         Passwords, sessions, Google
  src/db/           Schema and migrations
  src/profile/      Reading and writing the saved profile
  src/routes/       HTTP endpoints, under /api/v1
apps/web/           React, Vite, Tailwind
  src/styles.css    Design System 1.1 tokens, copied from the marketing site
  src/components/   Shell, forms, field editors and views
  src/content/      The privacy notice
  src/pages/        One file per screen
docker/Dockerfile   One image: the API also serves the built web app
```

To add a profile field, add it to `packages/profile/src/fields.ts`. Validation and the profile page pick it up from there. Core sections must keep totalling a weight of 80 and flexible sections 20; a test checks this.

## Security notes

- Sessions are random tokens in an httpOnly cookie. The database holds only their SHA-256 hash.
- State-changing API calls need the `x-magnisale-csrf` header, and the API allows no cross-origin requests.
- Every profile query is scoped to the signed-in user's organisation.
- `TRUST_PROXY` must name the real reverse proxy in production, or all visitors share one sign-in rate limit. Do not set it to a number: Fastify treats that as "trust nobody".

## Before the pilot

- Check every `TO CONFIRM` line in `apps/web/src/content/privacy.ts`, set `draft` to `false`, and bump `PRIVACY_VERSION` in `apps/api/src/routes/auth.ts`.
- Create the Google OAuth client and choose an SMTP provider.
- Decide hosting (Cloud Run with Cloud SQL, or Closer's VM with a Postgres container). Keep backup retention at 30 days or less, to honour the deletion promise.
