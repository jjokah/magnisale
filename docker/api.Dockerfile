# syntax=docker/dockerfile:1

# 1. Bundle the API and the workspace packages it uses.
FROM node:24-slim AS build
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm turbo run build --filter=@magnisale/api

# 2. Runtime: the bundle plus its native dependencies, and nothing else.
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/api/dist ./
RUN npm install --omit=dev --no-audit --no-fund
ENV PORT=8080
EXPOSE 8080
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "index.js"]
