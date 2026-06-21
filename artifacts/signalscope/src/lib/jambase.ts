import type { JamBaseLiveData, JamBaseEvent } from "@/types/jambase";

/* -------------------------------------------------------------------------- */
/* JamBase presentation helpers — pure formatting / interpretation over REAL  */
/* returned live data. No value is fabricated; helpers only run on data       */
/* JamBase actually returned.                                                 */
/* -------------------------------------------------------------------------- */

export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US").format(n);
}

/** Long human date, e.g. "Jun 22, 2026". Falls back to the raw string. */
export function formatEventDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Short weekday + time, e.g. "Mon · 7:20 PM". Empty when no usable time. */
export function formatEventTime(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  // Only show a time when the source carried one (not a bare date).
  const hasTime = /\d{2}:\d{2}/.test(raw);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  if (!hasTime) return weekday;
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${weekday} · ${time}`;
}

/** Human "City, Country" (or the parts that exist) for an event. */
export function eventLocation(e: JamBaseEvent): string {
  const parts = [e.city, e.region && e.region !== e.city ? e.region : undefined, e.country].filter(
    Boolean,
  );
  // De-dup a trailing country that equals the region.
  return parts.filter((p, i) => parts.indexOf(p) === i).join(", ");
}

/** Count of distinct countries on the upcoming run (real). */
export function liveReach(data: JamBaseLiveData | null): number {
  return data?.countryCount ?? 0;
}

export interface LiveBadge {
  label: string;
  value: string;
}

/**
 * Compact header badges — only those backed by a real positive value.
 * Returns an empty array when there's nothing real to show.
 */
export function liveBadges(data: JamBaseLiveData | null): LiveBadge[] {
  if (!data) return [];
  const badges: LiveBadge[] = [];
  if (data.upcomingEventCount > 0) {
    badges.push({
      label: data.upcomingEventCount === 1 ? "show" : "shows",
      value: formatCompactNumber(data.upcomingEventCount),
    });
  }
  if (data.countryCount > 0) {
    badges.push({
      label: data.countryCount === 1 ? "country" : "countries",
      value: String(data.countryCount),
    });
  }
  if (data.cityCount > 0) {
    badges.push({
      label: data.cityCount === 1 ? "city" : "cities",
      value: String(data.cityCount),
    });
  }
  return badges;
}

/**
 * One-line "Live Presence" summary for the Executive Briefing. Returns null
 * when there is nothing real to summarize, so the caller can omit the line.
 */
export function livePresenceSummary(data: JamBaseLiveData | null): string | null {
  if (!data || data.upcomingEventCount <= 0) return null;

  const shows = `${data.upcomingEventCount} upcoming ${data.upcomingEventCount === 1 ? "show" : "shows"}`;
  const geo =
    data.countryCount > 1
      ? ` across ${data.countryCount} countries and ${data.cityCount} cities`
      : data.cityCount > 1
        ? ` across ${data.cityCount} cities`
        : "";
  const venue =
    data.largestVenue && data.largestVenue.capacity > 0
      ? `, anchored by a ${formatCompactNumber(data.largestVenue.capacity)}-cap date at ${data.largestVenue.name}`
      : "";

  return `${shows}${geo}${venue}.`;
}

/**
 * Touring-driven growth recommendations, composed deterministically from real
 * JamBase data. Each item is gated on a real metric; returns [] when there's
 * nothing real to recommend.
 */
export function touringRecommendations(data: JamBaseLiveData | null): string[] {
  if (!data || data.upcomingEventCount <= 0) return [];
  const recs: string[] = [];

  const topCity = data.topCities[0];
  if (topCity && topCity.count >= 2) {
    recs.push(
      `Concentrate release & content pushes around ${topCity.name} — ${topCity.count} upcoming shows make it a stronghold market.`,
    );
  }

  const topCountry = data.topCountries[0];
  if (topCountry && topCountry.count >= 2) {
    recs.push(
      `Localize promotion for ${topCountry.name} (${topCountry.count} dates) to align digital campaigns with the live routing.`,
    );
  }

  if (data.countryCount > 1) {
    recs.push(
      `Time territory-specific marketing to the tour's ${data.countryCount}-country footprint to convert live demand into streams.`,
    );
  }

  if (data.largestVenue && data.largestVenue.capacity >= 15_000) {
    recs.push(
      `Capture content at the ${formatCompactNumber(data.largestVenue.capacity)}-cap ${data.largestVenue.name} show for high-impact social proof.`,
    );
  }

  return recs;
}
