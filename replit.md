# SignalScope

Music intelligence for artists & labels: search any song (Musixmatch), view lyrics/RichSync timelines, and generate AI audience-intelligence reports (Gemini).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/signalscope/` — Vite + React frontend (wouter routing). Routes: `/` (Home), `/track/:id` → redirects to `/track/:id/overview`, `/track/:id/:view` (TrackWorkspace shell). Theme tokens in `src/index.css`.
- `artifacts/api-server/` — Express 5 backend. SignalScope routes in `src/routes/signalscope.ts` (mounted under `/api`). Services in `src/services/` (musixmatch, intelligence, gemini); RichSync parsing in `src/lib/richsync/`.
- `artifacts/mockup-sandbox/` — design/preview artifact (scaffold).

## Architecture decisions

- Ported from a Next.js (Vercel/v0) export: `next/link` → wouter `Link`, `next/image` → `<img>`, server components → client-side `fetch` in `useEffect`.
- Track view is a route-based "Intelligence Workspace": persistent left nav (`WorkspaceSidebar`), routed center pages (`pages/workspace/*`), right Source Context rail. The shell `pages/TrackWorkspace.tsx` stays mounted across view changes, loads source data + generates the Gemini report ONCE per `commontrack_id`, and shares everything via `context/TrackWorkspaceContext`. Reusable building blocks (cards, charts, helpers) live in `components/workspace/`; shared helpers/constants in `lib/intelligence.ts`. Strategy pages (Performance/Live/Sonic) are honest coming-soon placeholders — no fabricated metrics.
- Frontend calls the backend via relative `/api/...`; the shared proxy routes `/api/*` to the api-server (signalscope is served at base path `/`).
- Original dark theme preserved with direct hex CSS vars + Tailwind v4 `@theme inline` (not the shadcn HSL token system). Font is Geist (loaded via Google Fonts in `index.html`).

## Product

SignalScope turns songs into audience intelligence. Users search the Musixmatch catalog, open a track to see metadata, lyrics, and a synced RichSync timeline, then generate an AI report (Gemini) covering audience archetypes, emotional/cultural positioning, viral drivers, content opportunities, and platform fit.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `POST /api/intelligence` (Gemini) must request `responseMimeType: "application/json"` and normalize `platformFit[].score` to the `High|Medium|Low` enum before Zod validation, or it returns 500. The `TrackWorkspace` shell auto-generates this report on load (~15-25s); report-dependent pages show a "Synthesizing Intelligence" loader and a graceful "Analysis Failed" + Retry state on error (`components/workspace/ReportGate`). See `.agents/memory/gemini-intelligence-json.md`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
