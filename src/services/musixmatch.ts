import { Track } from "@/types/music";

const BASE_URL  = process.env.MUSIXMATCH_BASE_URL;

export async function searchTracks(
  query: string
): Promise<Track[]> {
  const apiKey = process.env.MUSIXMATCH_API_KEY;

  if (!apiKey) {
    throw new Error("Missing MUSIXMATCH_API_KEY");
  }

  const url =
    `${BASE_URL}/track.search` +
    `?q_track=${encodeURIComponent(query)}` +
    `&page_size=10` +
    `&page=1` +
    `&s_track_rating=desc` +
    `&apikey=${apiKey}`;
console.log("API KEY:", apiKey);
console.log("BASE URL:", BASE_URL);
  const response = await fetch(url, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to search tracks");
  }

  const data = await response.json();
console.log(
  JSON.stringify(data, null, 2)
);
  const tracks =
    data.message?.body?.track_list ?? [];

  return tracks.map(
    (item: { track: {
      track_id: number;
      track_name: string;
      artist_name: string;
      album_name?: string;
    }}) => ({
      id: item.track.track_id,
      name: item.track.track_name,
      artist: item.track.artist_name,
      album: item.track.album_name,
    })
  );
}