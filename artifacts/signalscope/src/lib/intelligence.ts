import {
  Layers,
  Activity,
  Zap,
  TrendingUp,
  FileText,
  HeartHandshake,
  Tags,
  Clock,
  BrainCircuit,
  Music,
  BarChart3,
  CalendarRange,
  AudioWaveform,
  Mic,
  type LucideIcon,
} from "lucide-react";
import type { IntelligenceReport } from "@/types/intelligence";
import type { AnalysisResponse, LyricSegment } from "@/types/music";

export const CHART_COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"];

export function clamp(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function scoreBand(score: number): string {
  if (score >= 80) return "Exceptional";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Developing";
  return "Emerging";
}

export type ScoreKey = keyof IntelligenceReport["scores"];

export interface KpiMeta {
  key: ScoreKey;
  title: string;
  icon: LucideIcon;
  color: string;
  ring: string;
  description: string;
}

export const KPI_META: KpiMeta[] = [
  {
    key: "audience",
    title: "Audience Score",
    icon: Layers,
    color: "text-violet-400",
    ring: "#8b5cf6",
    description: "Clarity of the song's audience identity",
  },
  {
    key: "emotion",
    title: "Emotion Score",
    icon: Activity,
    color: "text-pink-400",
    ring: "#ec4899",
    description: "Emotional expressiveness and resonance",
  },
  {
    key: "virality",
    title: "Virality Score",
    icon: Zap,
    color: "text-amber-400",
    ring: "#f59e0b",
    description: "Likelihood of short-form sharing & creator adoption",
  },
  {
    key: "growth",
    title: "Growth Score",
    icon: TrendingUp,
    color: "text-emerald-400",
    ring: "#10b981",
    description: "Marketing and audience-expansion potential",
  },
];

export type AccentKey = "violet" | "pink" | "cyan" | "amber" | "emerald";

export const ACCENTS: Record<AccentKey, { border: string; bg: string; bar: string; text: string }> = {
  violet: { border: "border-violet-500/20", bg: "bg-violet-500/5", bar: "border-violet-500/50", text: "text-violet-400" },
  pink: { border: "border-pink-500/20", bg: "bg-pink-500/5", bar: "border-pink-500/50", text: "text-pink-400" },
  cyan: { border: "border-cyan-500/20", bg: "bg-cyan-500/5", bar: "border-cyan-500/50", text: "text-cyan-400" },
  amber: { border: "border-amber-500/20", bg: "bg-amber-500/5", bar: "border-amber-500/50", text: "text-amber-400" },
  emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", bar: "border-emerald-500/50", text: "text-emerald-400" },
};

export function platformScoreValue(score: "High" | "Medium" | "Low"): number {
  return score === "High" ? 90 : score === "Medium" ? 60 : 30;
}

/* -------------------------------------------------------------------------- */
/* Explainability helpers — derived ONLY from real Musixmatch/ontology inputs */
/* -------------------------------------------------------------------------- */

/**
 * RichSync signal extraction. Mirrors the backend heuristic in
 * `lib/intelligence/signals.ts`: identity words and emotional words mark a line
 * as a salient signal. We never invent categories — a moment is only surfaced
 * if it actually matches one of these real lexicons (or carries a full phrase).
 */
const IDENTITY_WORDS = ["i", "me", "my", "we", "our", "us", "mine"];
const EMOTIONAL_WORDS = ["love", "pain", "dream", "hope", "alone", "home", "heart", "life"];

export interface RichSyncSignal {
  time: number;
  text: string;
  signal: "Identity" | "Emotional" | "Narrative";
  accent: AccentKey;
  weight: number;
}

const SIGNAL_ACCENT: Record<RichSyncSignal["signal"], AccentKey> = {
  Identity: "violet",
  Emotional: "pink",
  Narrative: "cyan",
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function extractRichSyncSignals(segments: LyricSegment[], limit = 8): RichSyncSignal[] {
  const scored: RichSyncSignal[] = [];

  for (const seg of segments) {
    const text = seg.text?.trim();
    if (!text) continue;
    const tokens = tokenize(text);
    if (tokens.length === 0) continue;

    const identityHits = tokens.filter((t) => IDENTITY_WORDS.includes(t)).length;
    const emotionalHits = tokens.filter((t) => EMOTIONAL_WORDS.includes(t)).length;
    const isNarrative = text.length > 40;

    const weight = identityHits * 2 + emotionalHits * 2 + (isNarrative ? 1 : 0);
    if (weight === 0) continue;

    let signal: RichSyncSignal["signal"];
    if (emotionalHits > 0 && emotionalHits >= identityHits) signal = "Emotional";
    else if (identityHits > 0) signal = "Identity";
    else signal = "Narrative";

    scored.push({ time: seg.startTime, text, signal, accent: SIGNAL_ACCENT[signal], weight });
  }

  return scored
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .sort((a, b) => a.time - b.time);
}

/**
 * Confidence drivers — the concrete, real inputs that raise or limit how much
 * the analysis can be trusted. Each driver is `present` only when that data
 * actually exists in the Musixmatch payload for this track.
 */
export interface ConfidenceDriver {
  label: string;
  detail: string;
  present: boolean;
  icon: LucideIcon;
}

export function getConfidenceDrivers(
  analysis: AnalysisResponse | null,
  segments: LyricSegment[],
  hasLyrics: boolean,
): ConfidenceDriver[] {
  const themes = analysis?.themes?.main_themes ?? [];
  const moods = analysis?.moods?.main_moods ?? [];
  const hasMeaning = Boolean(analysis?.meaning?.explanation);

  return [
    {
      label: "Lyrics Available",
      detail: "Full lyric text grounds semantic analysis",
      present: hasLyrics,
      icon: FileText,
    },
    {
      label: "RichSync Timing",
      detail: `${segments.length} time-coded lines for moment-level signals`,
      present: segments.length > 0,
      icon: Clock,
    },
    {
      label: "Mood Signals",
      detail: moods.length ? `${moods.length} mood tags detected` : "No mood metadata",
      present: moods.length > 0,
      icon: HeartHandshake,
    },
    {
      label: "Theme Signals",
      detail: themes.length ? `${themes.length} themes with supporting quotes` : "No theme metadata",
      present: themes.length > 0,
      icon: Tags,
    },
    {
      label: "Meaning Analysis",
      detail: hasMeaning ? "Editorial meaning available" : "No meaning analysis",
      present: hasMeaning,
      icon: BrainCircuit,
    },
  ];
}

/**
 * Source attribution per intelligence section. Only the inputs that genuinely
 * contributed to that section AND exist for this track are returned.
 */
export type SectionKey = "audience" | "emotion" | "culture" | "content" | "distribution";

export interface SectionSource {
  label: string;
  provider: "Musixmatch" | "Gemini";
}

export function getSectionSources(
  section: SectionKey,
  analysis: AnalysisResponse | null,
  segments: LyricSegment[],
  hasLyrics: boolean,
  reportSource: "gemini" | "fallback" | null,
): SectionSource[] {
  const themes = (analysis?.themes?.main_themes ?? []).length > 0;
  const moods = (analysis?.moods?.main_moods ?? []).length > 0;
  const meaning = Boolean(analysis?.meaning?.explanation);
  const rich = segments.length > 0;

  const candidates: Record<SectionKey, SectionSource[]> = {
    audience: [
      ...(themes ? [{ label: "Theme Signals", provider: "Musixmatch" as const }] : []),
      ...(meaning ? [{ label: "Meaning Analysis", provider: "Musixmatch" as const }] : []),
      ...(hasLyrics ? [{ label: "Lyrics", provider: "Musixmatch" as const }] : []),
    ],
    emotion: [
      ...(moods ? [{ label: "Mood Signals", provider: "Musixmatch" as const }] : []),
      ...(rich ? [{ label: "RichSync Moments", provider: "Musixmatch" as const }] : []),
      ...(meaning ? [{ label: "Meaning Analysis", provider: "Musixmatch" as const }] : []),
    ],
    culture: [
      ...(themes ? [{ label: "Theme Signals", provider: "Musixmatch" as const }] : []),
      ...(meaning ? [{ label: "Meaning Analysis", provider: "Musixmatch" as const }] : []),
      ...(hasLyrics ? [{ label: "Lyrics", provider: "Musixmatch" as const }] : []),
    ],
    content: [
      ...(themes ? [{ label: "Theme Signals", provider: "Musixmatch" as const }] : []),
      ...(moods ? [{ label: "Mood Signals", provider: "Musixmatch" as const }] : []),
      ...(rich ? [{ label: "RichSync Moments", provider: "Musixmatch" as const }] : []),
    ],
    distribution: [
      ...(moods ? [{ label: "Mood Signals", provider: "Musixmatch" as const }] : []),
      ...(themes ? [{ label: "Theme Signals", provider: "Musixmatch" as const }] : []),
    ],
  };

  const sources = candidates[section];
  if (reportSource === "gemini") {
    sources.push({ label: "AI Synthesis", provider: "Gemini" });
  }
  return sources;
}

/**
 * Intelligence source registry for the connection panel. Live sources reflect
 * what this build actually queries; the rest are honest "Coming Soon" partner
 * slots — visual only, no data is fabricated from them.
 */
export interface IntelligenceSource {
  name: string;
  status: "connected" | "coming-soon";
  capability: string;
  icon: LucideIcon;
}

export const INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    name: "Musixmatch",
    status: "connected",
    capability: "Lyrics, metadata, moods, themes & RichSync timing",
    icon: Music,
  },
  {
    name: "Gemini",
    status: "connected",
    capability: "AI synthesis of audience & cultural intelligence",
    icon: BrainCircuit,
  },
  {
    name: "Songstats",
    status: "connected",
    capability: "Streaming, playlist, creator & market performance analytics",
    icon: BarChart3,
  },
  {
    name: "JamBase",
    status: "coming-soon",
    capability: "Live events & touring intelligence",
    icon: CalendarRange,
  },
  {
    name: "Cyanite",
    status: "coming-soon",
    capability: "Audio & sonic AI analysis",
    icon: AudioWaveform,
  },
  {
    name: "ElevenLabs",
    status: "coming-soon",
    capability: "Voice & generative audio",
    icon: Mic,
  },
];
