"use client";

import { useState } from "react";
import { Track } from "@/types/music";

export default function SearchSong() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] =
    useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();

      setTracks(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search song..."
          className="flex-1 border rounded p-3"
        />

        <button
          onClick={handleSearch}
          className="px-4 py-3 bg-black text-white rounded"
        >
          Search
        </button>
      </div>

      {loading && (
        <p>Searching...</p>
      )}

      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="border rounded p-3"
          >
            <h3 className="font-medium">
              {track.name}
            </h3>

            <p className="text-sm text-gray-500">
              {track.artist}
            </p>

            {track.album && (
              <p className="text-xs text-gray-400">
                {track.album}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}