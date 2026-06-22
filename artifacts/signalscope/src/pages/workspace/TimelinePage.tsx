import { Clock3 } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { EmptyChart } from "@/components/workspace/ChartCard";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { buildIntelligenceTimeline } from "@/lib/timeline";
import { ACCENTS } from "@/lib/intelligence";

export default function TimelinePage() {
  const { segments, analysis } = useTrackWorkspace();
  const entries = buildIntelligenceTimeline(segments, analysis);

  return (
    <WorkspacePage
      id="timeline"
      title="Timeline Intelligence"
      description="A chronological read of this song — time-coded RichSync moments first, then track-level Musixmatch themes, mood, and meaning. Every entry is tagged with its derived signal type and source."
    >
      <IntelligenceCard title="Signal Timeline" icon={Clock3} iconClassName="text-cyan-400">
        {entries.length === 0 ? (
          <EmptyChart />
        ) : (
          <ol className="relative space-y-5 pl-6 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
            {entries.map((e, i) => {
              const accent = ACCENTS[e.accent];
              return (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-background ${accent.bar}`}
                  />
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                      {e.timeLabel}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${accent.border} ${accent.bg} ${accent.text}`}
                    >
                      {e.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{e.source}</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{e.text}</p>
                </li>
              );
            })}
          </ol>
        )}
      </IntelligenceCard>
    </WorkspacePage>
  );
}
