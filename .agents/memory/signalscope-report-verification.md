---
name: SignalScope report verification
description: Why static screenshots of the track page always show the loading state, and how to actually verify the report renders.
---

The track page (`/track/:id`) auto-generates its AI report on load via a **synchronous ~20s `POST /api/intelligence`** (Gemini). The fetch does not block the page `load` event, so any fresh `screenshot` (app_preview) capture fires during generation and always shows the "Synthesizing Intelligence" spinner — it never shows the rendered report.

**How to apply:** To visually verify the report body (KPI cards, charts, evidence, sections), use the `testing` skill (Playwright) with an explicit wait of ~30s for generation to finish, not the `screenshot` tool. The sidebar and right-hand Source Data panel render immediately and *can* be checked via screenshot.

**Why:** There is no caching/persistence — every page load regenerates. Improving this (cache reports in the already-provisioned Postgres) is the highest-value perf/reliability follow-up but was out of scope for the dashboard-polish task.
