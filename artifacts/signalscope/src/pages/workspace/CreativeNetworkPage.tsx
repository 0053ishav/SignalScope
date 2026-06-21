import { Users, Music2, PenLine, SlidersHorizontal, Wrench } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { groupCredits, creditInsights } from "@/lib/songstatsMetadata";

const INSIGHTS = [
  { key: "totalContributors", label: "Contributors", icon: Users, color: "text-violet-400" },
  { key: "producers", label: "Producers", icon: SlidersHorizontal, color: "text-cyan-400" },
  { key: "songwriters", label: "Songwriters", icon: PenLine, color: "text-amber-400" },
  { key: "engineers", label: "Engineers", icon: Wrench, color: "text-emerald-400" },
] as const;

export default function CreativeNetworkPage() {
  const { songstats, songstatsStatus } = useTrackWorkspace();

  const groups = groupCredits(songstats);
  const insights = creditInsights(songstats);
  const hasCredits = songstatsStatus === "ok" && groups.length > 0;

  return (
    <WorkspacePage
      id="credits"
      title="Creative Network"
      description="The people behind the record — songwriters, producers, engineers and performers, sourced from real Songstats catalog credits."
    >
      {!hasCredits ? (
        songstatsStatus === "ok" ? (
          <IntelligenceCard title="Creative Credits" icon={Users}>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Music2 className="w-4 h-4 shrink-0" />
              Songstats returned no catalog credits for this track yet. Nothing is inferred to fill the gap.
            </div>
          </IntelligenceCard>
        ) : (
          <SongstatsUnavailable status={songstatsStatus} />
        )
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {INSIGHTS.map((m) => (
              <div key={m.key} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{insights[m.key]}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <IntelligenceCard key={group.label} title={group.label} icon={Users}>
                <ul className="space-y-2.5">
                  {group.people.map((person) => (
                    <li key={`${person.id ?? person.name}`} className="flex items-start justify-between gap-3">
                      <span className="text-sm text-foreground">{person.name}</span>
                      {person.roles.length > 0 && (
                        <span className="text-[11px] text-muted-foreground text-right shrink-0 max-w-[55%]">
                          {person.roles.join(", ")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </IntelligenceCard>
            ))}
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}
