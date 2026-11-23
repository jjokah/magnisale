#!/usr/bin/env bash
# Rolls out one release on the VM, and returns to the previous one if it fails.
# Called by .github/workflows/deploy.yml:
#   sudo bash vm-deploy.sh <registry> <image-tag> <path-to-compose.yaml>
set -euo pipefail

REGISTRY=$1
TAG=$2
COMPOSE_SOURCE=$3
ROOT=/opt/magnisale
SECRET=magnisale-platform-env

umask 077
cd "$ROOT"
install -m 0600 "$COMPOSE_SOURCE" compose.yaml
gcloud secrets versions access latest --secret="$SECRET" > .env.next
mv .env.next .env
gcloud auth configure-docker "${REGISTRY%%/*}" --quiet

compose() {
  docker compose --project-directory "$ROOT" --env-file .env --env-file release.env -f compose.yaml "$@"
}

# Up, then checked from outside: through Cloudflare, the tunnel, Caddy and the API.
release_is_healthy() {
  local app_url
  app_url=$(sed -n "s/^APP_URL=['\"]\{0,1\}\([^'\"]*\)['\"]\{0,1\}$/\1/p" .env)
  compose up -d --no-build --wait --wait-timeout 180 --remove-orphans &&
    curl -fsS --retry 12 --retry-delay 5 --retry-all-errors --max-time 10 \
      "$app_url/api/v1/health" > /dev/null
}

previous=""
if [ -f release.env ]; then previous=$(cat release.env); fi
printf 'IMAGE_REGISTRY=%s\nIMAGE_TAG=%s\n' "$REGISTRY" "$TAG" > release.env

# A failed pull changes nothing that is running.
if ! compose pull --quiet; then
  if [ -n "$previous" ]; then printf '%s\n' "$previous" > release.env; fi
  echo "Could not pull release $TAG. Nothing was changed." >&2
  exit 1
fi

if release_is_healthy; then
  docker image prune -af --filter "until=168h" > /dev/null
  echo "Release $TAG is live."
  exit 0
fi

echo "Release $TAG failed its health check." >&2
compose ps -a >&2
compose logs --tail 40 api migrate >&2 || true

if [ -n "$previous" ]; then
  printf '%s\n' "$previous" > release.env
  # Migrations only move forward, so the database keeps any applied by the failed release.
  compose up -d --no-build --wait --wait-timeout 180 --remove-orphans
  echo "Returned to the previous release." >&2
fi
exit 1
