import { Activity } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import SongstatsBrandIcon, { songstatsBrandColor } from "./SongstatsBrandIcon";
import { formatCompactNumber } from "@/lib/songstats";

/**
 * Observed per-platform performance from Songstats, shown alongside the AI's
 * predicted platform fit on the Distribution page. Real metrics only; degrades
 * to an honest note when Songstats has nothing.
 */
export default function ObservedPlatformPerformance() {
  const { songstats, songstatsStatus } = useTrackWorkspace();

  if (songstatsStatus === "loading") return null;

  if (songstatsStatus !== "ok" || !songstats) {
    return (
      <IntelligenceCard title="Observed Platform Performance" icon={Activity}>
        <SongstatsUnavailable status={songstatsStatus} compact />
      </IntelligenceCard>
    );
  }

  if (songstats.platforms.length === 0) return null;

  return (
    <IntelligenceCard title="Observed Platform Performance" icon={Activity} iconClassName="text-cyan-400">
      <p className="text-xs text-muted-foreground -mt-1 mb-3">
        What's actually happening on each platform, per Songstats — to compare against the predicted fit above.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {songstats.platforms.map((p) => (
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
  );
}
