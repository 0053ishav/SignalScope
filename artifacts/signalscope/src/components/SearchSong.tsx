import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { Track } from "@/types/music";
import { CoverArt } from "@/components/CoverArt";
import { BRAND } from "@/lib/branding";

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-4"
        >
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-secondary" />
          <div className="flex-1 space-y-2">
            <div
              className={`h-4 animate-pulse rounded bg-secondary ${
                index % 2 === 0 ? "w-1/2" : "w-2/3"
              }`}
            />
            <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
          </div>
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
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
              className="w-full rounded-2xl border border-border bg-secondary px-12 py-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-violet-500 focus:bg-card focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="absolute right-12 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground md:flex">
              <kbd>Ctrl</kbd>
              <span>+</span>
              <kbd>K</kbd>
            </div>
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setTracks([]);
                  setError("");
                  setHasSearched(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
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

        <p className="mt-4 text-sm text-muted-foreground">
          Discover metadata, audience intelligence, and growth signals.
        </p>
        <div className="mt-4 text-center text-sm text-muted-foreground">
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
              <h2 className="text-xl font-semibold text-foreground">
                Search Results
              </h2>

              <span className="text-sm text-muted-foreground">
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
                <h2 className="text-xl font-semibold text-foreground">
                  Search Results
                </h2>

                <p className="text-sm text-muted-foreground">
                  &quot;{query}&quot;
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                Showing {Math.min(visibleCount, tracks.length)} of{" "}
                {tracks.length} matches
              </span>
            </div>

            <div className="space-y-3">
              {tracks.slice(0, visibleCount).map((track) => (
                <Link
                  key={track.id}
                  href={`/track/${track.id}`}
                  className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-violet-500/50 hover:bg-card hover:shadow-lg hover:shadow-violet-500/10 animate-in fade-in slide-in-from-bottom-2"
                >
                  <CoverArt
                    alt={track.album ?? track.name}
                    className="h-16 w-16"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-violet-300">
                      {track.name}
                    </h3>

                    <p className="truncate text-sm font-medium text-muted-foreground">
                      {track.artist}
                    </p>

                    {track.album && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground/80">
                        {track.album}
                      </p>
                    )}
                  </div>

                  <ArrowRight className="h-5 w-5 shrink-0 -translate-x-1 text-violet-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
            {tracks.length > visibleCount && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="mt-6 w-full rounded-2xl border border-border bg-card px-4 py-3 text-foreground transition-all hover:border-violet-500/40 cursor-pointer"
              >
                Show More ({tracks.length - visibleCount} remaining)
              </button>
            )}
          </div>
        )}

        {!loading && !error && hasSearched && tracks.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-10 text-center">
            <img
              src={BRAND.logoIcon}
              alt=""
              aria-hidden="true"
              className="mb-4 h-14 w-14 object-contain opacity-80"
            />
            <p className="text-base font-semibold text-foreground">
              No tracks found.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching by:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Song title</li>
              <li>Artist</li>
              <li>Lyrics phrase</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
