---
name: SignalScope intelligence platform (export / audio / timeline / fusion)
description: Durable decisions for the deterministic intelligence features and the audio-briefing backend route.
---

# Deterministic intelligence composition (timeline, fusion, export, audio script)

Timeline, Cross-Source Fusion, export payloads, and the audio-briefing script are
all composed **deterministically on the frontend over real fields only** — never
via Gemini and never injected into the Gemini prompt. Mirror the established
Songstats/JamBase deterministic-composition pattern when extending them.

**Why:** Hard product constraint — no fabricated data, and the Gemini prompt /
Musixmatch/Songstats/JamBase fetch behavior must not change.

## Fusion "agreement" semantics — do NOT over-tighten

The Fusion card defines corroboration as **≥2 distinct real sources each
contributing a real signal to the same dimension** (audience / emotional /
market). It does NOT test semantic agreement on a single normalized claim
(e.g. theme + archetype + top-market all counting toward "Audience Match").

**Why:** This is exactly what the task spec requires and gives as its example
("Musixmatch theme + Gemini archetype + Songstats activity → High Confidence
Audience Match", shown only when ≥2 sources contribute, "No fabricated
agreement"). A code review may flag this as "not real corroboration" and suggest
semantic-agreement gating — that is stricter than the spec. Keep the
source-contribution definition unless the product owner explicitly asks for
semantic matching. All listed signals are real, so nothing is fabricated.

# Audio-briefing backend route (`POST /api/audio-briefing`)

Always returns **HTTP 200 + a status discriminator** (`unavailable` | `ok` |
`error`) and is never fatal. The FE composes the briefing script and POSTs
`{ commontrackId, script }`; the route only does ElevenLabs TTS + DB cache
(`audio_briefing_cache`, keyed by `commontrack_id`) for true generate-once.

Required guards (cost-abuse defense): a **valid positive `commontrack_id` is
mandatory** so every paid generation is cache-keyed (never an open TTS relay),
and **script length is bounded** (reject oversized payloads with
`{status:"error"}`). The config check (`isElevenLabsConfigured`) short-circuits
to `{status:"unavailable"}` before these guards, so with no key every response is
`unavailable`.

**Built against env secrets** `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`
(not the OAuth connector) so it degrades gracefully when unset.

# RichSync availability is per-track

RichSync is fetched by `commontrack_id` and is frequently absent (e.g. Iron
Maiden "Fear of the Dark" / 115895976 returns an empty body). The timeline and
fusion must degrade honestly to track-level themes/mood/meaning when there are no
timed signals — an empty timed list is correct data behavior, not a bug.
