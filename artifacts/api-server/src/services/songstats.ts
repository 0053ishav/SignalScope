import type {
  SongstatsRawTrackResponse,
  SongstatsRawStatEntry,
  SongstatsTrackData,
  SongstatsPlatform,
  SongstatsMetric,
  SongstatsTopMarket,
  SongstatsGrowth,
} from "@/types/songstats";

/**
 * Songstats Enterprise API client + normalizer.
 *
 * Auth: `apikey` header. Base: SONGSTATS_BASE_URL (defaults to the documented
 * enterprise base). Resolution priority: ISRC -> Songstats track id ->
 * artist+title search. Every network/shape failure is swallowed into a null /
 * partial result so callers can degrade gracefully — Songstats must NEVER throw
 * up the stack and break the workspace.
 *
 * HARD RULE: only real returned fields are normalized. Nothing is fabricated,
 * estimated, or defaulted to a fake number.
 */

const DEFAULT_BASE_URL = "https://api.songstats.com/enterprise/v1";

function baseUrl(): string {
  return (process.env.SONGSTATS_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function apiKey(): string | undefined {
  return process.env.SONGSTATS_API_KEY || undefined;
}

export function isSongstatsConfigured(): boolean {
  return Boolean(apiKey());
}

/** Low-level GET. Returns parsed JSON or null on any failure. */
async function songstatsGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;

  const qs = new URLSearchParams(params).toString();
  const url = `${baseUrl()}${path}?${qs}`;

  try {
    const res = await fetch(url, {
      headers: { apikey: key, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Songstats ${path} responded ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Songstats ${path} request failed`, error instanceof Error ? error.message : error);
    return null;
  }
}

/* ------------------------------- helpers --------------------------------- */

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Read the first candidate key that holds a real finite number. */
function readNumber(data: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const n = toNumber(data[k]);
    if (n !== undefined) return n;
  }
  return undefined;
}

const SOURCE_LABELS: Record<string, string> = {
  spotify: "Spotify",
  apple_music: "Apple Music",
  amazon: "Amazon Music",
  amazon_music: "Amazon Music",
  deezer: "Deezer",
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
  soundcloud: "SoundCloud",
  shazam: "Shazam",
  tidal: "Tidal",
  pandora: "Pandora",
  napster: "Napster",
};

function sourceLabel(source: string): string {
  return (
    SOURCE_LABELS[source] ??
    source
      .split(/[_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/** Humanize a raw metric key like `playlist_reach_total` -> "Playlist Reach". */
function metricLabel(key: string): string {
  return key
    .replace(/_(total|current)$/i, "")
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** A small denylist of non-metric numeric keys we don't want to surface raw. */
const SKIP_METRIC_KEYS = new Set(["id", "rank", "position"]);

/** Build the per-platform real metric list from a source's `data` bag. */
function extractPlatformMetrics(data: Record<string, unknown>): SongstatsMetric[] {
  const metrics: SongstatsMetric[] = [];
  for (const [key, raw] of Object.entries(data)) {
    if (SKIP_METRIC_KEYS.has(key)) continue;
    const value = toNumber(raw);
    if (value === undefined) continue;
    metrics.push({ key, label: metricLabel(key), value });
  }
  // Largest first — headline numbers (streams, views) lead.
  return metrics.sort((a, b) => b.value - a.value);
}

/** Defensively pull top markets from a /tracks/locations style payload. */
function extractTopMarkets(payload: unknown): SongstatsTopMarket[] {
  if (!payload || typeof payload !== "object") return [];
  // Tolerate several shapes: { locations: [...] } | { stats:[{data:{locations}}] } | [...]
  const candidates: unknown[] = [];
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.locations)) candidates.push(...obj.locations);
  if (Array.isArray(obj.markets)) candidates.push(...obj.markets);
  if (Array.isArray(payload)) candidates.push(...(payload as unknown[]));
  if (Array.isArray(obj.stats)) {
    for (const entry of obj.stats as SongstatsRawStatEntry[]) {
      const d = entry?.data as Record<string, unknown> | undefined;
      if (d && Array.isArray(d.locations)) candidates.push(...(d.locations as unknown[]));
    }
  }

  const markets: SongstatsTopMarket[] = [];
  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;
    const row = c as Record<string, unknown>;
    const country =
      (typeof row.country === "string" && row.country) ||
      (typeof row.country_code === "string" && row.country_code) ||
      (typeof row.name === "string" && row.name) ||
      (typeof row.code === "string" && row.code) ||
      "";
    const value = readNumber(row, ["value", "streams", "count", "total", "streams_total"]);
    if (country && value !== undefined) markets.push({ country, value });
  }
  return markets.sort((a, b) => b.value - a.value).slice(0, 8);
}

/** Index raw stats[] by source for direct headline lookups. */
function indexStats(stats: SongstatsRawStatEntry[]): Record<string, Record<string, unknown>> {
  const map: Record<string, Record<string, unknown>> = {};
  for (const entry of stats) {
    if (entry?.source && entry.data && typeof entry.data === "object") {
      map[entry.source] = entry.data as Record<string, unknown>;
    }
  }
  return map;
}

/** Normalize the raw info+stats responses into the single consumed shape. */
function normalize(
  isrc: string,
  info: SongstatsRawTrackResponse | null,
  stats: SongstatsRawTrackResponse | null,
  locations: unknown,
  growth: SongstatsGrowth | undefined,
): SongstatsTrackData | null {
  const trackInfo = info?.track_info ?? stats?.track_info;
  const rawStats = stats?.stats ?? [];
  const bySource = indexStats(rawStats);

  const platforms: SongstatsPlatform[] = rawStats
    .filter((e): e is SongstatsRawStatEntry & { source: string } => Boolean(e?.source && e.data))
    .map((e) => ({
      source: e.source,
      label: sourceLabel(e.source),
      metrics: extractPlatformMetrics(e.data as Record<string, unknown>),
    }))
    .filter((p) => p.metrics.length > 0);

  const spotify = bySource["spotify"] ?? {};
  const tiktok = bySource["tiktok"] ?? {};
  const youtube = bySource["youtube"] ?? {};
  const instagram = bySource["instagram"] ?? {};
  const shazam = bySource["shazam"] ?? {};

  const data: SongstatsTrackData = {
    isrc,
    songstatsTrackId: trackInfo?.songstats_track_id,
    title: trackInfo?.title,
    artist: trackInfo?.artists?.map((a) => a.name).filter(Boolean).join(", ") || undefined,
    releaseDate: trackInfo?.release_date,
    avatarUrl: trackInfo?.avatar,
    siteUrl: trackInfo?.site_url,

    spotifyStreams: readNumber(spotify, ["streams_total", "streams", "streams_current"]),
    spotifyPopularity: readNumber(spotify, ["popularity_current", "popularity"]),
    playlistReach: readNumber(spotify, ["playlist_reach_current", "playlist_reach_total", "playlist_reach"]),
    playlistCount: readNumber(spotify, ["playlist_count_current", "playlist_count_total", "playlist_count"]),
    tiktokVideos: readNumber(tiktok, ["videos_total", "posts_total", "videos", "posts"]),
    tiktokViews: readNumber(tiktok, ["views_total", "views"]),
    instagramPosts: readNumber(instagram, ["posts_total", "posts"]),
    youtubeViews: readNumber(youtube, ["video_views_total", "views_total", "views"]),
    shazamCount: readNumber(shazam, ["shazams_total", "shazams", "count_total"]),

    platforms,
    topMarkets: extractTopMarkets(locations),
    growth,
    lastUpdated: new Date().toISOString(),
  };

  // Consider it "empty" if we got no usable platforms and no headline KPI.
  const hasAnything =
    platforms.length > 0 ||
    [
      data.spotifyStreams,
      data.spotifyPopularity,
      data.playlistReach,
      data.tiktokVideos,
      data.youtubeViews,
      data.instagramPosts,
      data.shazamCount,
    ].some((v) => v !== undefined);

  return hasAnything ? data : null;
}

/* ---------------------------- growth (optional) -------------------------- */

/**
 * Attempt to derive a real growth percentage from /tracks/historic_stats for
 * Spotify streams. Any shape mismatch -> undefined (never fabricated).
 */
function deriveGrowth(historic: unknown): SongstatsGrowth | undefined {
  if (!historic || typeof historic !== "object") return undefined;

  // Tolerate: { stats:[{source, data:{history:[{date, streams_total}]}}] }
  const obj = historic as Record<string, unknown>;
  const stats = Array.isArray(obj.stats) ? (obj.stats as SongstatsRawStatEntry[]) : [];
  const spotify = stats.find((s) => s?.source === "spotify");
  const data = spotify?.data as Record<string, unknown> | undefined;
  const history = data && Array.isArray(data.history) ? (data.history as unknown[]) : [];
  if (history.length < 2) return undefined;

  const series = history
    .map((h) => (h && typeof h === "object" ? readNumber(h as Record<string, unknown>, ["streams_total", "streams", "value"]) : undefined))
    .filter((n): n is number => n !== undefined);
  if (series.length < 2) return undefined;

  const first = series[0];
  const last = series[series.length - 1];
  if (first <= 0) return undefined;

  const percent = ((last - first) / first) * 100;
  if (!Number.isFinite(percent)) return undefined;

  return {
    source: "spotify",
    metric: "Streams",
    percent: Math.round(percent * 10) / 10,
    window: `${series.length} data points`,
  };
}

/* ------------------------------ public API ------------------------------- */

export interface SongstatsLookup {
  isrc?: string;
  artist?: string;
  title?: string;
}

/** Resolve a Songstats track id from an artist+title search (last resort). */
async function resolveTrackIdBySearch(artist: string, title: string): Promise<string | undefined> {
  const search = await songstatsGet<Record<string, unknown>>("/tracks/search", {
    q: `${title} ${artist}`.trim(),
  });
  if (!search) return undefined;

  // Tolerate { results:[{songstats_track_id}] } | { tracks:[...] } | [...]
  const buckets: unknown[] = [];
  if (Array.isArray((search as Record<string, unknown>).results)) buckets.push(...((search as Record<string, unknown>).results as unknown[]));
  if (Array.isArray((search as Record<string, unknown>).tracks)) buckets.push(...((search as Record<string, unknown>).tracks as unknown[]));
  if (Array.isArray(search)) buckets.push(...(search as unknown[]));

  for (const b of buckets) {
    if (b && typeof b === "object") {
      const id = (b as Record<string, unknown>).songstats_track_id;
      if (typeof id === "string" && id) return id;
    }
  }
  return undefined;
}

/**
 * Fetch + normalize Songstats data for a track.
 * Returns null when unconfigured (no key) or when no real data is available.
 */
export async function getSongstatsTrackData(lookup: SongstatsLookup): Promise<SongstatsTrackData | null> {
  if (!isSongstatsConfigured()) return null;

  const isrc = lookup.isrc?.trim();

  // Build the identifying query param (ISRC first, then resolved track id).
  let idParams: Record<string, string> | null = null;
  if (isrc) {
    idParams = { isrc };
  } else if (lookup.artist && lookup.title) {
    const trackId = await resolveTrackIdBySearch(lookup.artist, lookup.title);
    if (trackId) idParams = { songstats_track_id: trackId };
  }
  if (!idParams) return null;

  // Core, reliable calls: info + all-source stats. Optional: locations, historic.
  const [info, stats] = await Promise.all([
    songstatsGet<SongstatsRawTrackResponse>("/tracks/info", idParams),
    songstatsGet<SongstatsRawTrackResponse>("/tracks/stats", { ...idParams, source: "all" }),
  ]);

  if (!info && !stats) return null;

  const resolvedId = stats?.track_info?.songstats_track_id ?? info?.track_info?.songstats_track_id;
  const historicParams = resolvedId ? { songstats_track_id: resolvedId, source: "spotify" } : null;

  const [locations, historic] = await Promise.all([
    songstatsGet<unknown>("/tracks/locations", idParams),
    historicParams ? songstatsGet<unknown>("/tracks/historic_stats", historicParams) : Promise.resolve(null),
  ]);

  const growth = deriveGrowth(historic);
  const effectiveIsrc = isrc || stats?.track_info?.isrc || info?.track_info?.isrc || resolvedId || "";

  return normalize(effectiveIsrc, info, stats, locations, growth);
}
