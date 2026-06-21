import { Clock } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { extractRichSyncSignals, ACCENTS } from "@/lib/intelligence";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * RichSync Intelligence Timeline — surfaces the most signal-dense lyric moments
 * from real RichSync timing, tagged by the same identity/emotional/narrative
 * heuristic the backend uses. No moment is shown unless it genuinely matches.
 */
export default function RichSyncTimeline() {
  const { segments } = useTrackWorkspace();
  const signals = extractRichSyncSignals(segments);

  if (signals.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">RichSync Intelligence Timeline</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No time-coded RichSync moments are available for this track, so a signal timeline cannot be derived.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">RichSync Intelligence Timeline</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        The {signals.length} most signal-dense moments, tagged by detected lyrical signal type.
      </p>

      <div className="relative pl-5">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
        <div className="space-y-4">
          {signals.map((sig, i) => {
            const a = ACCENTS[sig.accent];
            return (
              <div key={i} className="relative">
                <span className={`absolute -left-[15px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ${a.text}`} style={{ backgroundColor: "currentColor" }} />
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{formatTime(sig.time)}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${a.border} ${a.bg} ${a.text}`}>
                    {sig.signal}
                  </span>
                </div>
                <p className={`text-sm text-foreground/90 border-l-2 ${a.bar} pl-3 py-0.5`}>{sig.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
