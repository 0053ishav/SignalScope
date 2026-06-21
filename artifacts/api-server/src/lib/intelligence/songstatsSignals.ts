import type {
  SongstatsTrackData,
  SongstatsSignal,
  SongstatsSignals,
} from "@/types/songstats";

/**
 * Convert normalized Songstats metrics into reusable intelligence signals.
 *
 * Each signal is grounded in a REAL returned metric (`metricValue`). The
 * thresholds below decide whether a metric is notable enough to *label*; they
 * never invent a number. `label`/`detail` are honest interpretations of the
 * real value, framed as interpretation rather than fabricated data.
 *
 * Output is intentionally provider-agnostic so future partner sources (JamBase,
 * Cyanite, …) can emit the same `SongstatsSignal[]` shape and be consumed by the
 * same UI without re-transformation.
 */

const THRESHOLDS = {
  playlistReach: 100_000,
  tiktokVideos: 5_000,
  tiktokViews: 1_000_000,
  spotifyPopularity: 60,
  youtubeViews: 1_000_000,
  spotifyStreams: 1_000_000,
};

function compact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function deriveSongstatsSignals(data: SongstatsTrackData): SongstatsSignals {
  const signals: SongstatsSignal[] = [];

  if (data.growth && data.growth.percent > 0) {
    signals.push({
      id: "upward-momentum",
      category: "momentum",
      label: "Upward Momentum",
      detail: `${data.growth.metric} are climbing (+${data.growth.percent}% over ${data.growth.window}), indicating active growth worth amplifying.`,
      metricKey: "growth.percent",
      metricValue: data.growth.percent,
    });
  }

  if (data.playlistReach !== undefined && data.playlistReach >= THRESHOLDS.playlistReach) {
    signals.push({
      id: "mainstream-discovery",
      category: "discovery",
      label: "Mainstream Discovery",
      detail: `Playlist reach of ${compact(data.playlistReach)} listeners points to strong editorial/algorithmic discovery surface.`,
      metricKey: "playlistReach",
      metricValue: data.playlistReach,
    });
  }

  if (data.tiktokVideos !== undefined && data.tiktokVideos >= THRESHOLDS.tiktokVideos) {
    signals.push({
      id: "creator-adoption",
      category: "creator",
      label: "Creator Adoption",
      detail: `${compact(data.tiktokVideos)} TikTok creations show the track is being adopted by creators — fuel for short-form campaigns.`,
      metricKey: "tiktokVideos",
      metricValue: data.tiktokVideos,
    });
  } else if (data.tiktokViews !== undefined && data.tiktokViews >= THRESHOLDS.tiktokViews) {
    signals.push({
      id: "creator-adoption",
      category: "creator",
      label: "Creator Adoption",
      detail: `${compact(data.tiktokViews)} TikTok views indicate meaningful short-form traction.`,
      metricKey: "tiktokViews",
      metricValue: data.tiktokViews,
    });
  }

  if (data.spotifyPopularity !== undefined && data.spotifyPopularity >= THRESHOLDS.spotifyPopularity) {
    signals.push({
      id: "streaming-momentum",
      category: "momentum",
      label: "Streaming Momentum",
      detail: `A Spotify popularity index of ${data.spotifyPopularity} reflects active, recent streaming relative to the catalog.`,
      metricKey: "spotifyPopularity",
      metricValue: data.spotifyPopularity,
    });
  }

  if (data.youtubeViews !== undefined && data.youtubeViews >= THRESHOLDS.youtubeViews) {
    signals.push({
      id: "long-form-consumption",
      category: "consumption",
      label: "Long-form Consumption",
      detail: `${compact(data.youtubeViews)} YouTube views signal demand for long-form/visual content.`,
      metricKey: "youtubeViews",
      metricValue: data.youtubeViews,
    });
  }

  if (data.spotifyStreams !== undefined && data.spotifyStreams >= THRESHOLDS.spotifyStreams) {
    signals.push({
      id: "proven-reach",
      category: "reach",
      label: "Proven Reach",
      detail: `${compact(data.spotifyStreams)} Spotify streams establish a real audience base to retarget and expand.`,
      metricKey: "spotifyStreams",
      metricValue: data.spotifyStreams,
    });
  }

  return { signals };
}
