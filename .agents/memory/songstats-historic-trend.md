---
name: Songstats historic_stats trend shape
description: What /tracks/historic_stats actually returns and how the trend/growth is derived from it
---

# Songstats historic_stats / market trend

`/tracks/historic_stats` (source=spotify) returns `{ stats:[{ source, data:{ history:[{ date, streams_total }] } }] }`.

- `streams_total` is **cumulative** (monotonically increasing), one point per day. A ~5-year-old track returns ~1800 points (e.g. Blinding Lights: 1828 points, 2021-06-20 → today).
- The Market Trend chart on the Performance page therefore shows a cumulative-streams curve, **not** daily deltas. If a future task wants per-day growth, compute deltas from consecutive `points[].value`.
- Both the historic time series (`SongstatsTrackData.trend`) and the single momentum % (`growth`) are derived from the same series — `growth` is just first-vs-last over the points. Keep them consistent.

**Why:** the snapshot KPIs come from `/tracks/stats`; only `/tracks/historic_stats` carries the over-time series. Nothing is interpolated — if the `history` array is absent or <2 points, `trend`/`growth` are left undefined and the UI shows an honest empty state.
