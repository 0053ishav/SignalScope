import { Network, CheckCircle2, Music, BrainCircuit, BarChart3, CalendarRange } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { buildFusion, type FusionSource } from "@/lib/fusion";

const SOURCE_ICON: Record<FusionSource, LucideIcon> = {
  Musixmatch: Music,
  Gemini: BrainCircuit,
  Songstats: BarChart3,
  JamBase: CalendarRange,
};

/**
 * Cross-Source Fusion card. Renders ONLY when ≥2 real sources agree on at least
 * one dimension; otherwise renders nothing (no fabricated agreement). Each
 * dimension lists its per-source evidence and a cross-source verdict.
 */
export default function FusionCard() {
  const ctx = useTrackWorkspace();
  const dimensions = buildFusion(ctx);

  if (dimensions.length === 0) return null;

  return (
    <IntelligenceCard title="Cross-Source Fusion" icon={Network} iconClassName="text-cyan-400">
      <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
        Where multiple independent sources corroborate the same read. Derived deterministically — shown
        only when at least two real sources agree.
      </p>
      <div className="space-y-3">
        {dimensions.map((d) => (
          <div key={d.key} className="rounded-lg border border-border bg-card/40 p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-sm font-semibold text-foreground">{d.title}</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border ${
                  d.confidence === "High"
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {d.verdict}
              </span>
            </div>
            <ul className="space-y-1.5">
              {d.contributors.map((c, i) => {
                const Icon = SOURCE_ICON[c.source];
                return (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-foreground/90">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="leading-snug">
                      <span className="font-medium text-foreground">{c.source}:</span> {c.signal}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </IntelligenceCard>
  );
}
