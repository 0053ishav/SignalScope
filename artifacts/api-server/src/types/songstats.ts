/**
 * Songstats Enterprise API types.
 *
 * Two layers:
 *  1. RAW types — a tolerant model of the real nested API response
 *     (`{ result, message, track_info, stats: [{ source, data }] }`). Field
 *     presence varies per source and per API-key tier, so everything is
 *     optional and `data` is an open record of real numeric fields.
 *  2. NORMALIZED types — `SongstatsTrackData` / `SongstatsSignals`, the single
 *     strongly-typed shape the rest of the app consumes. ONLY real returned
 *     fields are ever populated; nothing is fabricated or estimated.
 *
 * This file is mirrored on the frontend at
 * `artifacts/signalscope/src/types/songstats.ts` — keep the NORMALIZED shapes
 * identical so the API contract and UI never diverge.
 *
 * Docs: https://docs.songstats.com (base https://api.songstats.com/enterprise/v1)
 */

/* ----------------------------- RAW API SHAPES ----------------------------- */

export interface SongstatsRawArtist {
  songstats_artist_id?: string;
  name?: string;
  avatar?: string;
}

/** A real catalog contributor as returned under `track_info.collaborators`. */
export interface SongstatsRawCollaborator {
  name?: string;
  roles?: string[];
  songstats_collaborator_id?: string;
}

/** A real external platform link as returned under `track_info.links`. */
export interface SongstatsRawLink {
  source?: string;
  external_id?: string;
  url?: string;
  isrc?: string;
}

export interface SongstatsRawTrackInfo {
  songstats_track_id?: string;
  isrc?: string;
  title?: string;
  release_date?: string;
  avatar?: string;
  site_url?: string;
  artists?: SongstatsRawArtist[];
  genres?: string[];
  /** Distributor objects, e.g. `[{ name: "InGrooves" }]`. */
  distributors?: Array<{ name?: string }>;
  /** Label objects (often empty); tolerate string or `{ name }`. */
  labels?: Array<{ name?: string } | string>;
  collaborators?: SongstatsRawCollaborator[];
  links?: SongstatsRawLink[];
  is_remix?: boolean;
}

/** A single per-source stats entry. `data` is an open bag of real numbers. */
export interface SongstatsRawStatEntry {
  source?: string;
  data?: Record<string, unknown>;
}

export interface SongstatsRawTrackResponse {
  result?: string;
  message?: string;
  track_info?: SongstatsRawTrackInfo;
  stats?: SongstatsRawStatEntry[];
}

/* ----------------------------- NORMALIZED SHAPES -------------------------- */

/** One real, labeled metric extracted from a source's `data` object. */
export interface SongstatsMetric {
  /** Original API field key, e.g. `streams_total`. */
  key: string;
  /** Humanized label, e.g. "Streams". */
  label: string;
  /** Real numeric value as returned. */
  value: number;
}

/** Per-platform breakdown of the real metrics that platform returned. */
export interface SongstatsPlatform {
  /** Raw source id, e.g. `spotify`, `tiktok`. */
  source: string;
  /** Display name, e.g. "Spotify". */
  label: string;
  metrics: SongstatsMetric[];
}

export interface SongstatsTopMarket {
  /** ISO country code or country name as returned. */
  country: string;
  /** Real value associated with the market (e.g. streams). */
  value: number;
}

/** A real creative-credit contributor, deduped and normalized. */
export interface SongstatsCollaborator {
  /** Contributor name as returned. */
  name: string;
  /** Real roles as returned, e.g. ["Producer", "Songwriter"]. */
  roles: string[];
  /** Songstats collaborator id, when present. */
  id?: string;
}

/** A real external platform link, deduped to one canonical entry per source. */
export interface SongstatsLink {
  /** Raw source id, e.g. `spotify`, `apple_music`. */
  source: string;
  /** Display name, e.g. "Spotify". */
  label: string;
  /** Canonical URL for this track on that platform. */
  url: string;
}

