import type {
  SongstatsTrackData,
  SongstatsTopMarket,
} from "@/types/songstats";
import type { PlatformFit } from "@/types/intelligence";

/* -------------------------------------------------------------------------- */
/* Songstats presentation helpers — pure formatting / interpretation over REAL */
/* returned metrics. No value is fabricated; helpers only run on data that     */
/* Songstats actually returned.                                                */
/* -------------------------------------------------------------------------- */

export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US").format(n);
}

export interface HeadlineKpi {
  label: string;
  value: number;
  formatted: string;
  source: string;
  /** Source key for brand-icon lookup (e.g. "spotify"). */
  sourceKey: string;
}

/** Build the headline KPI list — only entries whose real field is present. */
export function buildHeadlineKpis(data: SongstatsTrackData): HeadlineKpi[] {
  const kpis: HeadlineKpi[] = [];
  const push = (label: string, value: number | undefined, source: string, sourceKey: string) => {
    if (value !== undefined) {
      kpis.push({ label, value, formatted: formatCompactNumber(value), source, sourceKey });
    }
  };

  push("Spotify Streams", data.spotifyStreams, "Spotify", "spotify");
  push("Playlist Reach", data.playlistReach, "Spotify", "spotify");
  push("Playlists", data.playlistCount, "Spotify", "spotify");
  push("Spotify Popularity", data.spotifyPopularity, "Spotify", "spotify");
  push("TikTok Creations", data.tiktokVideos, "TikTok", "tiktok");
  push("TikTok Views", data.tiktokViews, "TikTok", "tiktok");
  push("YouTube Views", data.youtubeViews, "YouTube", "youtube");
  push("Instagram Posts", data.instagramPosts, "Instagram", "instagram");
  push("Shazams", data.shazamCount, "Shazam", "shazam");

  return kpis;
}

export interface MomentumReading {
  direction: "up" | "down" | "flat";
  percent: number;
  metric: string;
  window: string;
  label: string;
}

/** Momentum reading — present ONLY when Songstats returned a growth figure. */
export function getMomentumReading(data: SongstatsTrackData): MomentumReading | null {
  if (!data.growth) return null;
  const { percent, metric, window } = data.growth;
  const direction = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
  const label =
    direction === "up" ? "Gaining momentum" : direction === "down" ? "Cooling off" : "Holding steady";
  return { direction, percent, metric, window, label };
}

export function topMarkets(data: SongstatsTrackData, limit = 5): SongstatsTopMarket[] {
  return data.topMarkets.slice(0, limit);
}

/* ----------------------- prediction vs performance ------------------------ */

export type ObservedLevel = "Strong" | "Moderate" | "Limited";

export interface ObservedPlatform {
  /** The real metric value backing the reading. */
  value: number;
  formatted: string;
  metricLabel: string;
  level: ObservedLevel;
}

const OBSERVED_THRESHOLDS: Record<string, { strong: number; moderate: number }> = {
  spotify: { strong: 1_000_000, moderate: 100_000 },
  tiktok: { strong: 1_000_000, moderate: 100_000 },
  youtube: { strong: 1_000_000, moderate: 100_000 },
  instagram: { strong: 50_000, moderate: 5_000 },
};

function levelFor(source: string, value: number): ObservedLevel {
  const t = OBSERVED_THRESHOLDS[source] ?? { strong: 1_000_000, moderate: 100_000 };
  if (value >= t.strong) return "Strong";
  if (value >= t.moderate) return "Moderate";
  return "Limited";
}

/**
 * Map a Gemini platform-fit platform name to the matching observed Songstats
 * metric. Returns null when Songstats returned nothing for that platform.
 */
