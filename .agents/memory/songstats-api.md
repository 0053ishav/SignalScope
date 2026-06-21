---
name: Songstats API behavior & caching
description: Non-obvious facts about the Songstats Enterprise API and SignalScope's caching that bite during development
---

# Songstats Enterprise API in SignalScope

## No audio analysis exists
- `/tracks/info` returns rich catalog metadata (genres, distributors, labels, collaborators with roles, links, is_remix, avatar, release_date) and `/tracks/stats?source=all` returns per-platform metrics.
- **There is NO audio analysis**: every audio endpoint (tempo/key/energy/etc.) returns 404.
- **How to apply:** The Sonic Intelligence page must stay an honest coming-soon — never build audio-derived cards or fabricate audio features. Do not waste time probing audio endpoints again.

## `links` arrive multiple-per-source
- `/tracks/info` `links` contains several entries per source (different ISRCs / mixes / regions), each `{source, external_id, url, isrc}`.
- **How to apply:** Dedupe to one link per source (prefer the entry whose `isrc` matches the queried ISRC) before display — see `extractLinks` in `api-server/.../services/songstats.ts`.

## Cache masks normalize() changes during dev
- The `/api/songstats/:isrc` route serves from the `songstats_cache` table (keyed by ISRC) with a 12h TTL.
- **Why:** Songstats is rate-limited (~10 req/s) so snapshots are cached.
- **How to apply:** After changing the backend `normalize()` shape, a plain GET returns the OLD cached shape (e.g. new fields come back null). Always re-test with `?refresh=true` to bypass the cache, or you'll think your change didn't work.

## "usable" gate must cover all metadata fields
- `normalize()` returns null (→ route responds `empty`) unless `hasAnything` is true.
- **How to apply:** When adding a new metadata field, also add it to the `hasMetadata`/`hasAnything` gate, or a track carrying only that field will be wrongly reported as `empty`.
