---
name: SignalScope test harness
description: How frontend tests are set up for the signalscope artifact and the jsdom gotchas when writing more.
---

# SignalScope frontend tests (Vitest + Testing Library)

The signalscope artifact has a Vitest + jsdom + @testing-library setup. Run with
`pnpm --filter @workspace/signalscope run test`. Config: `vitest.config.ts`,
shared setup in `src/test/setup.ts`, fixtures in `src/test/fixtures.ts`.

## Gotchas when adding more tests

- **recharts needs a `ResizeObserver` polyfill.** Any page rendering charts
  (Overview/Audience/Distribution use ResponsiveContainer) throws
  `ResizeObserver is not defined` in jsdom. The setup file stubs it (and
  `matchMedia`). Don't remove those stubs.
- **Mount `AppRoutes` (exported from `App.tsx`) under a wouter `memoryLocation`
  hook**, not the full `App` — `App` wraps its own router with a BASE_URL base,
  which makes path assertions awkward. Use `memoryLocation({ path, record })`
  and read current path via a `useLocation` probe component.
- **Many labels are duplicated** between the sidebar nav, the right-rail Source
  Context panel / header, and the page body (e.g. a page title also appears as a
  nav link; album/track names appear in both panel and page). Query by level-1
  heading (`getByRole("heading", { name, level: 1 })`) or `getAllByText` to
  avoid "multiple elements" failures.
- **CollapsibleCard children are only in the DOM when open.** On Source Data,
  only the first card is `defaultOpen`, so collapsed-section content (lyrics,
  RichSync, etc.) is absent until expanded — assert on open content.
- Mock `fetch` by URL substring and return plain `{ ok, status, json }` objects;
  no real `Response` needed. For "report still loading" use a never-resolving
  promise for `/api/intelligence`; for "errored" return status 500.

**Why:** these cost several iterations to discover; future test work should not
re-learn them.