export function observedForPlatform(
  data: SongstatsTrackData,
  platform: string,
): ObservedPlatform | null {
  const p = platform.toLowerCase();

  const make = (value: number | undefined, source: string, metricLabel: string): ObservedPlatform | null =>
    value === undefined
      ? null
      : { value, formatted: formatCompactNumber(value), metricLabel, level: levelFor(source, value) };

  if (p.includes("tiktok")) {
    return make(data.tiktokViews ?? data.tiktokVideos, "tiktok", data.tiktokViews !== undefined ? "TikTok views" : "TikTok creations");
  }
  if (p.includes("spotify") || p.includes("streaming") || p.includes("playlist")) {
    return make(data.spotifyStreams ?? data.playlistReach, "spotify", data.spotifyStreams !== undefined ? "Spotify streams" : "playlist reach");
  }
  if (p.includes("youtube") || p.includes("shorts")) {
    return make(data.youtubeViews, "youtube", "YouTube views");
  }
  if (p.includes("instagram") || p.includes("reels")) {
    return make(data.instagramPosts, "instagram", "Instagram posts");
  }

  // Fall back to any matching named platform in the per-source breakdown.
  const platformMatch = data.platforms.find((pl) => p.includes(pl.source) || pl.label.toLowerCase().includes(p));
  if (platformMatch && platformMatch.metrics.length > 0) {
    const top = platformMatch.metrics[0];
    return make(top.value, platformMatch.source, top.label);
  }
  return null;
}

export type Alignment = "aligned" | "outperforming" | "underperforming" | "unconfirmed";

export interface PredictionComparison {
  platform: string;
  predicted: PlatformFit["score"];
  observed: ObservedPlatform | null;
  alignment: Alignment;
  note: string;
}

const SCORE_RANK: Record<PlatformFit["score"], number> = { High: 3, Medium: 2, Low: 1 };
const LEVEL_RANK: Record<ObservedLevel, number> = { Strong: 3, Moderate: 2, Limited: 1 };

/** Compare Gemini's predicted platform fit against observed Songstats reality. */
export function buildPredictionComparison(
  platformFit: PlatformFit[],
  data: SongstatsTrackData | null,
): PredictionComparison[] {
  return platformFit.map((fit) => {
    const observed = data ? observedForPlatform(data, fit.platform) : null;
    if (!observed) {
      return {
        platform: fit.platform,
        predicted: fit.score,
        observed: null,
        alignment: "unconfirmed",
        note: "No Songstats data for this platform yet.",
      };
    }

    const predictedRank = SCORE_RANK[fit.score];
    const observedRank = LEVEL_RANK[observed.level];

    let alignment: Alignment;
    let note: string;
    if (observedRank === predictedRank) {
      alignment = "aligned";
      note = `Prediction matches observed ${observed.metricLabel} (${observed.formatted}).`;
    } else if (observedRank > predictedRank) {
      alignment = "outperforming";
      note = `Outperforming the ${fit.score} prediction — ${observed.formatted} ${observed.metricLabel}.`;
    } else {
      alignment = "underperforming";
      note = `Below the ${fit.score} prediction — ${observed.formatted} ${observed.metricLabel}.`;
    }

    return { platform: fit.platform, predicted: fit.score, observed, alignment, note };
  });
}

export interface MarketPulse {
  confirmed: number;
  outperforming: number;
  underperforming: number;
  unconfirmed: number;
  headline: string;
}

/** Summarize the prediction-vs-performance comparison into a single pulse. */
export function getMarketPulse(comparisons: PredictionComparison[]): MarketPulse {
  const confirmed = comparisons.filter((c) => c.alignment === "aligned").length;
  const outperforming = comparisons.filter((c) => c.alignment === "outperforming").length;
  const underperforming = comparisons.filter((c) => c.alignment === "underperforming").length;
  const unconfirmed = comparisons.filter((c) => c.alignment === "unconfirmed").length;

  let headline: string;
  if (outperforming > 0 && outperforming >= underperforming) {
    headline = "Real performance is beating predictions on at least one channel — lean in.";
  } else if (underperforming > outperforming) {
    headline = "Some predicted channels are underperforming in the market — revisit strategy.";
  } else if (confirmed > 0) {
    headline = "Observed performance is tracking with predictions.";
  } else {
    headline = "Not enough market data yet to confirm predictions.";
  }

  return { confirmed, outperforming, underperforming, unconfirmed, headline };
}
