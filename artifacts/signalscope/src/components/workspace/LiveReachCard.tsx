import { MapPinned, MapPin, Globe2, Building2, Ticket } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import JamBaseUnavailable from "@/components/workspace/JamBaseUnavailable";
import { formatCompactNumber } from "@/lib/jambase";

/**
 * Live Reach — the artist's PHYSICAL distribution footprint (touring), shown
 * alongside the digital "Platform Reach". Every figure is a real JamBase metric
 * for the current artist; nothing is fabricated. Honest unavailable/empty states
 * mirror the rest of the workspace.
 */
export default function LiveReachCard() {
  const { jambase, jambaseStatus } = useTrackWorkspace();

  if (jambaseStatus !== "ok" || !jambase) {
    return (
      <IntelligenceCard title="Live Reach" icon={MapPinned}>
        <JamBaseUnavailable status={jambaseStatus} compact />
      </IntelligenceCard>
    );
  }

  const stats = [
    { icon: Ticket, label: "Upcoming Shows", value: jambase.upcomingEventCount },
    { icon: Building2, label: "Venues", value: jambase.venueCount },
    { icon: MapPin, label: "Cities", value: jambase.cityCount },
    { icon: Globe2, label: "Countries", value: jambase.countryCount },
  ].filter((s) => s.value > 0);

  return (
    <IntelligenceCard title="Live Reach" icon={MapPinned} iconClassName="text-cyan-400">
      <p className="text-xs text-muted-foreground -mt-1 mb-3">
        Physical distribution footprint — real upcoming touring geography from JamBase, alongside the
        digital platform reach above.
      </p>
      {stats.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-lg border border-border bg-card/40 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-lg font-bold text-foreground">{formatCompactNumber(s.value)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          JamBase returned no upcoming touring geography for this artist.
        </p>
      )}
    </IntelligenceCard>
  );
}
