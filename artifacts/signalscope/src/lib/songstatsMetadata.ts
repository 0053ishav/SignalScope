import type {
  SongstatsTrackData,
  SongstatsCollaborator,
  SongstatsLink,
  SongstatsArtist,
} from "@/types/songstats";

/* -------------------------------------------------------------------------- */
/* Songstats metadata helpers — deterministic interpretation over REAL fields */
/* (genres, distributors, links, collaborators). Nothing is fabricated; every */
/* helper only operates on data Songstats actually returned.                  */
/* -------------------------------------------------------------------------- */

/* ------------------------------ artwork ---------------------------------- */

/**
 * Preferred artwork: Songstats avatar first, then a Musixmatch cover fallback.
 * Returns an ordered list of candidate URLs so the UI can fall through on a
 * broken image (onError) and never render a broken <img>.
 */
export function artworkCandidates(
  songstats: SongstatsTrackData | null,
  musixmatchCovers: Array<string | undefined>,
): string[] {
  const urls: string[] = [];
  const push = (u?: string) => {
    const t = typeof u === "string" ? u.trim() : "";
    if (t && !urls.includes(t)) urls.push(t);
  };
  push(songstats?.avatarUrl);
  for (const c of musixmatchCovers) push(c);
  return urls;
}

/* ------------------------- release intelligence -------------------------- */

export type ReleaseStage = "Fresh Release" | "Recent Release" | "Catalog Track";

export interface ReleaseIntelligence {
  /** ISO date as returned. */
  date: string;
  /** Long human format, e.g. "June 12, 2026". */
  formatted: string;
  /** Whole days between release date and today (>= 0). */
  daysSince: number;
  stage: ReleaseStage;
  /** Honest, deterministic descriptor of the stage. */
  detail: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Deterministic release-stage reading from the real release date.
 * Thresholds are fixed (not data-derived guesses): <=30d Fresh, <=180d Recent,
 * otherwise Catalog. Returns null when no usable date is present.
 */
export function getReleaseIntelligence(
  releaseDate: string | undefined,
  now: Date = new Date(),
): ReleaseIntelligence | null {
  if (!releaseDate) return null;
  const parsed = new Date(releaseDate);
  if (Number.isNaN(parsed.getTime())) return null;

  const daysSince = Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / DAY_MS));
  const formatted = parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let stage: ReleaseStage;
  let detail: string;
  if (daysSince <= 30) {
    stage = "Fresh Release";
    detail = `Released ${daysSince === 0 ? "today" : `${daysSince} day${daysSince === 1 ? "" : "s"} ago`} — inside the first-month discovery window.`;
  } else if (daysSince <= 180) {
    stage = "Recent Release";
    detail = `${daysSince} days since release — still in the active promotion window.`;
  } else {
    stage = "Catalog Track";
    detail = `${daysSince} days since release — an established catalog title.`;
  }

  return { date: releaseDate, formatted, daysSince, stage, detail };
}

/* ------------------------------ platforms -------------------------------- */

/**
 * Canonical ordering + display labels for the platforms Songstats links to.
 * Used only to sort/label REAL links — never to invent a link that wasn't
 * returned. Unknown sources fall through with a humanized label.
 */
const PLATFORM_ORDER: string[] = [
  "spotify",
  "apple_music",
  "youtube",
  "tiktok",
  "soundcloud",
  "deezer",
  "amazon",
  "tidal",
  "shazam",
  "beatport",
  "pandora",
  "radio",
  "sxm",
];

const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify",
  apple_music: "Apple Music",
  youtube: "YouTube",
  tiktok: "TikTok",
  soundcloud: "SoundCloud",
  deezer: "Deezer",
  amazon: "Amazon Music",
  tidal: "Tidal",
  shazam: "Shazam",
  beatport: "Beatport",
  pandora: "Pandora",
  radio: "Radio",
  sxm: "SiriusXM",
};

