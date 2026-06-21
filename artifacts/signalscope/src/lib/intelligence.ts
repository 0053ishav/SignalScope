import { Layers, Activity, Zap, TrendingUp, type LucideIcon } from "lucide-react";
import type { IntelligenceReport } from "@/types/intelligence";

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
