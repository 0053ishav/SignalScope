import Image from "next/image";
import Link from "next/link";

import { getTrack } from "@/services/musixmatch";
import { classes } from "@/theme";
import { TrackDetails } from "@/types/music";
import InfoItem from "@/components/ui/InfoItem";
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackPage({
  params,
}: PageProps) {
  const { id } = await params;

  let track: TrackDetails | null = null;

  try {
    track = await getTrack(id);
  } catch (error) {
    console.error(
      "Track page error:",
      error
    );
  }

  if (!track) {
    return (
      <main className={classes.page}>
        <div className={classes.card}>
          <h1 className="text-2xl font-bold">
            Failed to load track
          </h1>

          <p className="text-gray-500 mt-2">
            Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const genres =
    track.primary_genres?.music_genre_list
      ?.map(
        (genre) =>
          genre.music_genre
            .music_genre_name
      )
      .join(", ");

  const coverArt =
    track.album_coverart_800x800 ||
    track.album_coverart_500x500 ||
    track.album_coverart_350x350 ||
    track.album_coverart_100x100;

  const hasArtwork =
    coverArt &&
    !coverArt.includes("nocover.png");

  const duration = `${Math.floor(
    track.track_length / 60
  )}:${(track.track_length % 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <main className={classes.page}>
      <Link
        href="/"
        className={classes.link}
      >
        ← Back to Search
      </Link>

      <div className="mb-8 mt-4">
        <h1 className={classes.pageTitle}>
          SignalScope
        </h1>

        <p className={classes.muted}>
          Track Intelligence
        </p>
      </div>

      <div className={classes.card}>
        <div className="flex flex-col md:flex-row gap-8">
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

          <div className="flex-1">
            <h2
              className={
                classes.sectionTitle
              }
            >
              {track.track_name}
            </h2>

            <p
              className={
                classes.subtitle
              }
            >
              {track.artist_name}
            </p>

            <div className="mt-8">
              <div className={classes.grid}>
                <InfoItem
                  label="Album"
                  value={
                    track.album_name
                  }
                />

                <InfoItem
                  label="Genres"
                  value={
                    genres ||
                    "Unknown"
                  }
                />

                <InfoItem
                  label="Track Rating"
                  value={
                    track.track_rating
                  }
                />

                <InfoItem
                  label="Duration"
                  value={duration}
                />

                <InfoItem
                  label="ISRC"
                  value={
                    track.track_isrc
                  }
                />

                <InfoItem
                  label="Spotify ID"
                  value={
                    track.track_spotify_id ||
                    "N/A"
                  }
                />

                <InfoItem
                  label="Lyrics"
                  value={
                    track.has_lyrics
                      ? "Available"
                      : "Unavailable"
                  }
                />

                <InfoItem
                  label="RichSync"
                  value={
                    track.has_richsync
                      ? "Available"
                      : "Unavailable"
                  }
                />

                <InfoItem
                  label="Subtitles"
                  value={
                    track.has_subtitles
                      ? "Available"
                      : "Unavailable"
                  }
                />

                <InfoItem
                  label="Explicit"
                  value={
                    track.explicit
                      ? "Yes"
                      : "No"
                  }
                />

                <InfoItem
                  label="Instrumental"
                  value={
                    track.instrumental
                      ? "Yes"
                      : "No"
                  }
                />

                <InfoItem
                  label="Favorites"
                  value={track.num_favourite.toLocaleString()}
                />

                <InfoItem
                  label="Track ID"
                  value={
                    track.track_id
                  }
                />

                <InfoItem
                  label="Artist ID"
                  value={
                    track.artist_id
                  }
                />

                <InfoItem
                  label="Album ID"
                  value={
                    track.album_id
                  }
                />

                <InfoItem
                  label="Last Updated"
                  value={new Date(
                    track.updated_time
                  ).toLocaleString()}
                />
              </div>
            </div>

            {track.track_lyrics_translation_status
              ?.length ? (
              <div className="mt-8">
                <p
                  className={
                    classes.infoLabel
                  }
                >
                  Available
                  Translations
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {track.track_lyrics_translation_status.map(
                    (
                      translation
                    ) => (
                      <span
                        key={
                          translation.to
                        }
                        className={
                          classes.badge
                        }
                      >
                        {
                          translation.to
                        }
                      </span>
                    )
                  )}
                </div>
              </div>
            ) : null}

            {track.track_share_url && (
              <div className="mt-8">
                <a
                  href={
                    track.track_share_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border rounded-lg px-4 py-2 hover:bg-gray-50"
                >
                  View on
                  Musixmatch
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
