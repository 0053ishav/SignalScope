---
name: SignalScope branding assets
description: How the provided brand assets must be used given their backgrounds/colors.
---

# SignalScope branding assets

Assets live in `artifacts/signalscope/public/branding/` (favicon.ico, logo-icon.png, logo-full.png, app-icon.png), referenced via `import.meta.env.BASE_URL` in TSX and `%BASE_URL%branding/...` in `index.html` (Vite substitutes it; do NOT hardcode `/branding/...` so non-root base paths keep working).

- **logo-icon.png** — transparent, colorful icon mark. Safe directly on the dark theme (used in the sticky `Header`).
- **logo-full.png** — has an **opaque near-white background** + **dark navy wordmark**. It is NOT transparent, so it is illegible if dropped straight onto the dark theme.

**Rule:** Always render the full logo via the shared `src/components/BrandLogo.tsx` `BrandFullLogo` (white rounded "plate") so the dark wordmark stays legible on the dark UI. Used in landing hero + TrackWorkspace loading/empty states.

**Why:** The asset itself can't be made dark-mode-native without creating a new/inverted logo, which the brand task forbids. The plate is the agreed compromise.
