---
name: SignalScope intelligence pipeline
description: Durable constraints for the AI intelligence report pipeline — fallback honesty, RichSync ingestion shape, and the duplicated FE/BE salience lexicons.
---

# No fabricated metrics — ever
- When AI synthesis is unavailable, the report falls back to ontology-derived signals only; scores are deterministic coverage formulas over REAL extracted signals. Never invent numbers.
- Partner integrations beyond Musixmatch + Gemini (Songstats / JamBase / Cyanite / ElevenLabs) are visual "Coming Soon" only — no data is fetched or fabricated from them.
  **Why:** product hard-constraint. Any number on screen must trace to a real source.

# Cache + retry must be able to bypass
- Reports are cached; a "regenerate"/"retry" affordance MUST force a cache bypass, or a stale (possibly fallback) report is returned forever after an outage.
  **How to apply:** when adding any refresh UI, confirm it actually re-runs synthesis rather than re-reading cache.

# RichSync arrives as an object, not an array
- The frontend forwards the raw Musixmatch RichSync payload `{ richsync_body: <JSON string> }`. Backend signal extraction must parse `richsync_body`; code that only handles a pre-parsed array silently drops RichSync and leaves the timing-derived signals empty while the UI still claims they contribute.
  **How to apply:** if RichSync-derived output looks empty, check the object-vs-array shape first.

# Salience lexicons are duplicated FE/BE — keep in sync
- The identity/emotional word lists that score RichSync line salience exist in both the backend signal extractor and the frontend (no shared package). The displayed "RichSync Intelligence Timeline" must match the moments fed into report generation.
  **Why:** divergent lexicons make the provenance/attribution dishonest. Edit both together.
