import { Globe } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ReportGate from "@/components/workspace/ReportGate";
import EvidenceCard from "@/components/workspace/EvidenceCard";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SourceAttribution from "@/components/workspace/SourceAttribution";
import { EmptyChart } from "@/components/workspace/ChartCard";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";

export default function CulturalPage() {
  const { analysis } = useTrackWorkspace();
  const themes = analysis?.themes?.main_themes || [];

  return (
    <WorkspacePage
      id="cultural"
      title="Cultural Intelligence"
      description="How the song situates within broader cultural moments, scenes, and conversations."
    >
      <ReportGate>
        {(report) => (
          <div className="space-y-8">
            <IntelligenceCard title="Cultural Positioning" icon={Globe} iconClassName="text-cyan-400">
              {report.culturalPositioning.length ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {report.culturalPositioning.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                      <span className="text-sm text-foreground/90 leading-snug">{c}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyChart />
              )}
            </IntelligenceCard>

            {themes.length > 0 && (
              <IntelligenceCard title="Source Themes" icon={Globe} iconClassName="text-muted-foreground">
                <p className="text-xs text-muted-foreground mb-3">Detected lyrical themes from Musixmatch analysis.</p>
                <div className="space-y-3">
                  {themes.map((t) => (
                    <div key={t.theme} className="rounded-xl border border-border bg-card p-3">
                      <p className="text-sm font-medium text-foreground mb-1.5">{t.theme}</p>
                      {t.quotes?.length > 0 && (
                        <ul className="space-y-1">
                          {t.quotes.map((q, i) => (
                            <li key={i} className="text-xs text-muted-foreground border-l-2 border-border pl-2.5 py-0.5">
                              {q}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </IntelligenceCard>
            )}

            <EvidenceCard
              title="Cultural Evidence"
              items={report.evidence.culture}
              accent="cyan"
              emptyHint="No cultural evidence provided."
            />

            <SourceAttribution section="culture" />
          </div>
        )}
      </ReportGate>
    </WorkspacePage>
  );
}
