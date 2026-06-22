---
name: SignalScope Intelligence Health Bar
description: How right-rail source statuses are derived honestly and where ElevenLabs availability comes from
---

# Intelligence Health Bar (right-rail Source Context)

`deriveSourceHealth(inputs)` in `signalscope/src/lib/intelligence.ts` is the
**single source of truth** for per-source status. It maps live workspace context
(report lifecycle, Songstats/JamBase `*UiStatus`, ElevenLabs probe + `audioStatus`)
onto `Connected | Generating | Unavailable | Coming Soon`. `IntelligenceSourcesPanel`
just renders it. Do not add a second status registry.

**Rule:** never emit "Connected" without a concrete runtime signal.
- Songstats/JamBase: `ok` → connected, `loading` → generating, everything else
  (`empty`/`error`/`unavailable`) → unavailable (no live data for this track).
- Gemini: `reportSource === "fallback"` (or error) → unavailable, because the
  honest ontology fallback ran instead of real synthesis.
- Musixmatch: always connected (core source; if the workspace loaded, it answered).
- Cyanite: the ONLY genuine `coming-soon` partner (matches the Sonic page).

## ElevenLabs availability
ElevenLabs is on-demand, so idle has no audio signal. Availability comes from a
cheap probe `GET /api/audio-briefing/status` → `{ configured }`
(`isElevenLabsConfigured()` = both `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`).
TrackWorkspace fetches it once into context as `audioAvailable: boolean|null`.
**Why a probe, not a TTS call:** gives an honest idle status without paid generation.
On probe failure we set `false` → "Unavailable" on purpose: the conservative
direction never over-claims live (honesty constraint). `null` (pending) shows
"Generating" briefly until it resolves.
