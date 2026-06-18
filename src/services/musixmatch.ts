import {
  Track,
  TrackDetails,
} from "@/types/music";
import { log } from "console";

const BASE_URL =
  process.env.MUSIXMATCH_BASE_URL;

export async function searchTracks(
  query: string
): Promise<Track[]> {
  try {
    const apiKey =
      process.env.MUSIXMATCH_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing MUSIXMATCH_API_KEY"
      );
    }

    const url =
      `${BASE_URL}/track.search` +
      `?q_track=${encodeURIComponent(
        query
      )}` +
      `&page_size=10` +
      `&page=1` +
      `&s_track_rating=desc` +
      `&apikey=${apiKey}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        "Failed to search tracks"
      );
    }

    const data = await response.json();

    const tracks =
      data.message?.body?.track_list ??
      [];

    return tracks.map(
      (item: {
        track: {
          track_id: number;
          track_name: string;
          artist_name: string;
          album_name?: string;
        };
      }) => ({
        id: item.track.track_id,
        name: item.track.track_name,
        artist: item.track.artist_name,
        album: item.track.album_name,
      })
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
    const apiKey =
      process.env.MUSIXMATCH_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing MUSIXMATCH_API_KEY"
      );
    }

    const url =
      `${BASE_URL}/track.get` +
      `?track_id=${trackId}` +
      `&apikey=${apiKey}`;
      
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