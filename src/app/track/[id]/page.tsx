import Image from "next/image";
import Link from "next/link";

import { getLyrics, getRichSync, getTrack } from "@/services/musixmatch";
import { classes } from "@/theme";
import { TrackDetails, LyricsResponse } from "@/types/music";
import InfoItem from "@/components/ui/InfoItem";
import { Card } from "@/components/ui/Card";
import LyricsPanel from "@/components/LyricsPanel";
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackPage({ params }: PageProps) {
  const { id } = await params;

  let track: TrackDetails | null = null;
  let lyrics: LyricsResponse | null = null;

  try {
    track = await getTrack(id);
    lyrics = track.commontrack_id
      ? await getLyrics(String(track.commontrack_id))
      : null;
    const richsync = track.commontrack_id
      ? await getRichSync(String(track.commontrack_id))
      : null;
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

  const duration = `${Math.floor(track.track_length / 60)}:${(
    track.track_length % 60
  )
    .toString()
    .padStart(2, "0")}`;

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

          <span className={classes.badge}>{duration}</span>

          <span className={classes.badge}>
            {track.num_favourite.toLocaleString()} Favorites
          </span>
        </div>
      </div>

      <div className={classes.card}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-[350px] shrink-0 space-y-6">
              {hasArtwork ? (
                <Image
                  src={coverArt}
                  alt={track.track_name}
                  width={350}
                  height={350}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-[350px] h-[350px] border rounded-lg flex items-center justify-center text-gray-400">
                  No Artwork
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-5">
                <h4 className="mb-4 font-semibold">SignalScope Scores</h4>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Audience</span>
                    <span>--</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Emotion</span>
                    <span>--</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Virality</span>
                    <span>--</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Growth</span>
                    <span>--</span>
                  </div>
                </div>
              </div>

              <LyricsPanel
                lyrics={lyrics?.lyrics_body}
                language={lyrics?.lyrics_language}
              />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="mb-4 text-xl font-semibold">Track Overview</h3>
            <div className={classes.grid}>
              <InfoItem label="Album" value={track.album_name} />

              <InfoItem label="Genres" value={genres || "Unknown"} />

              <InfoItem label="Track Rating" value={track.track_rating} />

              <InfoItem label="Duration" value={duration} />

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

            <div className="mt-10 rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    SignalScope Intelligence
                  </h3>

                  <p className="mt-1 text-sm text-muted">
                    Intelligence generated from lyrics, metadata, audience
                    signals and music context.
                  </p>
                </div>

                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                  Coming Soon
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card
                  title="Audience Archetypes"
                  description="Who resonates with this song?"
                />

                <Card
                  title="Emotional Positioning"
                  description="What emotions drive engagement?"
                />

                <Card
                  title="Cultural Positioning"
                  description="Identity and community signals."
                />

                <Card
                  title="Content Opportunities"
                  description="Potential clips, hooks and moments."
                />

                <Card
                  title="Platform Fit"
                  description="Reels, Shorts, TikTok and playlists."
                />

                <Card
                  title="Growth Recommendations"
                  description="Actionable artist strategy."
                />
              </div>
            </div>

            <div className="my-10 h-px bg-border" />

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

              <InfoItem label="Artist ID" value={track.artist_id} />

              <InfoItem label="Album ID" value={track.album_id} />

              <InfoItem label="ISRC" value={track.track_isrc} />

              <InfoItem
                label="Spotify ID"
                value={track.track_spotify_id || "N/A"}
              />
              <InfoItem label="Common Track ID" value={track.commontrack_id} />
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
