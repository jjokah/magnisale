# syntax=docker/dockerfile:1
# Caddy with the built platform inside it.

FROM node:24-slim AS build
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm turbo run build --filter=@magnisale/platform

FROM caddy:2-alpine
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/apps/platform/dist /srv
