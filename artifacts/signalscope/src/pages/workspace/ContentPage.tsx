import { Zap, Sparkles } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ReportGate from "@/components/workspace/ReportGate";
import MetricCard from "@/components/workspace/MetricCard";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { EmptyChart } from "@/components/workspace/ChartCard";
import { KPI_META } from "@/lib/intelligence";

const META = KPI_META.find((m) => m.key === "virality")!;

export default function ContentPage() {
  return (
    <WorkspacePage
      id="content"
      title="Content Intelligence"
      description="Viral drivers and content angles for short-form, creators, and campaign planning."
    >
      <ReportGate>
        {(report) => (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard meta={META} value={report.scores.virality} confidence={report.confidence} />
            </div>

            <IntelligenceCard title="Viral Drivers" icon={Zap} iconClassName="text-amber-400">
              {report.viralDrivers.length ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {report.viralDrivers.map((v, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90 leading-snug">{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChart />
              )}
            </IntelligenceCard>

            <IntelligenceCard title="Content Opportunities" icon={Sparkles}>
              {report.contentOpportunities.length ? (
                <ul className="space-y-2.5">
                  {report.contentOpportunities.map((c, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyChart />
              )}
            </IntelligenceCard>
          </div>
        )}
      </ReportGate>
    </WorkspacePage>
  );
}
