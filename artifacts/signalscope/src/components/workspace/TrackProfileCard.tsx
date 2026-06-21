import { CalendarDays, Disc3, Building2, Tag, ExternalLink } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SafeArtwork from "@/components/workspace/SafeArtwork";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import { artworkCandidates, getReleaseIntelligence } from "@/lib/songstatsMetadata";

const STAGE_STYLES: Record<string, string> = {
  "Fresh Release": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Recent Release": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  "Catalog Track": "text-muted-foreground bg-secondary border-border",
};

/**
 * Identity + catalog metadata for the track — artwork, artists, release
 * intelligence, genres, distributor and label. All fields come from real
 * Songstats data (with a Musixmatch artwork fallback); missing fields are
 * simply omitted, never fabricated.
 */
export default function TrackProfileCard() {
  const { track, songstats, songstatsStatus } = useTrackWorkspace();

  const covers = [
    track.album_coverart_500x500,
    track.album_coverart_350x350,
    track.album_coverart_100x100,
  ];
  const sources = artworkCandidates(songstats, covers);

  const title = songstats?.title || track.track_name;
  const artist = songstats?.artist || track.artist_name;
  const release = getReleaseIntelligence(songstats?.releaseDate);
  const genres = songstats?.genres ?? [];
  const distributors = songstats?.distributors ?? [];
  const labels = songstats?.labels ?? [];

  return (
    <IntelligenceCard title="Track Profile" icon={Disc3} iconClassName="text-violet-400">
      <div className="flex gap-4">
        <SafeArtwork
          sources={sources}
          alt={title}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg border border-border shrink-0"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground truncate">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{artist}</p>

          {songstats?.isRemix && (
            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
              Remix
            </span>
          )}

          {release && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                {release.formatted}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  STAGE_STYLES[release.stage] ?? STAGE_STYLES["Catalog Track"]
                }`}
              >
                {release.stage}
              </span>
            </div>
          )}

          {songstats?.siteUrl && (
            <a
              href={songstats.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Songstats
            </a>
          )}
        </div>
      </div>

      {genres.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Genres
          </p>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((g) => (
              <span key={g} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {(distributors.length > 0 || labels.length > 0) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {distributors.length > 0 && (
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Distributor
              </p>
              <p className="text-sm text-foreground">{distributors.join(", ")}</p>
            </div>
          )}
          {labels.length > 0 && (
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Label
              </p>
              <p className="text-sm text-foreground">{labels.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {songstatsStatus !== "ok" && (
        <div className="mt-4">
          <SongstatsUnavailable status={songstatsStatus} compact />
        </div>
      )}
    </IntelligenceCard>
  );
}
