# syntax=docker/dockerfile:1
# Also the image of the one-shot migrate step: `node migrate.js`.

FROM node:24-slim AS build
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm turbo run build --filter=@magnisale/workers

FROM node:24-slim AS runtime
ENV NODE_ENV=production
ENV MIGRATIONS_DIR=/app/migrations
WORKDIR /app
COPY --from=build /repo/apps/workers/dist ./
RUN npm install --omit=dev --no-audit --no-fund
USER node

CMD ["node", "index.js"]
