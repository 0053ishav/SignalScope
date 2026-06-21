import {
  TrendingUp,
  TrendingDown,
  Minus,
  Globe2,
  Radio,
  Sparkles,
  Loader2,
} from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { EmptyChart } from "@/components/workspace/ChartCard";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import SongstatsBrandIcon, { songstatsBrandColor } from "@/components/workspace/SongstatsBrandIcon";
import PredictionVsPerformance from "@/components/workspace/PredictionVsPerformance";
import MarketPulse from "@/components/workspace/MarketPulse";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import {
  buildHeadlineKpis,
  getMomentumReading,
  topMarkets,
  formatCompactNumber,
} from "@/lib/songstats";
import type { SongstatsSignalCategory } from "@/types/songstats";

const CATEGORY_COLOR: Record<SongstatsSignalCategory, string> = {
  momentum: "text-emerald-400",
  discovery: "text-violet-400",
  creator: "text-pink-400",
  reach: "text-cyan-400",
  consumption: "text-amber-400",
};

export default function PerformancePage() {
  const { songstats, songstatsSignals, songstatsStatus } = useTrackWorkspace();

  return (
    <WorkspacePage
      id="performance"
      title="Performance Intelligence"
      description="Real streaming, playlist, creator, and market performance from Songstats — shown only when Songstats returns it. No numbers are estimated."
    >
      {songstatsStatus === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading Songstats market performance…</span>
        </div>
      )}

      {songstatsStatus !== "loading" && (songstatsStatus !== "ok" || !songstats) && (
        <SongstatsUnavailable status={songstatsStatus} />
      )}

      {songstatsStatus === "ok" && songstats && (
        <PerformanceBody data={songstats} signals={songstatsSignals?.signals ?? []} />
      )}
    </WorkspacePage>
  );
}

function PerformanceBody({
  data,
  signals,
}: {
  data: import("@/types/songstats").SongstatsTrackData;
  signals: import("@/types/songstats").SongstatsSignal[];
}) {
  const kpis = buildHeadlineKpis(data);
  const momentum = getMomentumReading(data);
  const markets = topMarkets(data);
  const maxMarket = markets.length ? Math.max(...markets.map((m) => m.value)) : 0;

  const MomentumIcon =
    momentum?.direction === "up" ? TrendingUp : momentum?.direction === "down" ? TrendingDown : Minus;
  const momentumColor =
    momentum?.direction === "up"
      ? "text-emerald-400"
      : momentum?.direction === "down"
        ? "text-red-400"
        : "text-muted-foreground";

  return (
    <div className="space-y-8">
      <p className="text-[11px] text-muted-foreground">
        Source: <span className="font-medium text-foreground/80">Songstats</span>
        {data.lastUpdated && <> · updated {new Date(data.lastUpdated).toLocaleDateString()}</>}
      </p>

      {/* Headline KPIs */}
      {kpis.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <SongstatsBrandIcon source={kpi.sourceKey} className={`w-4 h-4 ${songstatsBrandColor(kpi.sourceKey)}`} />
                <span className="text-[11px] text-muted-foreground">{kpi.source}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{kpi.formatted}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <IntelligenceCard title="Headline Metrics" icon={TrendingUp}>
          <EmptyChart />
          <p className="text-xs text-muted-foreground mt-2">
            Songstats returned no headline metrics for this track.
          </p>
        </IntelligenceCard>
      )}

      {/* Momentum */}
      {momentum && (
        <IntelligenceCard title="Momentum" icon={TrendingUp} iconClassName={momentumColor}>
          <div className="flex items-center gap-3">
            <MomentumIcon className={`w-6 h-6 ${momentumColor}`} />
            <div>
              <div className={`text-xl font-bold ${momentumColor}`}>
                {momentum.percent > 0 ? "+" : ""}
                {momentum.percent}%
              </div>
              <div className="text-xs text-muted-foreground">
                {momentum.label} · {momentum.metric} ({momentum.window})
              </div>
            </div>
          </div>
        </IntelligenceCard>
      )}

      {/* Per-platform breakdown */}
      {data.platforms.length > 0 && (
        <IntelligenceCard title="Platform Performance" icon={Radio}>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.platforms.map((p) => (
              <div key={p.source} className="rounded-lg border border-border bg-card/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <SongstatsBrandIcon source={p.source} className={`w-4 h-4 ${songstatsBrandColor(p.source)}`} />
                  <span className="text-sm font-medium text-foreground">{p.label}</span>
                </div>
                <div className="space-y-1">
                  {p.metrics.map((m) => (
                    <div key={m.key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-medium text-foreground">{formatCompactNumber(m.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </IntelligenceCard>
      )}

      {/* Interpretive signals */}
      {signals.length > 0 && (
        <IntelligenceCard title="Market Signals" icon={Sparkles} iconClassName="text-violet-400">
          <p className="text-xs text-muted-foreground -mt-1 mb-3">
            Plain-language readings derived directly from Songstats metrics.
          </p>
          <div className="space-y-2.5">
            {signals.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/40">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${CATEGORY_COLOR[s.category].replace("text-", "bg-")}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                    <span className={`text-[10px] uppercase tracking-wide ${CATEGORY_COLOR[s.category]}`}>
                      {s.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </IntelligenceCard>
      )}

      {/* Top markets */}
      {markets.length > 0 && (
        <IntelligenceCard title="Top Markets" icon={Globe2} iconClassName="text-cyan-400">
          <div className="space-y-2.5">
            {markets.map((m) => (
              <div key={m.country} className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-12 shrink-0">{m.country}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-cyan-400/70 rounded-full"
                    style={{ width: `${maxMarket ? (m.value / maxMarket) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                  {formatCompactNumber(m.value)}
                </span>
              </div>
            ))}
          </div>
        </IntelligenceCard>
      )}

      {/* Reconciliation with AI predictions */}
      <MarketPulse />
      <PredictionVsPerformance />
    </div>
  );
}
