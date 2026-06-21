import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Track } from "@/types/music";

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="
              rounded-2xl
              border
              border-border
              bg-card/80
              p-5
              animate-pulse
            "
        >
          <div
            className={`h-5 rounded bg-border ${
              index % 2 === 0 ? "w-48" : "w-64"
            }`}
          />
          <div
            className={`mt-3 h-4 rounded bg-border ${
              index % 2 === 0 ? "w-32" : "w-40"
            }`}
          />
          <div className="mt-3 h-3 w-64 rounded bg-border" />
        </div>
      ))}
    </div>
  );
}

export default function SearchSong() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function searchExample(value: string) {
    setQuery(value);

    inputRef.current?.focus();

    await handleSearch(value);
  }

  async function handleSearch(value?: string) {
    const searchQuery = (value ?? query).trim();

    if (!searchQuery) {
      setError("Please enter a song or artist.");
      return;
    }

    setHasSearched(true);
    setLoading(true);
    setError("");
    setTracks([]);

    try {
      abortRef.current?.abort();

      const controller = new AbortController();

      abortRef.current = controller;

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
        {
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to search tracks");
      }

      const data = await response.json();

      setTracks(data);
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setVisibleCount(10);
    } catch (error) {
      console.error(error);
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setError("Unable to search tracks.");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Search Box */}

      <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search any song, artist, or track..."
              className="w-full rounded-2xl border border-border bg-background px-5 py-4 pr-12 text-base outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="absolute right-12 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted md:flex">
              <kbd>Ctrl</kbd>
              <span>+</span>
              <kbd>K</kbd>
            </div>
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setTracks([]);
                  setError("");
                  setHasSearched(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="rounded-2xl bg-violet-600 px-8 py-4 font-medium text-white transition-all hover:bg-violet-500 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
          >
            {loading ? "Analyzing..." : "Search"}
          </button>
        </div>

        <p className="mt-4 text-sm text-muted">
          Discover metadata, audience intelligence, and growth signals.
        </p>
        <div className="mt-4 text-center text-sm text-muted">
          Try:
          <button
            disabled={loading}
            onClick={() => searchExample("295 SMW")}
            className="mx-2 text-violet-400 hover:text-violet-300 cursor-pointer"
          >
            295 SMW
          </button>
          ·
          <button
            disabled={loading}
            onClick={() => searchExample("Twice")}
            className="mx-2 text-violet-400 hover:text-violet-300 cursor-pointer"
          >
            Twice
          </button>
          ·
          <button
            disabled={loading}
            onClick={() => searchExample("ICONIC BY MISTAKE LE SSERAFIM")}
            className="mx-2 text-violet-400 hover:text-violet-300 cursor-pointer"
          >
            ICONIC BY MISTAKE LE SSERAFIM
          </button>
        </div>
      </div>

      <div
        ref={resultsRef}
        className={loading || hasSearched ? "min-h-[520px]" : ""}
      >
        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Search Results</h2>

              <span className="text-sm text-muted">
                Analyzing lyrics & metadata...
              </span>
            </div>

            <SearchSkeleton />
          </>
        )}

        {!loading && tracks.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Search Results</h2>

                <p className="text-sm text-muted">&quot;{query}&quot;</p>
              </div>
              <span className="text-sm text-muted">
                Showing{" "}
                {Math.min(visibleCount, tracks.length)}{" "}
                of {tracks.length} matches
              </span>
            </div>

            <div className="space-y-4">
              {tracks.slice(0, visibleCount).map((track) => (
                <Link
                  key={track.id}
                  href={`/track/${track.id}`}
                  className="group block rounded-2xl border border-border bg-card/80 p-5 transition-all duration-300 hover:border-violet-500/40 hover:bg-card hover:shadow-lg animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold transition-colors group-hover:text-violet-400">
                        {track.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted">{track.artist}</p>

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
            {tracks.length > visibleCount && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="mt-6 w-full rounded-2xl border border-border bg-card px-4 py-3 transition-all hover:border-violet-500/40 cursor-pointer"
              >
                Show More ({tracks.length - visibleCount} remaining)
              </button>
            )}
          </div>
        )}

        {!loading && !error && hasSearched && tracks.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted">
              No tracks found for &quot;{query}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
