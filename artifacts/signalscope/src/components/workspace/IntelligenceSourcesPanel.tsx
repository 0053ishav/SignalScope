import { INTELLIGENCE_SOURCES } from "@/lib/intelligence";

/**
 * Connection status of every intelligence source. Live sources reflect what
 * this build actually queries; the rest are honest "Coming Soon" partner slots
 * (visual only — no data is fabricated from them).
 */
export default function IntelligenceSourcesPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-2">
      {INTELLIGENCE_SOURCES.map((src) => {
        const Icon = src.icon;
        const connected = src.status === "connected";
        return (
          <div
            key={src.name}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              connected ? "border-border bg-card" : "border-dashed border-border bg-card/40"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                connected ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${connected ? "text-foreground" : "text-muted-foreground"}`}>
                  {src.name}
                </p>
                {connected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Coming Soon
                  </span>
                )}
              </div>
              {!compact && <p className="text-xs text-muted-foreground leading-snug mt-0.5">{src.capability}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
