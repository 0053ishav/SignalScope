/**
 * Intelligence Timeline derivation.
 *
 * Merges the song's REAL time-coded RichSync/ontology signals with track-level
 * Musixmatch themes and meaning into a single ordered list. Timed moments come
 * first (chronological); track-level signals follow as context markers. Every
 * entry is tagged with its derived signal type and source — nothing is
 * fabricated, and an empty input simply yields an empty timeline.
 */
import type { AnalysisResponse, LyricSegment } from "@/types/music";
import { extractRichSyncSignals, type AccentKey } from "@/lib/intelligence";

export type TimelineSource = "Musixmatch RichSync" | "Musixmatch";

export interface TimelineEntry {
  /** Seconds into the track for timed moments; null for track-level signals. */
  time: number | null;
  timeLabel: string;
  type: string;
  source: TimelineSource;
  text: string;
  accent: AccentKey;
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function buildIntelligenceTimeline(
  segments: LyricSegment[],
  analysis: AnalysisResponse | null,
  limit = 12,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // 1. Time-coded RichSync / ontology signals.
  for (const sig of extractRichSyncSignals(segments, limit)) {
    entries.push({
      time: sig.time,
      timeLabel: fmtTime(sig.time),
      type: `${sig.signal} Signal`,
      source: "Musixmatch RichSync",
      text: sig.text,
      accent: sig.accent,
    });
  }

  entries.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));

  // 2. Track-level Musixmatch signals (no timestamp) — appended as context.
  const trackLevel: TimelineEntry[] = [];

  const themes = analysis?.themes?.main_themes ?? [];
  for (const t of themes) {
    trackLevel.push({
      time: null,
      timeLabel: "Track",
      type: "Lyrical Theme",
      source: "Musixmatch",
      text: t.quotes?.length ? `${t.theme} — “${t.quotes[0]}”` : t.theme,
      accent: "cyan",
    });
  }

  const moods = analysis?.moods?.main_moods ?? [];
  if (moods.length) {
    trackLevel.push({
      time: null,
      timeLabel: "Track",
      type: "Mood Profile",
      source: "Musixmatch",
      text: moods.join(", "),
      accent: "pink",
    });
  }

  const meaning = analysis?.meaning?.explanation;
  if (meaning) {
    trackLevel.push({
      time: null,
      timeLabel: "Track",
      type: "Meaning",
      source: "Musixmatch",
      text: meaning,
      accent: "violet",
    });
  }

  return [...entries, ...trackLevel];
}