export function platformLabel(source: string): string {
  return (
    PLATFORM_LABELS[source] ??
    source
      .split(/[_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/** Sort an arbitrary link list into the canonical platform order. */
export function sortLinksByPlatform(links: SongstatsLink[]): SongstatsLink[] {
  const rank = (s: string) => {
    const i = PLATFORM_ORDER.indexOf(s);
    return i === -1 ? PLATFORM_ORDER.length : i;
  };
  return [...links].sort((a, b) => rank(a.source) - rank(b.source) || a.label.localeCompare(b.label));
}

/** Real links sorted into the canonical platform order (unknowns appended). */
export function orderedLinks(data: SongstatsTrackData | null): SongstatsLink[] {
  const links = data?.links ?? [];
  if (links.length === 0) return [];
  return sortLinksByPlatform(links);
}

/** Count of distinct platforms this track is verifiably present on. */
export function platformReach(data: SongstatsTrackData | null): number {
  return data?.links?.length ?? 0;
}

/** Quick-open subset (streaming + social) for an "Open Track" panel. */
const OPEN_SOURCES = ["spotify", "apple_music", "youtube", "tiktok", "soundcloud"];

export function openTrackLinks(data: SongstatsTrackData | null): SongstatsLink[] {
  const links = data?.links ?? [];
  return OPEN_SOURCES.map((s) => links.find((l) => l.source === s)).filter(
    (l): l is SongstatsLink => Boolean(l),
  );
}

/* ------------------------------- artists --------------------------------- */

/** Primary artists Songstats returned for this track (empty if none). */
export function primaryArtists(data: SongstatsTrackData | null): SongstatsArtist[] {
  return data?.artists ?? [];
}

/** An artist's external links sorted into the canonical platform order. */
export function artistLinks(artist: SongstatsArtist): SongstatsLink[] {
  return sortLinksByPlatform(artist.links ?? []);
}

/* ---------------------- distribution ecosystem --------------------------- */

export interface EcosystemSlot {
  source: string;
  label: string;
  /** A real link exists for this platform. */
  connected: boolean;
  url?: string;
}

/**
 * Map the canonical platform set to Connected (a real link exists) vs not
 * detected. Only platforms with a real returned link are marked connected.
 */
export function distributionEcosystem(data: SongstatsTrackData | null): EcosystemSlot[] {
  const links = data?.links ?? [];
  const bySource = new Map(links.map((l) => [l.source, l]));
  // Union of the canonical order and any extra sources actually returned.
  const sources = [...PLATFORM_ORDER];
  for (const l of links) if (!sources.includes(l.source)) sources.push(l.source);

  return sources.map((source) => {
    const link = bySource.get(source);
    return {
      source,
      label: platformLabel(source),
      connected: Boolean(link),
      url: link?.url,
    };
  });
}

/* --------------------------- creative credits ---------------------------- */

export interface CreditGroup {
  /** Display label, e.g. "Producers". */
  label: string;
  /** Contributors that hold a role in this group. */
  people: SongstatsCollaborator[];
}

/** Ordered role buckets. A contributor can appear in more than one group. */
const ROLE_GROUPS: Array<{ label: string; roles: string[] }> = [
  { label: "Performers", roles: ["performer", "vocalist", "featured artist"] },
  { label: "Songwriters", roles: ["songwriter", "composer", "lyricist", "writer"] },
  { label: "Producers", roles: ["producer"] },
  { label: "Arrangers", roles: ["arranger"] },
  { label: "Engineers", roles: ["engineer", "mixing engineer", "mastering engineer", "technician"] },
  { label: "Instrumentalists", roles: ["instrumentalist", "musician"] },
];

/** Group real collaborators by role bucket; unmatched roles → "Other Credits". */
export function groupCredits(data: SongstatsTrackData | null): CreditGroup[] {
  const people = data?.collaborators ?? [];
  if (people.length === 0) return [];

  const groups: CreditGroup[] = ROLE_GROUPS.map((g) => ({ label: g.label, people: [] }));
  const other: SongstatsCollaborator[] = [];

  for (const person of people) {
    const lowered = person.roles.map((r) => r.toLowerCase());
    let placed = false;
    ROLE_GROUPS.forEach((g, i) => {
      if (lowered.some((r) => g.roles.includes(r))) {
        groups[i].people.push(person);
        placed = true;
      }
    });
    if (!placed) other.push(person);
  }

  const result = groups.filter((g) => g.people.length > 0);
  if (other.length > 0) result.push({ label: "Other Credits", people: other });
  return result;
}

export interface CreditInsights {
  totalContributors: number;
  producers: number;
  songwriters: number;
  engineers: number;
  performers: number;
}

/** Headline counts over the real credits — unique people, plus per-role tallies. */
export function creditInsights(data: SongstatsTrackData | null): CreditInsights {
  const people = data?.collaborators ?? [];
  const has = (person: SongstatsCollaborator, roles: string[]) =>
    person.roles.some((r) => roles.includes(r.toLowerCase()));

  return {
    totalContributors: people.length,
    producers: people.filter((p) => has(p, ["producer"])).length,
    songwriters: people.filter((p) => has(p, ["songwriter", "composer", "lyricist", "writer"])).length,
    engineers: people.filter((p) => has(p, ["engineer", "mixing engineer", "mastering engineer", "technician"])).length,
    performers: people.filter((p) => has(p, ["performer", "vocalist", "featured artist"])).length,
  };
}
