import { Users, MapPin, ExternalLink, Tag } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import SafeArtwork from "@/components/workspace/SafeArtwork";
import SongstatsUnavailable from "@/components/workspace/SongstatsUnavailable";
import SongstatsBrandIcon, { songstatsBrandColor } from "./SongstatsBrandIcon";
import { formatCompactNumber } from "@/lib/songstats";
import { primaryArtists, artistLinks } from "@/lib/songstatsMetadata";
import type { SongstatsArtist } from "@/types/songstats";

const REGION_NAMES =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryName(code: string): string {
  const upper = code.trim().toUpperCase();
  if (upper.length !== 2) return code;
  try {
    return REGION_NAMES?.of(upper) ?? code;
  } catch {
    return code;
  }
}

/**
 * One primary artist — avatar, identity, real follower/listener reach per
 * platform, and verified social/streaming links. Every field is real Songstats
 * data; missing fields are simply omitted (never fabricated).
 */
function ArtistRow({ artist }: { artist: SongstatsArtist }) {
  const links = artistLinks(artist);
  const reach = (artist.reach ?? []).slice(0, 8);
  const genres = artist.genres ?? [];

  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <div className="flex gap-4">
        <SafeArtwork
          sources={artist.avatarUrl ? [artist.avatarUrl] : []}
          alt={artist.name}
          className="w-16 h-16 rounded-full border border-border shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-base font-bold tracking-tight text-foreground truncate">{artist.name}</h4>
              {artist.country && (
                <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {countryName(artist.country)}
                </p>
              )}
            </div>
            {artist.siteUrl && (
              <a
                href={artist.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Profile
              </a>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {genres.slice(0, 4).map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px]">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {reach.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {reach.map((r) => (
            <div
              key={`${r.source}-${r.metricKey}`}
              className="rounded-lg border border-border bg-background/40 p-2.5"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <SongstatsBrandIcon source={r.source} className={`w-3.5 h-3.5 ${songstatsBrandColor(r.source)}`} />
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground truncate">
                  {r.label}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground leading-none">{formatCompactNumber(r.value)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{r.metricLabel}</p>
            </div>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.source}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <SongstatsBrandIcon source={l.source} className={`w-3.5 h-3.5 ${songstatsBrandColor(l.source)}`} />
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Artist Footprint — the real primary artists behind this track, with their
 * audience reach and verified profiles. Driven entirely by Songstats artist
 * data; honest empty/unavailable states match the other metadata cards.
 */
export default function ArtistPanel() {
  const { songstats, songstatsStatus } = useTrackWorkspace();

  if (songstatsStatus !== "ok" || !songstats) {
    return (
      <IntelligenceCard title="Artist Footprint" icon={Users}>
        <SongstatsUnavailable status={songstatsStatus} compact />
      </IntelligenceCard>
    );
  }

  const artists = primaryArtists(songstats);

  if (artists.length === 0) {
    return (
      <IntelligenceCard title="Artist Footprint" icon={Users}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Users className="w-4 h-4 shrink-0" />
          No artist profile data returned by Songstats for this track yet.
        </div>
      </IntelligenceCard>
    );
  }

  return (
    <IntelligenceCard title="Artist Footprint" icon={Users} iconClassName="text-fuchsia-400">
      <p className="text-sm text-muted-foreground -mt-1 mb-4">
        Audience reach and verified profiles for the {artists.length === 1 ? "artist" : "artists"} behind this track.
      </p>
      <div className="space-y-3">
        {artists.map((artist) => (
          <ArtistRow key={artist.id} artist={artist} />
        ))}
      </div>
    </IntelligenceCard>
  );
}
