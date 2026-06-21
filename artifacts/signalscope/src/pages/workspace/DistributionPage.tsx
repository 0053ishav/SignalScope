import { Share2 } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ReportGate from "@/components/workspace/ReportGate";
import MetricCard from "@/components/workspace/MetricCard";
import ChartCard from "@/components/workspace/ChartCard";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import PlatformCard from "@/components/workspace/PlatformCard";
import SourceAttribution from "@/components/workspace/SourceAttribution";
import PlatformFitBar from "@/components/workspace/charts/PlatformFitBar";
import { EmptyChart } from "@/components/workspace/ChartCard";
import { KPI_META } from "@/lib/intelligence";

const META = KPI_META.find((m) => m.key === "growth")!;

export default function DistributionPage() {
  return (
    <WorkspacePage
      id="distribution"
      title="Distribution Intelligence"
      description="Where this song belongs — platform fit scores and the rationale behind each channel."
    >
      <ReportGate>
        {(report) => (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard meta={META} value={report.scores.growth} confidence={report.confidence} />
            </div>

            <ChartCard title="Platform Fit" subtitle="Relative fit across distribution channels" className="h-64">
              <PlatformFitBar platformFit={report.platformFit} />
            </ChartCard>

            <IntelligenceCard title="Platform Rationale" icon={Share2}>
              {report.platformFit.length ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {report.platformFit.map((p, i) => (
                    <PlatformCard key={i} fit={p} />
                  ))}
                </div>
              ) : (
                <EmptyChart />
              )}
            </IntelligenceCard>

            <SourceAttribution section="distribution" />
          </div>
        )}
      </ReportGate>
    </WorkspacePage>
  );
}
