---
name: SignalScope intelligence pipeline
description: Durable constraints for the /api/intelligence report pipeline — caching, fallback honesty, RichSync ingestion, and the duplicated FE/BE salience lexicons.
---

# Report caching + source meta
- Reports persist in `intelligence_reports` (keyed by `commontrack_id`) and are served from cache.
- Response carries non-breaking meta `source: "gemini" | "fallback"` and `cached: boolean`, attached AFTER Zod parse (Zod strips unknowns, so they must not be part of the validated schema).
- Cache bypass is `POST /api/intelligence?refresh=true`. Any "regenerate"/"retry" UI MUST send this, or it can keep returning a stale cached (possibly fallback) report.
  **Why:** without the flag, retry after a Gemini outage returns the cached fallback forever.

# Fallback must stay honest (no fabricated metrics)
- On Gemini failure the route returns `buildFallbackReport` (source `"fallback"`) instead of throwing.
- Fallback scores are deterministic coverage formulas over REAL extracted/derived signals only. Never invent numbers here.
  **Why:** product hard-constraint — no fabricated/mocked metrics anywhere.

# RichSync ingestion quirk
- The frontend forwards the raw Musixmatch RichSync payload as an object `{ richsync_body: <JSON string of RichSyncLine[]> }`, NOT a pre-parsed array.
- `extractSongSignals` must `parseRichSync(richsync_body)`; handling only `Array.isArray(richSync)` silently drops RichSync and leaves `richSyncMoments` empty while UI still claims RichSync contributes.
  **How to apply:** if RichSync-derived output looks empty, check the object-vs-array shape first.

# Duplicated salience lexicons (FE/BE) must stay in sync
- IDENTITY/EMOTIONAL word lists that score RichSync line salience live in BOTH `api-server/src/lib/intelligence/signals.ts` and `signalscope/src/lib/intelligence.ts` (no shared package).
- Both use tokenized exact-word matching + weight = identityHits*2 + emotionalHits*2 + (len>40 ? 1 : 0).
  **Why:** the displayed "RichSync Intelligence Timeline" must match the moments fed into report generation, or provenance claims are dishonest. Edit both together.

# Partner integrations are visual-only
- Songstats / JamBase / Cyanite / ElevenLabs are "Coming Soon" UI in the Intelligence Sources panel. No data is fetched or fabricated from them. Only Musixmatch + Gemini are live.
