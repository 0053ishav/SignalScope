const base = import.meta.env.BASE_URL;

/**
 * SignalScope branding assets. Files live in `public/branding/` and are served
 * under the artifact's base path (BASE_URL already includes a trailing slash).
 */
export const BRAND = {
  /** Icon-only mark (transparent) — sidebar / compact header lockup. */
  logoIcon: `${base}branding/logo-icon.png`,
  /** Full horizontal logo with wordmark — hero / loading / empty states. */
  logoFull: `${base}branding/logo-full.png`,
  /** Square app icon — PWA / social share. */
  appIcon: `${base}branding/app-icon.png`,
} as const;
