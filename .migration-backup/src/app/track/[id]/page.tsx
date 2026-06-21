import Image from "next/image";
import Link from "next/link";

import {
  getAnalysis,
  getLyrics,
  getRichSync,
  getTrack,
} from "@/services/musixmatch";
import { classes } from "@/theme";
import { TrackDetails, LyricsResponse, AnalysisResponse } from "@/types/music";
import InfoItem from "@/components/ui/InfoItem";
import LyricsPanel from "@/components/LyricsPanel";
import { parseRichSync } from "@/lib/richsync/parseRichSync";
import { normalizeRichSync } from "@/lib/richsync/normalizeRichSync";
import SignalScopeIntelligence from "@/components/SignalScopeIntelligence";
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackPage({ params }: PageProps) {
  const { id } = await params;

  let track: TrackDetails | null = null;
  let lyrics: LyricsResponse | null = null;
  let richsync = null;
  let analysis: AnalysisResponse | null = null;
  try {
    track = await getTrack(id);
    lyrics = track.commontrack_id
      ? await getLyrics(String(track.commontrack_id))
      : null;

    if (track.commontrack_id) {
      richsync = await getRichSync(String(track.commontrack_id));
      analysis = await getAnalysis(String(track.commontrack_id));
    }
  } catch (error) {
    console.error("Track page error:", error);
  }

  if (!track) {
    return (
      <main className={classes.page}>
        <div className={classes.card}>
          <h1 className="text-2xl font-bold">Failed to load track</h1>

          <p className="text-gray-500 mt-2">Please try again later.</p>
        </div>
      </main>
    );
  }
  const genres = track.primary_genres?.music_genre_list
    ?.map((genre) => genre.music_genre.music_genre_name)
    .join(", ");

  const coverArt =
    track.album_coverart_800x800 ||
    track.album_coverart_500x500 ||
    track.album_coverart_350x350 ||
    track.album_coverart_100x100;

  const hasArtwork = coverArt && !coverArt.includes("nocover.png");
const duration =
  track.track_length > 0
    ? `${Math.floor(
        track.track_length / 60
      )}:${(
        track.track_length % 60
      )
        .toString()
        .padStart(2, "0")}`
    : null;

  const richsyncLines = richsync?.richsync_body
    ? parseRichSync(richsync.richsync_body)
    : [];

  const segments = normalizeRichSync(richsyncLines);

  return (
    <main className={classes.page}>
      <Link href="/" className={classes.link}>
        ← Back to Search
      </Link>

      <div className="mb-8 mt-4">
        <p className="text-sm font-medium text-violet-400">
          Track Intelligence Report
        </p>

        <h1 className="mt-2 text-5xl font-bold">{track.track_name}</h1>

        <p className="mt-2 text-xl text-muted">{track.artist_name}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {genres && <span className={classes.badge}>{genres}</span>}

          <span className={classes.badge}>Rating {track.track_rating}</span>

          {duration && <span className={classes.badge}>{duration}</span>}

          <span className={classes.badge}>
            {track.num_favourite.toLocaleString()} Favorites
          </span>
        </div>
      </div>

      <div className={classes.card}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-87.5 shrink-0 space-y-6">
              {hasArtwork ? (
                <Image
                  src={coverArt}
                  alt={track.track_name}
                  width={350}
                  height={350}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-87.5 h-87.5 border rounded-lg flex items-center justify-center text-gray-400">
                  No Artwork
                </div>
              )}

              <LyricsPanel
                lyrics={lyrics?.lyrics_body}
                language={lyrics?.lyrics_language}
                translations={
                  track.track_lyrics_translation_status?.map((t) => t.to) ?? []
                }
                segments={segments}
                commontrackId={String(track.commontrack_id)}
              />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="mb-4 text-xl font-semibold">Track Overview</h3>
            <div className={classes.grid}>
              <InfoItem label="Album" value={track.album_name} />

              <InfoItem label="Genres" value={genres || "Unknown"} />

              <InfoItem label="Track Rating" value={track.track_rating} />

          {duration && <InfoItem label="Duration" value={duration} />}

              <InfoItem
                label="Favorites"
                value={track.num_favourite.toLocaleString()}
              />

              <InfoItem
                label="Lyrics"
                value={track.has_lyrics ? "Available" : "Unavailable"}
              />

              <InfoItem
                label="Explicit"
                value={track.explicit ? "Yes" : "No"}
              />

              <InfoItem
                label="Instrumental"
                value={track.instrumental ? "Yes" : "No"}
              />
            </div>

            <div className="my-10 h-px bg-border" />

            {analysis && (
              <>
                <SignalScopeIntelligence
                  track={track}
                  lyrics={lyrics}
                  richSync={richsync}
                  analysis={analysis}
                />
                <div className="my-10 h-px bg-border" />
              </>
            )}

            <div className="my-10">
              <h3 className="text-xl font-semibold">
                Example Intelligence Output
              </h3>

              <p className="mt-2 text-sm text-muted">
                Demonstration only. Not generated from this track.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm text-muted">Audience Archetype</p>

                  <p className="mt-2 font-medium">Punjabi Diaspora</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm text-muted">Emotional Positioning</p>

                  <p className="mt-2 font-medium">Confidence & Ambition</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm text-muted">Cultural Resonance</p>

                  <p className="mt-2 font-medium">Community Identity</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm text-muted">Platform Fit</p>

                  <p className="mt-2 font-medium">Instagram Reels</p>
                </div>
              </div>
            </div>

            <div className="my-10 h-px bg-border" />

            {track.track_lyrics_translation_status?.length ? (
              <div className="mt-8">
                <p className={classes.infoLabel}>Available Translations</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {track.track_lyrics_translation_status.map((translation) => (
                    <span key={translation.to} className={classes.badge}>
                      {translation.to}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {track.track_share_url && (
              <div className="mt-8">
                <a
                  href={track.track_share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border rounded-lg px-4 py-2  hover:bg-violet-500"
                >
                  View on Musixmatch
                </a>
              </div>
            )}

            <div className="my-10 h-px bg-border" />

            <div className="mt-10 rounded-3xl border border-border bg-card p-6">
              <h3 className="text-xl font-semibold">
                Lyrics Intelligence Pipeline
              </h3>

              <p className="mt-2 text-muted">
                SignalScope will analyze lyrics, themes, sentiment, audience
                fit, cultural signals, and growth opportunities using Musixmatch
                data.
              </p>
            </div>
          </div>
        </div>

        <details className="mt-10 rounded-2xl border border-border bg-card">
          <summary className="cursor-pointer p-5 font-medium hover:text-violet-400 transition-colors">
            Technical Metadata
          </summary>

          <div className="border-t border-border p-5">
            <div className={classes.grid}>
              <InfoItem label="Track ID" value={track.track_id} />
              <InfoItem label="Common Track ID" value={track.commontrack_id} />

              <InfoItem label="Artist ID" value={track.artist_id} />

              <InfoItem label="Album ID" value={track.album_id} />

              <InfoItem label="ISRC" value={track.track_isrc} />

              <InfoItem
                label="Spotify ID"
                value={track.track_spotify_id || "N/A"}
              />
              <InfoItem
                label="RichSync"
                value={track.has_richsync ? "Available" : "Unavailable"}
              />

              <InfoItem
                label="Subtitles"
                value={track.has_subtitles ? "Available" : "Unavailable"}
              />

              <InfoItem
                label="Last Updated"
                value={new Date(track.updated_time).toLocaleString()}
              />
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}
