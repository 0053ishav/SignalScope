/**
 * JamBase live/touring intelligence types — FRONTEND MIRROR.
 *
 * These NORMALIZED shapes are kept identical to the backend at
 * `artifacts/api-server/src/types/jambase.ts`. The frontend only ever consumes
 * the normalized layer (the raw v3 shapes stay server-side). Every field is
 * populated only when JamBase actually returns it — nothing is fabricated.
 */

/** One real upcoming event — every field is populated only when JamBase returns it. */
export interface JamBaseEvent {
  /** JamBase event identifier, e.g. `jambase:14957547`. */
  id: string;
  /** Event name as returned, e.g. "Iron Maiden at París La Défense Arena". */
  name?: string;
  /** Start date as returned (ISO-like, e.g. `2026-06-22T19:20:00`). */
  date: string;
  /** Real event status, e.g. "scheduled". */
  status?: string;
  /** Canonical JamBase show page. */
  url?: string;
  venueName?: string;
  /** Real venue capacity, when returned. */
  venueCapacity?: number;
  city?: string;
  region?: string;
  country?: string;
  /** ISO2 country code as returned, e.g. "FR". */
  countryCode?: string;
  latitude?: number;
  longitude?: number;
}

/** A real market (city or country) ranked by number of upcoming events. */
export interface JamBaseMarket {
  /** Display label, e.g. "Paris, France" or "United States". */
  name: string;
  /** Number of upcoming events in this market (real count). */
  count: number;
}

/** The largest real venue on the upcoming run, by stated capacity. */
export interface JamBaseLargestVenue {
  name: string;
  capacity: number;
  city?: string;
  country?: string;
}

/**
 * The single normalized shape consumed across the app. Every field is derived
 * only from events JamBase actually returns; nothing is fabricated.
 */
export interface JamBaseLiveData {
  artistName: string;
  artistUrl?: string;
  upcomingEventCount: number;
  venueCount: number;
  cityCount: number;
  countryCount: number;
  upcomingEvents: JamBaseEvent[];
  topCities: JamBaseMarket[];
  topCountries: JamBaseMarket[];
  largestVenue?: JamBaseLargestVenue;
  lastUpdated: string;
}

export type JamBaseSignalCategory =
  | "touring"
  | "geographic"
  | "demand"
  | "concentration";

export interface JamBaseSignal {
  id: string;
  category: JamBaseSignalCategory;
  label: string;
  detail: string;
  metricKey: string;
  metricValue: number;
}

export interface JamBaseSignals {
  signals: JamBaseSignal[];
}

/** Raw envelope from GET /api/jambase/:artist. */
export type JamBaseResponseStatus = "ok" | "empty" | "unavailable" | "error";

export interface JamBaseResponse {
  status: JamBaseResponseStatus;
  data?: JamBaseLiveData;
  signals?: JamBaseSignals;
  cached?: boolean;
  message?: string;
}

/** Frontend-facing status, including the in-flight "loading" state. */
export type JamBaseUiStatus =
  | "loading"
  | "ok"
  | "empty"
  | "unavailable"
  | "error";
