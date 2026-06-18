"use client";

import Link from "next/link";
import { useState } from "react";
import { Track } from "@/types/music";

export default function SearchSong() {
const [query, setQuery] = useState("");
const [tracks, setTracks] = useState<Track[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [hasSearched, setHasSearched] =
  useState(false);

async function handleSearch() {
if (!query.trim()) return;

  setHasSearched(true);
setLoading(true);
setError("");

try {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search tracks");
  }

  const data = await response.json();

  setTracks(data);
} catch (error) {
  console.error(error);

  setError("Unable to search tracks.");
  setTracks([]);
} finally {
  setLoading(false);
}


}

return ( <div className="space-y-8">
{/* Search Box */}


  <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
    <div className="flex flex-col md:flex-row gap-4">
      <input
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        placeholder="Search any song, artist, or track..."
        className="
          flex-1
          rounded-2xl
          border
          border-border
          bg-background
          px-5
          py-4
          text-base
          outline-none
          transition-all
          focus:border-violet-500
          focus:ring-2
          focus:ring-violet-500/20
        "
      />

      <button
        onClick={handleSearch}
        disabled={loading}
        className="
          rounded-2xl
          bg-violet-600
          px-8
          py-4
          font-medium
          text-white
          transition-all
          hover:bg-violet-500
          hover:scale-[1.02]
          disabled:opacity-50
          disabled:hover:scale-100
        "
      >
        {loading
          ? "Analyzing..."
          : "Search"}
      </button>
    </div>

    <p className="mt-4 text-sm text-muted">
      Discover metadata, audience
      intelligence, and growth signals.
    </p>
  </div>

  {/* Error */}

  {error && (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
      <p className="text-red-400">
        {error}
      </p>
    </div>
  )}

  {/* Empty State */}

  {hasSearched &&
  !loading &&
    tracks.length === 0 &&
    (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted">
          No tracks found for &quot;{query}&quot;
        </p>
      </div>
    )}

  {/* Loading */}

  {loading && (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <p className="text-muted">
        Searching music intelligence
        database...
      </p>
    </div>
  )}

  {/* Results */}

  {tracks.length > 0 && (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Search Results
        </h2>

        <span className="text-sm text-muted">
          {tracks.length} tracks found
        </span>
      </div>

      <div className="space-y-4">
        {tracks.map((track) => (
          <Link
            key={track.id}
            href={`/track/${track.id}`}
            className="
              group
              block
              rounded-2xl
              border
              border-border
              bg-card/80
              p-5
              transition-all
              hover:border-violet-500/40
              hover:bg-card
              hover:shadow-lg
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-violet-400 transition-colors">
                  {track.name}
                </h3>

                <p className="mt-1 text-sm text-muted">
                  {track.artist}
                </p>

                {track.album && (
                  <p className="mt-2 text-xs text-muted">
                    Album: {track.album}
                  </p>
                )}
              </div>

              <div className="text-violet-400 opacity-0 transition-opacity group-hover:opacity-100">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )}
</div>


);
}
