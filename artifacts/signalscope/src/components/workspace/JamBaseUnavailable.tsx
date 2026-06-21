import { MapPinned, PlugZap, CalendarX, AlertTriangle } from "lucide-react";
import type { JamBaseUiStatus } from "@/types/jambase";

interface Props {
  status: JamBaseUiStatus;
  /** Smaller inline variant for embedding inside an existing card. */
  compact?: boolean;
}

const COPY: Record<
  Exclude<JamBaseUiStatus, "ok" | "loading">,
  { icon: typeof MapPinned; title: string; body: string }
> = {
  unavailable: {
    icon: PlugZap,
    title: "JamBase not connected",
    body: "Live touring intelligence from JamBase isn't connected yet. Add a JamBase API key to surface real upcoming shows, venues, and tour geography here — no events are estimated in the meantime.",
  },
  empty: {
    icon: CalendarX,
    title: "No upcoming live event data available.",
    body: "JamBase is connected, but has no upcoming events for this artist right now. Nothing is fabricated to fill the gap.",
  },
  error: {
    icon: AlertTriangle,
    title: "JamBase temporarily unavailable",
    body: "We couldn't reach JamBase just now. The rest of the workspace is unaffected — try again shortly.",
  },
};

export default function JamBaseUnavailable({ status, compact = false }: Props) {
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
