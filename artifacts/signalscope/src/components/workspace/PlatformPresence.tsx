import { Globe2, ExternalLink, Radio } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import SongstatsBrandIcon, { songstatsBrandColor } from "./SongstatsBrandIcon";
import { orderedLinks, platformReach, openTrackLinks } from "@/lib/songstatsMetadata";

/**
 * Marketplace footprint — the real, verifiable platforms this track is present
 * on (deduped Songstats links). Shows a reach count, quick-open shortcuts for
 * the major streaming/social channels, and a full grid of platform links. Every
 * entry is a real returned URL; nothing is fabricated.
 */
export default function PlatformPresence() {
  const { songstats, songstatsStatus } = useTrackWorkspace();

  if (songstatsStatus !== "ok" || !songstats) {
    return (
      <IntelligenceCard title="Marketplace Footprint" icon={Globe2}>
        <SongstatsUnavailable status={songstatsStatus} compact />
      </IntelligenceCard>
    );
  }

  const links = orderedLinks(songstats);
  const reach = platformReach(songstats);
  const quickOpen = openTrackLinks(songstats);

  if (links.length === 0) {
    return (
      <IntelligenceCard title="Marketplace Footprint" icon={Globe2}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Radio className="w-4 h-4 shrink-0" />
          No platform links returned by Songstats for this track yet.
        </div>
      </IntelligenceCard>
    );
  }

  return (
    <IntelligenceCard title="Marketplace Footprint" icon={Globe2} iconClassName="text-cyan-400">
      <div className="flex items-baseline gap-2 -mt-1 mb-4">
        <span className="text-3xl font-bold text-foreground">{reach}</span>
        <span className="text-sm text-muted-foreground">
          platform{reach === 1 ? "" : "s"} with a verified listing
        </span>
      </div>

      {quickOpen.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quickOpen.map((l) => (
            <a
              key={l.source}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card/40 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <SongstatsBrandIcon source={l.source} className={`w-3.5 h-3.5 ${songstatsBrandColor(l.source)}`} />
              {l.label}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {links.map((l) => (
          <a
            key={l.source}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/40 hover:bg-secondary hover:border-primary/30 transition-colors"
          >
            <SongstatsBrandIcon source={l.source} className={`w-4 h-4 shrink-0 ${songstatsBrandColor(l.source)}`} />
            <span className="text-sm text-foreground truncate flex-1">{l.label}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </a>
        ))}
      </div>
    </IntelligenceCard>
  );
}
