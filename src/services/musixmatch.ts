import Fuse from "fuse.js";
import {
  AnalysisResponse,
  LyricsResponse,
  Track,
  TrackDetails,
} from "@/types/music";
import { log } from "console";

const BASE_URL =
  process.env.MUSIXMATCH_BASE_URL;
const API_KEY =
  process.env.MUSIXMATCH_API_KEY

export async function searchTracks(
  query: string
): Promise<Track[]> {
  try {
    if (!API_KEY) {
      throw new Error(
        "Missing MUSIXMATCH_API_KEY"
      );
    }

    const isSingleWord =
      query.trim().split(/\s+/)
        .length === 1;

    const commonParams =
      `&page_size=100` +
      `&page=1` +
      `&f_has_lyrics=1` +
      `&s_track_rating=desc` +
      `&apikey=${API_KEY}`;


    const primaryUrl =
      `${BASE_URL}/track.search` +
      `?${isSingleWord
        ? "q_track"
        : "q_track_artist"
      }=${encodeURIComponent(
        query
      )}` +
      commonParams;

    const globalUrl =
      `${BASE_URL}/track.search` +
      `?q=${encodeURIComponent(
        query
      )}` +
      commonParams;

    const responses =
      await Promise.all([
        fetch(primaryUrl, {
          cache: "no-store",
        }),
        fetch(globalUrl, {
          cache: "no-store",
        }),
      ]);

    const [
      primaryResponse,
      globalResponse,
    ] = responses;

    if (
      !primaryResponse.ok &&
      !globalResponse.ok
    ) {
      throw new Error(
        "Failed to search tracks"
      );
    }

    const [
      primaryData,
      globalData,
    ] = await Promise.all([
      primaryResponse.json(),
      globalResponse.json(),
    ]);

    const rawTracks = [
      ...(primaryData.message?.body
        ?.track_list ?? []),
      ...(globalData.message?.body
        ?.track_list ?? []),
    ];

    const uniqueTracks: Track[] =
      Array.from(
        new Map(
          rawTracks.map(
            (item: {
              track: {
                track_id: number;
                track_name: string;
                artist_name: string;
                album_name?: string;
              };
            }) => [
                item.track.track_id,
                {
                  id:
                    String(item.track.track_id),
                  name:
                    item.track
                      .track_name,
                  artist:
                    item.track
                      .artist_name,
                  album:
                    item.track
                      .album_name,
                },
              ]
          )
        ).values()
      );

    if (
      uniqueTracks.length === 0
    ) {
      return [];
    }

    const searchableTracks =
      uniqueTracks.map((track) => ({
        ...track,
        searchText:
          `${track.name} ${track.artist}`.toLowerCase(),
      }));

    const fuse = new Fuse(
      searchableTracks,
      {
        keys: [
          {
            name: "searchText",
            weight: 1,
          },
        ],
        includeScore: true,
        threshold: 0.3,
      }
    );

    const normalizedQuery =
      query.toLowerCase().trim();

    const ranked = fuse
      .search(normalizedQuery)
      .map(({ item }) => ({
        id: item.id,
        name: item.name,
        artist: item.artist,
        album: item.album,
      }));

    return (
      ranked.length > 0
        ? ranked
        : uniqueTracks
    );

  } catch (error) {
    console.error(
      "searchTracks error:",
      error
    );

    throw error;
  }
}

export async function getTrack(
  trackId: string
): Promise<TrackDetails> {
  try {
    if (!API_KEY) {
      throw new Error(
        "Missing MUSIXMATCH_API_KEY"
      );
    }

    const url =
      `${BASE_URL}/track.get` +
      `?track_id=${trackId}` +
      `&apikey=${API_KEY}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        "Failed to fetch track"
      );
    }

    const data = await response.json();
    const track =
      data.message?.body?.track;

    if (!track) {
      throw new Error(
        "Track not found"
      );
    }
    return track;
  } catch (error) {
    console.error(
      "getTrack error:",
      error
    );

    throw error;
  }
}

export async function getLyrics(
  commontrackId: string
): Promise<LyricsResponse | null> {
  const response = await fetch(
    `${BASE_URL}/track.lyrics.get?commontrack_id=${commontrackId}&apikey=${API_KEY}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (data?.message?.header?.status_code !== 200) {
    return null;
  }

  const lyrics = data?.message?.body?.lyrics;

  if (!lyrics) {
    return null;
  }

  return {
    lyrics_body: lyrics.lyrics_body,
    lyrics_language: lyrics.lyrics_language,
    explicit: lyrics.explicit,
  };
}

export async function getRichSync(
  commontrackId: string
) {
  const response = await fetch(
    `${BASE_URL}/track.richsync.get?commontrack_id=${commontrackId}&apikey=${API_KEY}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch RichSync");
  }

  const data = await response.json();
  return data?.message?.body?.richsync ?? null;
}

export async function getLyricsTranslation(
  commontrackId: string,
  language: string
) {
  const response = await fetch(
    `${BASE_URL}/track.lyrics.translation.get?commontrack_id=${commontrackId}&selected_language=${language}&apikey=${API_KEY}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch RichSync");
  }


  const data = await response.json();
  return (
    data?.message?.body?.lyrics?.lyrics_translated
      ?.lyrics_body ?? null
  );
}

export async function getAnalysis(
  commontrackId: string
): Promise<AnalysisResponse | null> {
  const response = await fetch(
    `${BASE_URL}/track.lyrics.analysis.get?commontrack_id=${commontrackId}&apikey=${API_KEY}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch analysis"
    );
  }

  const data = await response.json();
  if (
    data?.message?.header?.status_code !==
    200
  ) {
    return null;
  }

  return (
    data?.message?.body?.analysis ??
    null
  );
}