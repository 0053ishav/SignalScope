import type {
  SongstatsRawTrackResponse,
  SongstatsRawStatEntry,
  SongstatsRawTrackInfo,
  SongstatsRawArtist,
  SongstatsRawArtistInfoResponse,
  SongstatsRawArtistStatsResponse,
  SongstatsRawLink,
  SongstatsTrackData,
  SongstatsPlatform,
  SongstatsMetric,
  SongstatsTopMarket,
  SongstatsGrowth,
  SongstatsTrend,
  SongstatsHistoryPoint,
  SongstatsCollaborator,
  SongstatsLink,
  SongstatsArtist,
  SongstatsArtistReach,
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

/** Normalize raw genre/distributor/label arrays into clean string lists. */
function extractStrings(items: Array<{ name?: string } | string> | undefined): string[] {
  if (!Array.isArray(items)) return [];
  const out: string[] = [];
  for (const item of items) {
    const name = typeof item === "string" ? item : item?.name;
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

/** Normalize collaborators: keep only named entries with their real roles. */
function extractCollaborators(info: SongstatsRawTrackInfo | undefined): SongstatsCollaborator[] {
  const raw = info?.collaborators;
  if (!Array.isArray(raw)) return [];
  const out: SongstatsCollaborator[] = [];
  for (const c of raw) {
    const name = typeof c?.name === "string" ? c.name.trim() : "";
    if (!name) continue;
    const roles = Array.isArray(c?.roles)
      ? c.roles.filter((r): r is string => typeof r === "string" && r.trim().length > 0).map((r) => r.trim())
      : [];
    out.push({ name, roles, id: c?.songstats_collaborator_id || undefined });
  }
  return out;
}

/**
 * Dedupe the raw links[] (which carries multiple entries per source for
 * different ISRCs/mixes) to one canonical link per source. Prefer the link
 * whose ISRC matches this track; otherwise take the first for that source.
 */
function extractLinks(info: SongstatsRawTrackInfo | undefined, effectiveIsrc: string): SongstatsLink[] {
  const raw = info?.links;
  if (!Array.isArray(raw)) return [];
  const bySource = new Map<string, SongstatsLink>();
  const matchedSource = new Set<string>();

  for (const l of raw) {
    const source = typeof l?.source === "string" ? l.source.trim() : "";
    const url = typeof l?.url === "string" ? l.url.trim() : "";
    if (!source || !url) continue;

    const isMatch = Boolean(effectiveIsrc && l?.isrc && l.isrc === effectiveIsrc);
    // Keep the first link per source, then upgrade to an ISRC-matched one if found.
    if (!bySource.has(source)) {
      bySource.set(source, { source, label: sourceLabel(source), url });
      if (isMatch) matchedSource.add(source);
    } else if (isMatch && !matchedSource.has(source)) {
      bySource.set(source, { source, label: sourceLabel(source), url });
      matchedSource.add(source);
    }
  }
  return Array.from(bySource.values());
}

/**
 * The audience-reach metrics we surface at the artist level — real follower /
 * listener figures only (never playlists/charts/streams totals). Mapped key ->
 * humanized label so the UI shows an honest, meaningful number per platform.
 */
const ARTIST_REACH_METRICS: Array<{ key: string; label: string }> = [
  { key: "monthly_listeners_current", label: "Monthly Listeners" },
  { key: "followers_total", label: "Followers" },
  { key: "subscribers_total", label: "Subscribers" },
  { key: "monthly_audience_current", label: "Monthly Audience" },
];

/** Extract real per-platform follower/listener reach from artist stats[]. */
function extractArtistReach(stats: SongstatsRawStatEntry[] | undefined): SongstatsArtistReach[] {
  if (!Array.isArray(stats)) return [];
  const out: SongstatsArtistReach[] = [];
  for (const entry of stats) {
    const source = typeof entry?.source === "string" ? entry.source : "";
    const data = entry?.data as Record<string, unknown> | undefined;
    if (!source || !data) continue;
    for (const { key, label } of ARTIST_REACH_METRICS) {
      const value = toNumber(data[key]);
      if (value !== undefined && value > 0) {
        out.push({ source, label: sourceLabel(source), metricKey: key, metricLabel: label, value });
      }
    }
  }
  return out.sort((a, b) => b.value - a.value);
}

/** Dedupe an artist's external links to one canonical entry per source. */
function extractArtistLinks(raw: SongstatsRawLink[] | undefined): SongstatsLink[] {
  if (!Array.isArray(raw)) return [];
  const bySource = new Map<string, SongstatsLink>();
  for (const l of raw) {
    const source = typeof l?.source === "string" ? l.source.trim() : "";
    const url = typeof l?.url === "string" ? l.url.trim() : "";
    if (!source || !url || bySource.has(source)) continue;
    bySource.set(source, { source, label: sourceLabel(source), url });
  }
  return Array.from(bySource.values());
}

/**
 * Fetch + normalize one primary artist (identity + links + audience reach).
 * Degrades gracefully: if the artist endpoints fail, falls back to the name /
 * avatar already present on the track's artist entry. Returns null only when
 * there is no usable identity at all.
 */
async function fetchArtist(rawArtist: SongstatsRawArtist): Promise<SongstatsArtist | null> {
  const id = typeof rawArtist?.songstats_artist_id === "string" ? rawArtist.songstats_artist_id.trim() : "";
  if (!id) return null;

  const params = { songstats_artist_id: id };
  const [info, stats] = await Promise.all([
    songstatsGet<SongstatsRawArtistInfoResponse>("/artists/info", params),
    songstatsGet<SongstatsRawArtistStatsResponse>("/artists/stats", { ...params, source: "all" }),
  ]);

  const ai = info?.artist_info;
  const name = (typeof ai?.name === "string" && ai.name.trim()) || (typeof rawArtist.name === "string" && rawArtist.name.trim()) || "";
  if (!name) return null;

  const genres = extractStrings(ai?.genres);
  const links = extractArtistLinks(ai?.links);
  const reach = extractArtistReach(stats?.stats);

  return {
    id,
    name,
    avatarUrl: ai?.avatar || rawArtist.avatar || undefined,
    siteUrl: ai?.site_url || undefined,
    country: typeof ai?.country === "string" && ai.country.trim() ? ai.country.trim() : undefined,
    genres: genres.length ? genres : undefined,
    links: links.length ? links : undefined,
    reach: reach.length ? reach : undefined,
  };
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
  trend: SongstatsTrend | undefined,
  artists: SongstatsArtist[],
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

  const genres = extractStrings(trackInfo?.genres);
  const distributors = extractStrings(trackInfo?.distributors);
  const labels = extractStrings(trackInfo?.labels);
  const collaborators = extractCollaborators(trackInfo);
  const links = extractLinks(trackInfo, isrc);

  const data: SongstatsTrackData = {
    isrc,
    songstatsTrackId: trackInfo?.songstats_track_id,
    title: trackInfo?.title,
    artist: trackInfo?.artists?.map((a) => a.name).filter(Boolean).join(", ") || undefined,
    releaseDate: trackInfo?.release_date,
    avatarUrl: trackInfo?.avatar,
    siteUrl: trackInfo?.site_url,

    genres: genres.length ? genres : undefined,
    distributors: distributors.length ? distributors : undefined,
    labels: labels.length ? labels : undefined,
    collaborators: collaborators.length ? collaborators : undefined,
    links: links.length ? links : undefined,
    isRemix: typeof trackInfo?.is_remix === "boolean" ? trackInfo.is_remix : undefined,
    artists: artists.length ? artists : undefined,

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
    trend,
    lastUpdated: new Date().toISOString(),
  };

  // Consider it usable if we got platforms, a headline KPI, OR real catalog
  // metadata (genres / links / credits). Metadata-only tracks still surface.
  const hasMetadata =
    genres.length > 0 ||
    distributors.length > 0 ||
    labels.length > 0 ||
    collaborators.length > 0 ||
    links.length > 0 ||
    artists.length > 0 ||
    typeof data.isRemix === "boolean";
  const hasAnything =
    platforms.length > 0 ||
    hasMetadata ||
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

/* ---------------------- trend + growth (optional) ------------------------ */

/** Candidate keys for the value/date fields inside a `history` row. */
const TREND_VALUE_KEYS = ["streams_total", "streams", "value", "count_total", "count"];
const TREND_DATE_KEYS = ["date", "day", "timestamp"];

/**
 * Extract a real historic time series from /tracks/historic_stats (Spotify
 * streams). Returns undefined on any shape mismatch — points are never
 * fabricated or interpolated.
 */
function extractTrend(historic: unknown): SongstatsTrend | undefined {
  if (!historic || typeof historic !== "object") return undefined;

  // Tolerate: { stats:[{source, data:{history:[{date, streams_total}]}}] }
  const obj = historic as Record<string, unknown>;
  const stats = Array.isArray(obj.stats) ? (obj.stats as SongstatsRawStatEntry[]) : [];
  const entry = stats.find((s) => s?.source === "spotify") ?? stats[0];
  const data = entry?.data as Record<string, unknown> | undefined;
  const history = data && Array.isArray(data.history) ? (data.history as unknown[]) : [];
  if (history.length < 2) return undefined;

  let metricKey: string | undefined;
  const points: SongstatsHistoryPoint[] = [];
  for (const h of history) {
    if (!h || typeof h !== "object") continue;
    const row = h as Record<string, unknown>;

    let date: string | undefined;
    for (const k of TREND_DATE_KEYS) {
      const v = row[k];
      if (typeof v === "string" && v) { date = v; break; }
      if (typeof v === "number" && Number.isFinite(v)) { date = String(v); break; }
    }

    let value: number | undefined;
    for (const k of TREND_VALUE_KEYS) {
      const n = toNumber(row[k]);
      if (n !== undefined) { value = n; metricKey ??= k; break; }
    }

    if (date && value !== undefined) points.push({ date, value });
  }

  if (points.length < 2 || !metricKey) return undefined;

  return {
    source: entry?.source ?? "spotify",
    metric: metricLabel(metricKey),
    metricKey,
    points,
  };
}

/**
 * Derive a real growth percentage from an extracted trend (first vs last
 * point). Any unusable series -> undefined (never fabricated).
 */
function growthFromTrend(trend: SongstatsTrend | undefined): SongstatsGrowth | undefined {
  if (!trend || trend.points.length < 2) return undefined;

  const first = trend.points[0].value;
  const last = trend.points[trend.points.length - 1].value;
  if (first <= 0) return undefined;

  const percent = ((last - first) / first) * 100;
  if (!Number.isFinite(percent)) return undefined;

  return {
    source: trend.source,
    metric: trend.metric,
    percent: Math.round(percent * 10) / 10,
    window: `${trend.points.length} data points`,
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

  // Primary artists come from track_info; cap the fan-out to respect the
  // ~10 req/s rate limit (each artist costs 2 calls).
  const rawArtists = (stats?.track_info?.artists ?? info?.track_info?.artists ?? [])
    .filter((a): a is SongstatsRawArtist => Boolean(a?.songstats_artist_id))
    .slice(0, 4);

  const [locations, historic, artistResults] = await Promise.all([
    songstatsGet<unknown>("/tracks/locations", idParams),
    historicParams ? songstatsGet<unknown>("/tracks/historic_stats", historicParams) : Promise.resolve(null),
    Promise.all(rawArtists.map(fetchArtist)),
  ]);

  const artists = artistResults.filter((a): a is SongstatsArtist => a !== null);
  const trend = extractTrend(historic);
  const growth = growthFromTrend(trend);
  const effectiveIsrc = isrc || stats?.track_info?.isrc || info?.track_info?.isrc || resolvedId || "";

  return normalize(effectiveIsrc, info, stats, locations, growth, trend, artists);
}
