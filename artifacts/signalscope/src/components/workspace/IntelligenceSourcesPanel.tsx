import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { deriveSourceHealth, type SourceStatus } from "@/lib/intelligence";

/**
 * Intelligence Health Bar. Every source's status is derived live from workspace
 * context (see `deriveSourceHealth`) — there is no second source of truth and no
 * source is shown as "Connected" unless it genuinely returned data this session.
 */
const STATUS_META: Record<
  SourceStatus,
  { label: string; dot: string; text: string; live: boolean }
> = {
  connected: { label: "Connected", dot: "bg-emerald-400", text: "text-emerald-400", live: true },
  generating: { label: "Generating", dot: "bg-amber-400 animate-pulse", text: "text-amber-400", live: true },
  unavailable: { label: "Unavailable", dot: "bg-rose-400", text: "text-rose-400", live: false },
  "coming-soon": { label: "Coming Soon", dot: "", text: "text-muted-foreground", live: false },
};

export default function IntelligenceSourcesPanel({ compact = false }: { compact?: boolean }) {
  const { reportLoading, reportSource, reportError, songstatsStatus, jambaseStatus, audioStatus, audioAvailable } =
    useTrackWorkspace();

  const sources = deriveSourceHealth({
    reportLoading,
    reportSource,
    reportError,
    songstatsStatus,
    jambaseStatus,
    audioStatus,
    audioAvailable,
  });

  return (
    <div className="space-y-2">
      {sources.map((src) => {
        const Icon = src.icon;
        const meta = STATUS_META[src.status];
        return (
          <div
            key={src.name}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              meta.live ? "border-border bg-card" : "border-dashed border-border bg-card/40"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                meta.live ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${meta.live ? "text-foreground" : "text-muted-foreground"}`}>
                  {src.name}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider shrink-0 ${meta.text}`}
                >
                  {meta.dot && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                  {meta.label}
                </span>
              </div>
              {!compact && <p className="text-xs text-muted-foreground leading-snug mt-0.5">{src.capability}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
