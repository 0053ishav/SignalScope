import type {
  JamBaseRawArtist,
  JamBaseRawArtistResponse,
  JamBaseRawEvent,
  JamBaseRawEventResponse,
  JamBaseRawRegion,
  JamBaseRawCountry,
  JamBaseEvent,
  JamBaseMarket,
  JamBaseLargestVenue,
  JamBaseLiveData,
} from "@/types/jambase";

/**
 * JamBase v3 API client + normalizer.
 *
 * Auth: `Authorization: Bearer <key>` header. Base: JAMBASE_BASE_URL (defaults
 * to the documented v3 origin). Resolution: artist name -> artist identifier ->
 * upcoming events. Every network/shape failure is swallowed into a null /
 * partial result so callers can degrade gracefully — JamBase must NEVER throw
 * up the stack and break the workspace.
 *
 * HARD RULE: only real returned fields are normalized. Top cities/countries,
 * venue/city/country counts, and the largest venue are all derived strictly
 * from the events JamBase actually returns. Nothing is fabricated or estimated.
 */

const DEFAULT_BASE_URL = "https://api.data.jambase.com/v3";

// Cap the number of event pages we fetch per artist (40 events/page) so a very
// heavy touring schedule can't blow the rate limit. Aggregates are computed
// over the fetched events; the headline count uses the artist's authoritative
// upcoming-events figure when available.
const MAX_EVENT_PAGES = 4;

function baseUrl(): string {
  return (process.env.JAMBASE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function apiKey(): string | undefined {
  return process.env.JAMBASE_API_KEY || undefined;
}

export function isJamBaseConfigured(): boolean {
  return Boolean(apiKey());
}

/** Low-level GET. Returns parsed JSON or null on any failure. */
async function jambaseGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;

  const qs = new URLSearchParams(params).toString();
  const url = `${baseUrl()}${path}${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`JamBase ${path} responded ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`JamBase ${path} request failed`, error instanceof Error ? error.message : error);
    return null;
  }
}

/* ------------------------------- helpers --------------------------------- */

function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Pull a human region name out of the tolerant `addressRegion` field. */
function regionName(region: JamBaseRawRegion | undefined): string | undefined {
  if (!region) return undefined;
  if (typeof region === "string") return str(region) || undefined;
  if (typeof region === "object") {
    const r = region as { name?: string; alternateName?: string };
    return str(r.name) || str(r.alternateName) || undefined;
  }
  return undefined;
}

function countryName(country: JamBaseRawCountry | undefined): string | undefined {
  return str(country?.name) || str(country?.alternateName) || undefined;
}

/* ------------------------------ resolution ------------------------------- */

interface ResolvedArtist {
  id: string;
  name: string;
  url?: string;
  upcoming?: number;
}

/**
 * Resolve an artist name to a JamBase identifier. Prefer an exact
 * (case-insensitive) name match; otherwise take the candidate with the most
 * upcoming events; otherwise the first result.
 */
async function resolveArtist(name: string): Promise<ResolvedArtist | null> {
  const response = await jambaseGet<JamBaseRawArtistResponse>("/artists", { artistName: name });
  const artists = Array.isArray(response?.artists) ? response.artists : [];
  if (!artists.length) return null;

  const lower = name.trim().toLowerCase();
  const withId = artists.filter((a): a is JamBaseRawArtist & { identifier: string } =>
    Boolean(a?.identifier),
  );
  if (!withId.length) return null;

  const exact = withId.find((a) => str(a.name).toLowerCase() === lower);
  const pick =
    exact ??
    [...withId].sort(
      (a, b) => (num(b["x-numUpcomingEvents"]) ?? 0) - (num(a["x-numUpcomingEvents"]) ?? 0),
    )[0];

  return {
    id: pick.identifier,
    name: str(pick.name) || name.trim(),
    url: str(pick.url) || undefined,
    upcoming: num(pick["x-numUpcomingEvents"]),
  };
}

