import { HeartHandshake } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ReportGate from "@/components/workspace/ReportGate";
import MetricCard from "@/components/workspace/MetricCard";
import EvidenceCard from "@/components/workspace/EvidenceCard";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { EmptyChart } from "@/components/workspace/ChartCard";
import { KPI_META } from "@/lib/intelligence";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";

const META = KPI_META.find((m) => m.key === "emotion")!;

export default function EmotionalPage() {
  const { analysis } = useTrackWorkspace();
  const moods = analysis?.moods?.main_moods || [];

  return (
    <WorkspacePage
      id="emotional"
      title="Emotional Intelligence"
      description="The emotional register of the song and how it positions against listener feeling."
    >
      <ReportGate>
        {(report) => (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard meta={META} value={report.scores.emotion} confidence={report.confidence} />
            </div>

            <IntelligenceCard title="Emotional Positioning" icon={HeartHandshake} iconClassName="text-pink-400">
              {report.emotionalPositioning.length ? (
                <div className="flex flex-wrap gap-2">
                  {report.emotionalPositioning.map((e, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg border border-pink-500/20 bg-pink-500/5 text-pink-300 text-sm"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyChart />
              )}
            </IntelligenceCard>

            {moods.length > 0 && (
              <IntelligenceCard title="Source Moods" icon={HeartHandshake} iconClassName="text-muted-foreground">
                <p className="text-xs text-muted-foreground mb-3">Detected mood metadata from Musixmatch analysis.</p>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => (
                    <span key={m} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </IntelligenceCard>
            )}

            <EvidenceCard
              title="Emotion Evidence"
              items={report.evidence.emotion}
              accent="pink"
              emptyHint="No emotional evidence provided."
            />
          </div>
        )}
      </ReportGate>
    </WorkspacePage>
  );
}
