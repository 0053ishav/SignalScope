import { CheckCircle2, ArrowUpCircle, ArrowDownCircle, HelpCircle } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { buildPredictionComparison, type Alignment } from "@/lib/songstats";

const ALIGNMENT_META: Record<
  Alignment,
  { icon: typeof CheckCircle2; color: string; chip: string; label: string }
> = {
  aligned: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    chip: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    label: "On target",
  },
  outperforming: {
    icon: ArrowUpCircle,
    color: "text-cyan-400",
    chip: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    label: "Outperforming",
  },
  underperforming: {
    icon: ArrowDownCircle,
    color: "text-amber-400",
    chip: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    label: "Underperforming",
  },
  unconfirmed: {
    icon: HelpCircle,
    color: "text-muted-foreground",
    chip: "bg-secondary text-muted-foreground border-border",
    label: "Unconfirmed",
  },
};

/**
 * Reconciles Gemini's predicted platform fit against observed Songstats reality.
 * Renders nothing unless both a report and real Songstats data exist.
 */
export default function PredictionVsPerformance() {
  const { report, songstats, songstatsStatus } = useTrackWorkspace();

  if (!report || songstatsStatus !== "ok" || !songstats) return null;
  if (report.platformFit.length === 0) return null;

  const comparisons = buildPredictionComparison(report.platformFit, songstats);

  return (
    <IntelligenceCard title="Prediction vs. Performance" icon={CheckCircle2} iconClassName="text-cyan-400">
      <p className="text-xs text-muted-foreground -mt-1 mb-3">
        AI platform predictions checked against real Songstats market data.
      </p>
      <div className="space-y-2.5">
        {comparisons.map((c) => {
          const meta = ALIGNMENT_META[c.alignment];
          const Icon = meta.icon;
          return (
            <div
              key={c.platform}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/40"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{c.platform}</span>
                  <span className="text-[10px] text-muted-foreground">
                    predicted <span className="font-medium text-foreground/80">{c.predicted}</span>
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${meta.chip}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{c.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </IntelligenceCard>
  );
}