/** Fetch upcoming events for an artist id, paging up to MAX_EVENT_PAGES. */
async function fetchEvents(artistId: string): Promise<JamBaseRawEvent[]> {
  const out: JamBaseRawEvent[] = [];
  for (let page = 1; page <= MAX_EVENT_PAGES; page++) {
    const response = await jambaseGet<JamBaseRawEventResponse>("/events", {
      artistId,
      page: String(page),
    });
    const events = Array.isArray(response?.events) ? response.events : [];
    out.push(...events);
    if (!response?.pagination?.nextPage || events.length === 0) break;
  }
  return out;
}

/* ------------------------------ normalize -------------------------------- */

function normalizeEvent(raw: JamBaseRawEvent): JamBaseEvent | null {
  const id = str(raw.identifier);
  const date = str(raw.startDate) || str(raw.endDate);
  if (!id || !date) return null;

  const loc = raw.location;
  const addr = loc?.address;

  return {
    id,
    name: str(raw.name) || undefined,
    date,
    status: str(raw.eventStatus) || undefined,
    url: str(raw.url) || undefined,
    venueName: str(loc?.name) || undefined,
    venueCapacity: num(loc?.maximumAttendeeCapacity),
    city: str(addr?.addressLocality) || undefined,
    region: regionName(addr?.addressRegion),
    country: countryName(addr?.addressCountry),
    countryCode: str(addr?.addressCountry?.identifier) || undefined,
    latitude: num(loc?.geo?.latitude),
    longitude: num(loc?.geo?.longitude),
  };
}

/** Rank markets by event count, largest first, capped to `limit`. */
function rankMarkets(counts: Map<string, number>, limit: number): JamBaseMarket[] {
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Fetch + normalize JamBase live/touring data for an artist.
 * Returns null when unconfigured (no key) or when there is no real upcoming
 * event data at all.
 */
export async function getJamBaseLiveData(artistName: string): Promise<JamBaseLiveData | null> {
  if (!isJamBaseConfigured()) return null;

  const name = artistName?.trim();
  if (!name) return null;

  const artist = await resolveArtist(name);
  if (!artist) return null;

  const rawEvents = await fetchEvents(artist.id);
  const events = rawEvents
    .map(normalizeEvent)
    .filter((e): e is JamBaseEvent => e !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate strictly over the real events returned.
  const cityCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const venues = new Set<string>();
  const cities = new Set<string>();
  const countries = new Set<string>();
  let largestVenue: JamBaseLargestVenue | undefined;

  for (const e of events) {
    if (e.venueName) {
      venues.add(e.venueName.toLowerCase());
      if (e.venueCapacity !== undefined && (!largestVenue || e.venueCapacity > largestVenue.capacity)) {
        largestVenue = {
          name: e.venueName,
          capacity: e.venueCapacity,
          city: e.city,
          country: e.country,
        };
      }
    }
    if (e.city) {
      const label = e.region && e.region !== e.city ? `${e.city}, ${e.region}` : e.country ? `${e.city}, ${e.country}` : e.city;
      cityCounts.set(label, (cityCounts.get(label) ?? 0) + 1);
      cities.add(e.city.toLowerCase());
    }
    if (e.country) {
      countryCounts.set(e.country, (countryCounts.get(e.country) ?? 0) + 1);
      countries.add(e.country.toLowerCase());
    }
  }

  const data: JamBaseLiveData = {
    artistName: artist.name,
    artistUrl: artist.url,
    upcomingEventCount: artist.upcoming && artist.upcoming > 0 ? artist.upcoming : events.length,
    venueCount: venues.size,
    cityCount: cities.size,
    countryCount: countries.size,
    upcomingEvents: events,
    topCities: rankMarkets(cityCounts, 8),
    topCountries: rankMarkets(countryCounts, 8),
    largestVenue,
    lastUpdated: new Date().toISOString(),
  };

  // Usable only if there is at least one real event or a positive upcoming count.
  const hasAnything = events.length > 0 || (artist.upcoming ?? 0) > 0;
  return hasAnything ? data : null;
}
