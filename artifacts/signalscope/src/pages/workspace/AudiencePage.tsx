import { Users } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ReportGate from "@/components/workspace/ReportGate";
import MetricCard from "@/components/workspace/MetricCard";
import EvidenceCard from "@/components/workspace/EvidenceCard";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { EmptyChart } from "@/components/workspace/ChartCard";
import { KPI_META } from "@/lib/intelligence";

const META = KPI_META.find((m) => m.key === "audience")!;

export default function AudiencePage() {
  return (
    <WorkspacePage
      id="audience"
      title="Audience Intelligence"
      description="Who this song is for — the listener archetypes and the source signals that define them."
    >
      <ReportGate>
        {(report) => (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard meta={META} value={report.scores.audience} confidence={report.confidence} />
            </div>

            <IntelligenceCard title="Audience Archetypes" icon={Users}>
              {report.audienceArchetypes.length ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {report.audienceArchetypes.map((a, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl border border-border bg-card">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <span className="text-violet-400 font-bold text-xs">{i + 1}</span>
                      </div>
                      <span className="text-sm text-foreground/90 leading-snug">{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChart />
              )}
            </IntelligenceCard>

            <EvidenceCard
              title="Audience Evidence"
              items={report.evidence.audience}
              accent="violet"
              emptyHint="No audience evidence provided."
            />
          </div>
        )}
      </ReportGate>
    </WorkspacePage>
  );
}
