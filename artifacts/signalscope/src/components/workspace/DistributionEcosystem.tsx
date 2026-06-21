import { Network, Check } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import SongstatsBrandIcon, { songstatsBrandColor } from "./SongstatsBrandIcon";
import { distributionEcosystem } from "@/lib/songstatsMetadata";

/**
 * Distribution ecosystem — for each canonical platform, whether this track has
 * a real verified Songstats link (Connected) or not (Not detected). Connected
 * states reflect actual returned links only; absent ones are shown honestly as
 * undetected rather than implying presence.
 */
export default function DistributionEcosystem() {
  const { songstats, songstatsStatus } = useTrackWorkspace();

  if (songstatsStatus !== "ok" || !songstats) {
    return (
      <IntelligenceCard title="Distribution Ecosystem" icon={Network}>
        <SongstatsUnavailable status={songstatsStatus} compact />
      </IntelligenceCard>
    );
  }

  const slots = distributionEcosystem(songstats);
  const connected = slots.filter((s) => s.connected).length;

  return (
    <IntelligenceCard title="Distribution Ecosystem" icon={Network} iconClassName="text-emerald-400">
      <p className="text-xs text-muted-foreground -mt-1 mb-3">
        {connected} of {slots.length} tracked channels have a verified listing — from real Songstats links.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {slots.map((slot) => {
          const inner = (
            <>
              <SongstatsBrandIcon
                source={slot.source}
                className={`w-4 h-4 shrink-0 ${slot.connected ? songstatsBrandColor(slot.source) : "text-muted-foreground/40"}`}
              />
              <span className={`text-sm flex-1 truncate ${slot.connected ? "text-foreground" : "text-muted-foreground/60"}`}>
                {slot.label}
              </span>
              {slot.connected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <Check className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                  Not detected
                </span>
              )}
            </>
          );

          const base =
            "flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors";
          return slot.connected && slot.url ? (
            <a
              key={slot.source}
              href={slot.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${base} border-border bg-card/40 hover:bg-secondary hover:border-primary/30`}
            >
              {inner}
            </a>
          ) : (
            <div key={slot.source} className={`${base} border-dashed border-border/60 bg-card/20`}>
              {inner}
            </div>
          );
        })}
      </div>
    </IntelligenceCard>
  );
}
