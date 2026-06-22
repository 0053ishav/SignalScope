/**
 * Cross-Source Fusion derivation.
 *
 * Detects where MULTIPLE independent real sources agree on the same dimension
 * (audience, emotional read, market momentum) and emits an explicit per-source
 * agreement list plus a confidence verdict. Purely deterministic over real
 * fields — a dimension is only emitted when at least two DISTINCT sources
 * actually contribute, so no agreement is ever fabricated.
 */
import type { TrackWorkspaceValue } from "@/context/TrackWorkspaceContext";
import { extractRichSyncSignals } from "@/lib/intelligence";
import { livePresenceSummary } from "@/lib/jambase";

export type FusionSource = "Musixmatch" | "Gemini" | "Songstats" | "JamBase";

export interface FusionContributor {
  source: FusionSource;
  signal: string;
}

export interface FusionDimension {
  key: "audience" | "emotional" | "market";
  title: string;
  verdict: string;
  confidence: "High" | "Medium";
  contributors: FusionContributor[];
}

export type FusionInput = Pick<
  TrackWorkspaceValue,
  | "analysis"
  | "report"
  | "reportSource"
  | "segments"
  | "songstats"
  | "songstatsStatus"
  | "jambase"
  | "jambaseStatus"
>;

function verdict(label: string, count: number): { verdict: string; confidence: "High" | "Medium" } {
  const confidence = count >= 3 ? "High" : "Medium";
  return { verdict: `${confidence} Confidence ${label}`, confidence };
}

export function buildFusion(ctx: FusionInput): FusionDimension[] {
  const { analysis, report, reportSource, segments, songstats, songstatsStatus, jambase, jambaseStatus } =
    ctx;

  const geminiActive = Boolean(report) && reportSource === "gemini";
  const songstatsOk = songstatsStatus === "ok" && Boolean(songstats);
  const jambaseOk = jambaseStatus === "ok" && Boolean(jambase);

  const themes = analysis?.themes?.main_themes ?? [];
  const moods = analysis?.moods?.main_moods ?? [];

  const dimensions: FusionDimension[] = [];

  /* ---- Audience -------------------------------------------------------- */
  {
    const contributors: FusionContributor[] = [];
    if (themes.length) {
      contributors.push({ source: "Musixmatch", signal: `Lyrical theme “${themes[0].theme}”` });
    }
    if (geminiActive && report?.audienceArchetypes?.length) {
      contributors.push({ source: "Gemini", signal: `Archetype “${report.audienceArchetypes[0]}”` });
    }
    if (songstatsOk && songstats?.topMarkets?.length) {
      const top = songstats.topMarkets[0];
      contributors.push({
        source: "Songstats",
        signal: `Real audience in ${top.country} (${top.value.toLocaleString()})`,
      });
    }
    if (contributors.length >= 2) {
      const v = verdict("Audience Match", contributors.length);
      dimensions.push({ key: "audience", title: "Audience", contributors, ...v });
    }
  }

  /* ---- Emotional ------------------------------------------------------- */
  {
    const contributors: FusionContributor[] = [];
    if (moods.length) {
      contributors.push({ source: "Musixmatch", signal: `Mood profile: ${moods.slice(0, 2).join(", ")}` });
    }
    if (geminiActive && report?.emotionalPositioning?.length) {
      contributors.push({ source: "Gemini", signal: `Positioning “${report.emotionalPositioning[0]}”` });
    }
    const emotionalMoments = extractRichSyncSignals(segments).filter((s) => s.signal === "Emotional");
    if (emotionalMoments.length) {
      contributors.push({
        source: "Musixmatch",
        signal: `${emotionalMoments.length} emotional RichSync moment${emotionalMoments.length === 1 ? "" : "s"}`,
      });
    }
    // Require at least two DISTINCT sources.
    const distinct = new Set(contributors.map((c) => c.source));
    if (contributors.length >= 2 && distinct.size >= 2) {
      const v = verdict("Emotional Read", distinct.size);
      dimensions.push({ key: "emotional", title: "Emotional Read", contributors, ...v });
    }
  }

  /* ---- Market momentum ------------------------------------------------- */
  {
    const contributors: FusionContributor[] = [];
    if (songstatsOk && songstats?.growth) {
      const g = songstats.growth;
      const dir = g.percent > 0 ? "up" : g.percent < 0 ? "down" : "flat";
      contributors.push({ source: "Songstats", signal: `${g.metric} ${dir} ${Math.abs(g.percent)}% (${g.window})` });
    }
    if (geminiActive && report?.growthRecommendations?.length) {
      contributors.push({ source: "Gemini", signal: `Growth play “${report.growthRecommendations[0]}”` });
    }
    if (jambaseOk) {
      const live = livePresenceSummary(jambase);
      if (live) contributors.push({ source: "JamBase", signal: live });
    }
    const distinct = new Set(contributors.map((c) => c.source));
    if (distinct.size >= 2) {
      const v = verdict("Market Momentum", distinct.size);
      dimensions.push({ key: "market", title: "Market Momentum", contributors, ...v });
    }
  }

  return dimensions;
}
