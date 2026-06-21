import { BarChart3, PlugZap, SearchX, AlertTriangle } from "lucide-react";
import type { SongstatsUiStatus } from "@/types/songstats";

interface Props {
  status: SongstatsUiStatus;
  /** Smaller inline variant for embedding inside an existing card. */
  compact?: boolean;
}

const COPY: Record<
  Exclude<SongstatsUiStatus, "ok" | "loading">,
  { icon: typeof BarChart3; title: string; body: string }
> = {
  unavailable: {
    icon: PlugZap,
    title: "Songstats not connected",
    body: "Live market performance from Songstats isn't connected yet. Add a Songstats API key to surface real streaming, playlist, and creator metrics here — no numbers are estimated in the meantime.",
  },
  empty: {
    icon: SearchX,
    title: "No Songstats data for this track",
    body: "Songstats is connected, but has no performance data for this track yet (often the case for very new or niche releases). Nothing is fabricated to fill the gap.",
  },
  error: {
    icon: AlertTriangle,
    title: "Songstats temporarily unavailable",
    body: "We couldn't reach Songstats just now. The rest of the workspace is unaffected — try again shortly.",
  },
};

export default function SongstatsUnavailable({ status, compact = false }: Props) {
  if (status === "ok" || status === "loading") return null;
  const { icon: Icon, title, body } = COPY[status];

  return (
    <div
      className={`rounded-xl border border-dashed border-border bg-card/40 ${
        compact ? "p-4" : "p-6"
      } flex items-start gap-3`}
    >
      <div className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{body}</p>
      </div>
    </div>
  );
}
