import { ShieldCheck } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ReportGate from "@/components/workspace/ReportGate";
import EvidenceCard from "@/components/workspace/EvidenceCard";
import RichSyncTimeline from "@/components/workspace/RichSyncTimeline";

export default function EvidencePage() {
  return (
    <WorkspacePage
      id="evidence"
      title="Evidence Layer"
      description="Every conclusion in this workspace is grounded in the source signals below — derived from Musixmatch metadata, mood & theme analysis, and RichSync moments."
    >
      <ReportGate>
        {(report) => (
          <div className="space-y-6">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-foreground/90">
                Analysis confidence is <span className="font-semibold text-emerald-400">{report.confidence}%</span>,
                grounded in the evidence below.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <EvidenceCard
                title="Audience"
                items={report.evidence.audience}
                accent="violet"
                emptyHint="No evidence provided."
              />
              <EvidenceCard
                title="Emotion"
                items={report.evidence.emotion}
                accent="pink"
                emptyHint="No evidence provided."
              />
              <EvidenceCard
                title="Culture"
                items={report.evidence.culture}
                accent="cyan"
                emptyHint="No evidence provided."
              />
            </div>

            <RichSyncTimeline />
          </div>
        )}
      </ReportGate>
    </WorkspacePage>
  );
}
