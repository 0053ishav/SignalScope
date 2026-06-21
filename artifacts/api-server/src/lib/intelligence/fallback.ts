import type { DerivedSignals, SongSignals } from "./types";
import type { IntelligenceResponse } from "./schema";

/**
 * Build a full IntelligenceReport from the deterministic ontology pipeline
 * (extractSongSignals + deriveSignals) WITHOUT calling any LLM. Every field is
 * derived from real Musixmatch signals (moods/themes/meaning/richSync) and the
 * existing ontology graph — nothing is fabricated. Used when Gemini is
 * unavailable so the workspace never appears broken.
 */
export function buildFallbackReport(
  song: SongSignals,
  derived: DerivedSignals,
): IntelligenceResponse {
  const themeQuotes = song.themes.flatMap((t) => t.quotes).filter(Boolean);
  const themeNames = song.themes.map((t) => t.theme).filter(Boolean);

  // Scores are derived transparently from real signal coverage (same spirit as
  // deriveSignals.confidenceScore) — not invented analytics.
  const audienceScore = coverageScore(derived.audienceArchetypes.length, 6, 40);
  const emotionScore = coverageScore(
    derived.emotions.length + song.moods.length,
    8,
    45,
  );
  const viralityScore = coverageScore(
    song.richSyncMoments.length + derived.platformBias.length,
    8,
    35,
  );
  const growthScore = coverageScore(derived.contentOpportunities.length, 10, 40);

  const summary = buildSummary(song, derived);

  return {
    summary,
    scores: {
      audience: audienceScore,
      emotion: emotionScore,
      virality: viralityScore,
      growth: growthScore,
    },
    confidence: derived.confidenceScore,
    viralDrivers: dedupe([
      ...derived.contentAngles.slice(0, 4),
      ...song.richSyncMoments.slice(0, 2).map((m) => `Hook moment: ${m}`),
    ]),
    audienceArchetypes: derived.audienceArchetypes,
    emotionalPositioning: dedupe([...derived.emotions, ...song.moods]),
    culturalPositioning: dedupe([...derived.culturalSignals, ...themeNames]),
    evidence: {
      audience: song.meaning ? [song.meaning] : themeNames.slice(0, 3),
      emotion: song.moods.length ? song.moods : derived.emotions.slice(0, 3),
      culture: themeQuotes.length ? themeQuotes.slice(0, 4) : themeNames,
    },
    contentOpportunities: derived.contentOpportunities,
    growthRecommendations: dedupe([
      ...derived.contentOpportunities.slice(0, 5),
      ...derived.platformBias.map((p) => `Prioritize ${p} for distribution`),
    ]),
    artistActions: dedupe(
      derived.platformBias.map((p) => `Build a ${p} content cadence`),
    ),
    platformFit: derived.platformBias.slice(0, 5).map((platform, i) => ({
      platform,
      score: i === 0 ? "High" : i < 3 ? "Medium" : "Low",
      reason: `Surfaced from mood/theme ontology signals for this track`,
    })),
  };
}

function coverageScore(count: number, perUnit: number, floor: number): number {
  if (count <= 0) return floor;
  return Math.min(100, floor + count * perUnit);
}

function buildSummary(song: SongSignals, derived: DerivedSignals): string {
  const parts: string[] = [];
  if (song.meaning) {
    parts.push(song.meaning);
  } else {
    parts.push(`"${song.title}" by ${song.artist} analyzed from available catalog signals.`);
  }
  if (song.moods.length) {
    parts.push(`Dominant moods: ${song.moods.slice(0, 4).join(", ")}.`);
  }
  if (derived.audienceArchetypes.length) {
    parts.push(`Resonates with ${derived.audienceArchetypes.slice(0, 3).join(", ")}.`);
  }
  return parts.join(" ");
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
