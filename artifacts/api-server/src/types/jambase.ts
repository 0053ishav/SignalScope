/**
 * JamBase API (v3) types.
 *
 * Two layers:
 *  1. RAW types — a tolerant model of the real v3 response shapes
 *     (`/artists` and `/events`). Field presence varies (e.g. `addressRegion`
 *     can be an empty object for non-US venues), so everything is optional.
 *  2. NORMALIZED types — `JamBaseLiveData` / `JamBaseSignals`, the single
 *     strongly-typed shape the rest of the app consumes. ONLY real returned
 *     fields are ever populated; nothing is fabricated or estimated.
 *
 * This file is mirrored on the frontend at
 * `artifacts/signalscope/src/types/jambase.ts` — keep the NORMALIZED shapes
 * identical so the API contract and UI never diverge.
 *
 * Base: https://api.data.jambase.com/v3 (Bearer auth).
 */

/* ----------------------------- RAW API SHAPES ----------------------------- */

export interface JamBaseRawPagination {
  page?: number;
  perPage?: number;
  totalItems?: number;
  totalPages?: number;
  nextPage?: string | null;
  previousPage?: string | null;
}

export interface JamBaseRawArtist {
  "@type"?: string;
  name?: string;
  identifier?: string;
  url?: string;
  image?: string;
  genre?: string[];
  "x-numUpcomingEvents"?: number;
}

export interface JamBaseRawArtistResponse {
  success?: boolean;
  pagination?: JamBaseRawPagination;
  artists?: JamBaseRawArtist[];
}

export interface JamBaseRawCountry {
  "@type"?: string;
  identifier?: string;
  name?: string;
  alternateName?: string;
}

/** `addressRegion` is sometimes `{}`, a string, or `{ name }` — tolerate all. */
export type JamBaseRawRegion = string | { name?: string; alternateName?: string } | Record<string, never>;

export interface JamBaseRawAddress {
  "@type"?: string;
  addressLocality?: string;
  postalCode?: string;
  addressRegion?: JamBaseRawRegion;
  addressCountry?: JamBaseRawCountry;
}

export interface JamBaseRawGeo {
  "@type"?: string;
  latitude?: number;
  longitude?: number;
}

export interface JamBaseRawVenue {
  "@type"?: string;
  name?: string;
  identifier?: string;
  url?: string;
  address?: JamBaseRawAddress;
  geo?: JamBaseRawGeo;
  maximumAttendeeCapacity?: number;
  "x-isPermanentlyClosed"?: boolean;
  "x-numUpcomingEvents"?: number;
}

export interface JamBaseRawEvent {
  "@type"?: string;
  name?: string;
  identifier?: string;
  url?: string;
  image?: string;
  eventStatus?: string;
  startDate?: string;
  endDate?: string;
  location?: JamBaseRawVenue;
}

export interface JamBaseRawEventResponse {
  success?: boolean;
  pagination?: JamBaseRawPagination;
  events?: JamBaseRawEvent[];
}

/* ----------------------------- NORMALIZED SHAPES -------------------------- */

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
  /** Resolved artist name as returned by JamBase. */
  artistName: string;
  /** Canonical JamBase artist page, when returned. */
  artistUrl?: string;
  /** Authoritative upcoming-event count (from the artist record when present). */
  upcomingEventCount: number;
  /** Distinct venues across the fetched upcoming events. */
  venueCount: number;
  /** Distinct cities across the fetched upcoming events. */
  cityCount: number;
  /** Distinct countries across the fetched upcoming events. */
  countryCount: number;
  /** Real upcoming events, chronologically ordered. */
  upcomingEvents: JamBaseEvent[];
  /** Cities ranked by number of upcoming events (real counts). */
  topCities: JamBaseMarket[];
  /** Countries ranked by number of upcoming events (real counts). */
  topCountries: JamBaseMarket[];
  /** Largest venue by stated capacity — undefined unless a capacity is returned. */
  largestVenue?: JamBaseLargestVenue;
  /** When this snapshot was fetched (ISO). */
  lastUpdated: string;
}

/* ------------------------------- SIGNALS --------------------------------- */

export type JamBaseSignalCategory =
  | "touring"
  | "geographic"
  | "demand"
  | "concentration";

/**
 * A deterministic, interpretive signal derived from a REAL JamBase metric.
 * The number in `metricValue` is always real; `label`/`detail` are honest
 * interpretations of that number (framed as interpretation, not data).
 */
export interface JamBaseSignal {
  id: string;
  category: JamBaseSignalCategory;
  label: string;
  detail: string;
  /** The real metric this signal is grounded in. */
  metricKey: string;
  metricValue: number;
}

export interface JamBaseSignals {
  signals: JamBaseSignal[];
}

/* ---------------------------- API RESPONSE ENVELOPE ----------------------- */

export type JamBaseStatus = "ok" | "empty" | "unavailable" | "error";

/** Discriminated envelope returned by GET /api/jambase/:artist. */
export interface JamBaseResponse {
  status: JamBaseStatus;
  data?: JamBaseLiveData;
  signals?: JamBaseSignals;
  cached?: boolean;
  message?: string;
}
