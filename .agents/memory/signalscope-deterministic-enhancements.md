---
name: SignalScope deterministic live/market enhancements
description: How external data sources (Songstats, JamBase) influence the workspace without touching the Gemini prompt.
---

# Deterministic FE composition, not Gemini injection

Any "intelligence" a new external source (Songstats market data, JamBase live/touring data)
adds to shared workspace surfaces — Overview Executive Briefing, Growth/Key Opportunities,
Distribution — is composed **deterministically on the frontend** from real returned fields
(plus a backend signals helper), and is **never injected into the Gemini prompt**.

**Why:** the hard product constraint is "keep Gemini intact + no fabricated metrics." Feeding
external numbers into the prompt risks the model paraphrasing/inventing around them. Deterministic
composition guarantees every surfaced figure traces back to a real field, shown only when present.

**How to apply:**
- Backend route per source returns 200 with a status discriminator (`ok|empty|unavailable|error`)
  so a source failure can never break the workspace or the report flow.
- Fetch the source in the `TrackWorkspace` shell, keyed off a stable id (ISRC for Songstats,
  artist name for JamBase), independent of the Gemini report.
- Gate every UI addition on `status === "ok"` AND presence of the specific field; provide an
  honest `<Source>Unavailable` component with unavailable/empty/error copy.
- `IntelligenceSourcesPanel` reads a STATIC source list; flip a "coming-soon" source to
  "Connected" at runtime by reading the live status from context, not by editing the list.
- Mirror the existing Songstats pattern for any new source (helpers in `lib/<source>.ts`,
  signals in `api-server/.../intelligence/<source>Signals.ts`).
