import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import SongstatsBrandIcon, { songstatsBrandColor } from "./SongstatsBrandIcon";
import { buildHeadlineKpis, getMomentumReading } from "@/lib/songstats";

/**
 * Compact market-performance snapshot for the Overview / Executive Briefing.
 * Surfaces a few real Songstats headline metrics + momentum and any
 * market-derived opportunities. Degrades to an honest note — never fabricated.
 */
export default function MarketHighlights() {
  const { songstats, songstatsSignals, songstatsStatus } = useTrackWorkspace();

  if (songstatsStatus === "loading") return null;

  if (songstatsStatus !== "ok" || !songstats) {
    return (
      <IntelligenceCard title="Market Performance" icon={TrendingUp}>
        <SongstatsUnavailable status={songstatsStatus} compact />
      </IntelligenceCard>
    );
  }

  const kpis = buildHeadlineKpis(songstats).slice(0, 4);
  const momentum = getMomentumReading(songstats);
  const opportunities = (songstatsSignals?.signals ?? []).filter((s) =>
    ["momentum", "creator", "discovery"].includes(s.category),
  );

  const MomentumIcon =
    momentum?.direction === "up" ? TrendingUp : momentum?.direction === "down" ? TrendingDown : Minus;
  const momentumColor =
    momentum?.direction === "up"
      ? "text-emerald-400"
      : momentum?.direction === "down"
        ? "text-red-400"
        : "text-muted-foreground";

  return (
    <IntelligenceCard title="Market Performance" icon={TrendingUp} iconClassName="text-emerald-400">
      <p className="text-xs text-muted-foreground -mt-1 mb-3">
        Live performance from Songstats — real metrics only.
      </p>

      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-border bg-card/40 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <SongstatsBrandIcon source={kpi.sourceKey} className={`w-3.5 h-3.5 ${songstatsBrandColor(kpi.sourceKey)}`} />
                <span className="text-[10px] text-muted-foreground">{kpi.source}</span>
              </div>
              <div className="text-lg font-bold text-foreground">{kpi.formatted}</div>
              <div className="text-[11px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {momentum && (
        <div className={`flex items-center gap-2 mt-3 text-sm ${momentumColor}`}>
          <MomentumIcon className="w-4 h-4" />
          <span className="font-medium">
            {momentum.percent > 0 ? "+" : ""}
            {momentum.percent}% {momentum.metric} ({momentum.window})
          </span>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-foreground">Market-Driven Opportunities</span>
          </div>
          <ul className="space-y-2">
            {opportunities.map((s) => (
              <li key={s.id} className="flex gap-2.5 text-sm text-foreground/90">
                <span className="text-amber-400 mt-0.5">•</span>
                <span className="leading-relaxed">{s.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </IntelligenceCard>
  );
}
