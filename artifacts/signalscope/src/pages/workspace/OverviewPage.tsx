import { BrainCircuit, Lightbulb, Target } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ReportGate from "@/components/workspace/ReportGate";
import MarketHighlights from "@/components/workspace/MarketHighlights";
import TrackProfileCard from "@/components/workspace/TrackProfileCard";
import PlatformPresence from "@/components/workspace/PlatformPresence";
import ArtistPanel from "@/components/workspace/ArtistPanel";
import MetricCard from "@/components/workspace/MetricCard";
import ChartCard, { EmptyChart } from "@/components/workspace/ChartCard";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import ConfidenceDrivers from "@/components/workspace/ConfidenceDrivers";
import ScoreRadar from "@/components/workspace/charts/ScoreRadar";
import ConfidenceGauge from "@/components/workspace/charts/ConfidenceGauge";
import SignalDistributionDonut from "@/components/workspace/charts/SignalDistributionDonut";
import { KPI_META } from "@/lib/intelligence";

export default function OverviewPage() {
  return (
    <WorkspacePage
      id="overview"
      title="Overview"
      description="Executive briefing and headline scores synthesized from this song's lyrics, mood, and cultural signals."
    >
      <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-4">
        <TrackProfileCard />
        <PlatformPresence />
      </div>

      <ArtistPanel />

      <ReportGate>
        {(report) => (
          <div className="space-y-8">
            <IntelligenceCard title="Executive Briefing" icon={BrainCircuit}>
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed">{report.summary}</p>
            </IntelligenceCard>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {KPI_META.map((meta) => (
                <MetricCard
                  key={meta.key}
                  meta={meta}
                  value={report.scores[meta.key]}
                  confidence={report.confidence}
                />
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <ChartCard title="Signal Profile" subtitle="Four-axis intelligence radar">
                <ScoreRadar scores={report.scores} />
              </ChartCard>
              <ChartCard title="Confidence" subtitle="Overall analysis certainty">
                <ConfidenceGauge confidence={report.confidence} />
              </ChartCard>
              <ChartCard title="Signal Distribution" subtitle="Detected signal volume" className="h-52 flex flex-col">
                <SignalDistributionDonut report={report} />
              </ChartCard>
            </div>

            <ConfidenceDrivers />

            <div className="grid lg:grid-cols-2 gap-4">
              <IntelligenceCard title="Key Opportunities" icon={Lightbulb} iconClassName="text-amber-400">
                {report.growthRecommendations.length ? (
                  <ul className="space-y-2.5">
                    {report.growthRecommendations.map((g, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span className="leading-relaxed">{g}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyChart />
                )}
              </IntelligenceCard>

              <IntelligenceCard title="Quick Actions" icon={Target}>
                {report.artistActions.length ? (
                  <div className="space-y-2.5">
                    {report.artistActions.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-xs">{i + 1}</span>
                        </div>
                        <span className="text-sm text-foreground/90">{a}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyChart />
                )}
              </IntelligenceCard>
            </div>
          </div>
        )}
      </ReportGate>

        <MarketHighlights />
      </div>
    </WorkspacePage>
  );
}
