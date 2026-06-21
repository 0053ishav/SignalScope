/**
 * Normalized Songstats shapes consumed by the frontend.
 *
 * These MUST stay identical to the NORMALIZED section of the backend mirror at
 * `artifacts/api-server/src/types/songstats.ts` — they are the API contract.
 * Only real returned fields are ever populated; nothing is fabricated.
 */

export interface SongstatsMetric {
  key: string;
  label: string;
  value: number;
}

export interface SongstatsPlatform {
  source: string;
  label: string;
  metrics: SongstatsMetric[];
}

export interface SongstatsTopMarket {
  country: string;
  value: number;
}

export interface SongstatsCollaborator {
  name: string;
  roles: string[];
  id?: string;
}

export interface SongstatsLink {
  source: string;
  label: string;
  url: string;
}

export interface SongstatsArtistReach {
  source: string;
  label: string;
  metricKey: string;
  metricLabel: string;
  value: number;
}

export interface SongstatsArtist {
  id: string;
  name: string;
  avatarUrl?: string;
  siteUrl?: string;
  country?: string;
  genres?: string[];
  links?: SongstatsLink[];
  reach?: SongstatsArtistReach[];
}

export interface SongstatsGrowth {
  source: string;
  metric: string;
  percent: number;
  window: string;
}

export interface SongstatsHistoryPoint {
  date: string;
  value: number;
}

export interface SongstatsTrend {
  source: string;
  metric: string;
  metricKey: string;
  points: SongstatsHistoryPoint[];
}

export interface SongstatsTrackData {
  isrc: string;
  songstatsTrackId?: string;
  title?: string;
  artist?: string;
  releaseDate?: string;
  avatarUrl?: string;
  siteUrl?: string;

  genres?: string[];
  distributors?: string[];
  labels?: string[];
  collaborators?: SongstatsCollaborator[];
  links?: SongstatsLink[];
  isRemix?: boolean;
  artists?: SongstatsArtist[];

  spotifyStreams?: number;
  spotifyPopularity?: number;
  playlistReach?: number;
  playlistCount?: number;
  tiktokVideos?: number;
  tiktokViews?: number;
  instagramPosts?: number;
  youtubeViews?: number;
  shazamCount?: number;

  platforms: SongstatsPlatform[];
  topMarkets: SongstatsTopMarket[];
  growth?: SongstatsGrowth;
  trend?: SongstatsTrend;
  lastUpdated: string;
}

export type SongstatsSignalCategory =
  | "momentum"
  | "discovery"
  | "creator"
  | "reach"
  | "consumption";

export interface SongstatsSignal {
  id: string;
  category: SongstatsSignalCategory;
  label: string;
  detail: string;
  metricKey: string;
  metricValue: number;
}

export interface SongstatsSignals {
  signals: SongstatsSignal[];
}

/** Raw envelope from GET /api/songstats/:isrc. */
export type SongstatsResponseStatus = "ok" | "empty" | "unavailable" | "error";

export interface SongstatsResponse {
  status: SongstatsResponseStatus;
  data?: SongstatsTrackData;
  signals?: SongstatsSignals;
  cached?: boolean;
  message?: string;
}

/** Frontend-facing status, including the in-flight "loading" state. */
export type SongstatsUiStatus =
  | "loading"
  | "ok"
  | "empty"
  | "unavailable"
  | "error";
