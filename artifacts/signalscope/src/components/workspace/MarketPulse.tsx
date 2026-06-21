import { Gauge } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { buildPredictionComparison, getMarketPulse } from "@/lib/songstats";

/**
 * One-glance market pulse summarizing how observed Songstats performance lines
 * up with the AI predictions. Renders only when both report and data exist.
 */
export default function MarketPulse() {
  const { report, songstats, songstatsStatus } = useTrackWorkspace();

  if (!report || songstatsStatus !== "ok" || !songstats) return null;
  if (report.platformFit.length === 0) return null;

  const comparisons = buildPredictionComparison(report.platformFit, songstats);
  const pulse = getMarketPulse(comparisons);

  const stats = [
    { label: "On target", value: pulse.confirmed, color: "text-emerald-400" },
    { label: "Outperforming", value: pulse.outperforming, color: "text-cyan-400" },
    { label: "Underperforming", value: pulse.underperforming, color: "text-amber-400" },
    { label: "Unconfirmed", value: pulse.unconfirmed, color: "text-muted-foreground" },
  ];

  return (
    <IntelligenceCard title="Market Pulse" icon={Gauge} iconClassName="text-violet-400">
      <p className="text-sm text-foreground/90 leading-relaxed">{pulse.headline}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card/40 p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </IntelligenceCard>
  );
}
