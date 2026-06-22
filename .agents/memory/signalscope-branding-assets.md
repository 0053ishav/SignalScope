---
name: SignalScope branding assets
description: How the provided brand assets must be used given their backgrounds/colors.
---

# SignalScope branding assets

Assets live in `artifacts/signalscope/public/branding/` (favicon.ico, logo-icon.png, logo-full.png, app-icon.png), referenced via `import.meta.env.BASE_URL` in TSX and `%BASE_URL%branding/...` in `index.html` (Vite substitutes it; do NOT hardcode `/branding/...` so non-root base paths keep working).

- **logo-icon.png** — transparent, colorful icon mark. Safe directly on the dark theme (used in the sticky `Header`).
- **logo-full.png** — transparent background BUT a **near-black/dark-navy wordmark** (`srgba(8,14,40,1)`). Transparency alone does NOT make it dark-mode safe — the wordmark vanishes on the dark UI.

**Rule:** Always render the full logo via the shared `src/components/BrandLogo.tsx` `BrandFullLogo` (white rounded "plate") so the dark wordmark stays legible on the dark UI. Used in landing hero + TrackWorkspace loading/empty states.

**Why:** The asset's wordmark is dark and can't be made dark-mode-native without creating a new/inverted logo, which the brand task forbids. The plate is the agreed compromise. (Applies even to the "removebg" transparent version — same dark wordmark.)
