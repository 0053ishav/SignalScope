import { Loader2, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { buildHeadlineKpis, getMomentumReading } from "@/lib/songstats";
import SongstatsBrandIcon, { songstatsBrandColor } from "./SongstatsBrandIcon";

/**
 * Slim market-performance strip under the workspace header. Shows real Songstats
 * headline metrics when available, an unobtrusive loading state while fetching,
 * and an honest one-line note when Songstats has no data / isn't connected.
 * It never blocks the workspace.
 */
export default function TrackPerformanceBanner() {
  const { songstats, songstatsStatus } = useTrackWorkspace();

  if (songstatsStatus === "loading") {
    return (
      <div className="border-b border-border bg-card/40 px-4 md:px-6 py-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading live market performance…</span>
      </div>
    );
  }

  if (songstatsStatus !== "ok" || !songstats) {
    const note =
      songstatsStatus === "unavailable"
        ? "Live market performance (Songstats) isn't connected — no metrics are estimated."
        : songstatsStatus === "empty"
          ? "Songstats has no market performance for this track yet."
          : "Songstats market performance is temporarily unavailable.";
    return (
      <div className="border-b border-border bg-card/40 px-4 md:px-6 py-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{note}</span>
      </div>
    );
  }

  const kpis = buildHeadlineKpis(songstats).slice(0, 5);
  const momentum = getMomentumReading(songstats);

  if (kpis.length === 0) {
    return (
      <div className="border-b border-border bg-card/40 px-4 md:px-6 py-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Songstats connected — no headline metrics returned for this track.</span>
      </div>
    );
  }

  const MomentumIcon =
    momentum?.direction === "up" ? TrendingUp : momentum?.direction === "down" ? TrendingDown : Minus;
  const momentumColor =
    momentum?.direction === "up"
      ? "text-emerald-400"
      : momentum?.direction === "down"
        ? "text-red-400"
        : "text-muted-foreground";

  return (
    <div className="border-b border-border bg-card/40 px-4 md:px-6 py-2 flex items-center gap-4 overflow-x-auto custom-scrollbar">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
        Live Market
      </span>
      <div className="flex items-center gap-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-2 shrink-0">
            <SongstatsBrandIcon source={kpi.sourceKey} className={`w-3.5 h-3.5 ${songstatsBrandColor(kpi.sourceKey)}`} />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">{kpi.formatted}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          </div>
        ))}
        {momentum && (
          <div className={`flex items-center gap-1.5 shrink-0 ${momentumColor}`}>
            <MomentumIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {momentum.percent > 0 ? "+" : ""}
              {momentum.percent}% {momentum.window}
            </span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground/70 ml-auto shrink-0 hidden md:inline">
        Source: Songstats
      </span>
    </div>
  );
}