/** One real point in a historic time series — date + value as returned. */
export interface SongstatsHistoryPoint {
  /** ISO date (or date-like string) as returned by Songstats. */
  date: string;
  /** Real metric value at that date. */
  value: number;
}

/**
 * A real historic time series for a single metric — present ONLY when
 * Songstats returns a usable `history` array. Points are never fabricated or
 * interpolated; gaps are left as-is.
 */
export interface SongstatsTrend {
  /** Source the series was measured on, e.g. `spotify`. */
  source: string;
  /** Humanized metric label, e.g. "Streams". */
  metric: string;
  /** Original API metric key, e.g. `streams_total`. */
  metricKey: string;
  /** Chronologically ordered real data points. */
  points: SongstatsHistoryPoint[];
}

/**
 * Optional growth reading — present ONLY when Songstats returns a usable
 * historic series or explicit growth field. Never synthesized.
 */
export interface SongstatsGrowth {
  /** Source the growth was measured on, e.g. `spotify`. */
  source: string;
  /** Metric the growth was measured on, e.g. "Streams". */
  metric: string;
  /** Percentage change over the measured window. */
  percent: number;
  /** Human window label, e.g. "30 days". */
  window: string;
}

/**
 * The single normalized shape consumed across the app. Every field is optional
 * (other than `isrc`) and is populated only when Songstats actually returns it.
 */
export interface SongstatsTrackData {
  isrc: string;
  songstatsTrackId?: string;
  title?: string;
  artist?: string;
  releaseDate?: string;
  avatarUrl?: string;
  siteUrl?: string;

  /* Catalog metadata — populated only when Songstats returns these fields. */
  genres?: string[];
  distributors?: string[];
  labels?: string[];
  collaborators?: SongstatsCollaborator[];
  links?: SongstatsLink[];
  isRemix?: boolean;

  /* Headline KPIs — only set when the corresponding real field is returned. */
  spotifyStreams?: number;
  spotifyPopularity?: number;
  playlistReach?: number;
  playlistCount?: number;
  tiktokVideos?: number;
  tiktokViews?: number;
  instagramPosts?: number;
  youtubeViews?: number;
  shazamCount?: number;

  /** Per-platform real metric breakdown. */
  platforms: SongstatsPlatform[];

  /** Geographic top markets — empty unless Songstats returns location data. */
  topMarkets: SongstatsTopMarket[];

  /** Growth reading — undefined unless derivable from real returned data. */
  growth?: SongstatsGrowth;

  /** Historic time series — undefined unless Songstats returns real history. */
  trend?: SongstatsTrend;

  /** When this snapshot was fetched (ISO). */
  lastUpdated: string;
}

/* ------------------------------- SIGNALS --------------------------------- */

export type SongstatsSignalCategory =
  | "momentum"
  | "discovery"
  | "creator"
  | "reach"
  | "consumption";

/**
 * A deterministic, interpretive signal derived from a REAL Songstats metric.
 * The number in `metricValue` is always real; `label`/`detail` are honest
 * interpretations of that number (clearly framed as interpretation, not data).
 */
export interface SongstatsSignal {
  id: string;
  category: SongstatsSignalCategory;
  label: string;
  detail: string;
  /** The real metric this signal is grounded in. */
  metricKey: string;
  metricValue: number;
}

export interface SongstatsSignals {
  signals: SongstatsSignal[];
}

/* ---------------------------- API RESPONSE ENVELOPE ----------------------- */

export type SongstatsStatus = "ok" | "empty" | "unavailable" | "error";

/** Discriminated envelope returned by GET /api/songstats/:isrc. */
export interface SongstatsResponse {
  status: SongstatsStatus;
  data?: SongstatsTrackData;
  signals?: SongstatsSignals;
  cached?: boolean;
  message?: string;
}
