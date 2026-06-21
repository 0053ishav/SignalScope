---
name: api-server dev & testing gotchas
description: How the api-server dev workflow runs and how to actually reach its routes when testing
---

# api-server runs a built bundle, not a live-reload server

The `artifacts/api-server` dev workflow runs `build && start` (esbuild → `dist/index.mjs`, then `node dist/index.mjs`). It does **NOT** watch/hot-reload backend source.

**Why:** changes to Express routes/services do not take effect until the workflow is restarted (which re-runs the build). A route can return 404 purely because the running bundle predates the edit.

**How to apply:** after editing any `artifacts/api-server` source, restart the `artifacts/api-server: API Server` workflow before testing, or the old build is still serving.

# Reaching api routes when testing from the shell

`curl "$REPLIT_DEV_DOMAIN/api/..."` frequently returns an **empty body** (proxy/mTLS quirk) even for healthy endpoints like `/api/healthz` — this is NOT a route bug.

**How to apply:** test the api-server directly on its local port instead: `curl http://localhost:8080/api/<route>`. Routes are mounted under `/api` (so `/healthz` alone 404s; `/api/healthz` works).
