import { useEffect, useState } from "react";
import { CoverArt } from "@/components/CoverArt";

/**
 * Resolves Songstats cover art for a search result, falling back to the
 * SignalScope icon placeholder (via CoverArt) when Songstats is unavailable.
 *
 * The search endpoint only returns {id,name,artist,album}, so the cover is
 * resolved client-side: GET /api/track/:id -> ISRC, then
 * GET /api/songstats/:isrc -> data.avatarUrl. Any failure (no ISRC, Songstats
 * empty/unavailable, network error) leaves src null and CoverArt shows the icon.
 */
export function SearchResultCover({
  trackId,
  artist,
  title,
  alt,
  className,
}: {
  trackId: string;
  artist?: string;
  title?: string;
  alt?: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);

    (async () => {
      try {
        const trackRes = await fetch(`/api/track/${trackId}`);
        if (!trackRes.ok) return;
        const track = await trackRes.json();

        const isrc: string | undefined =
          track?.track_isrc?.trim() || track?.commontrack_isrcs?.[0]?.[0];
        if (!isrc) return;

        const params = new URLSearchParams();
        if (artist) params.set("artist", artist);
        if (title) params.set("title", title);
        const qs = params.toString();
        const ssRes = await fetch(
          `/api/songstats/${encodeURIComponent(isrc)}${qs ? `?${qs}` : ""}`,
        );
        if (!ssRes.ok) return;

        const ss = await ssRes.json();
        const url: string | undefined = ss?.data?.avatarUrl;
        if (!cancelled && url) setSrc(url);
      } catch {
        /* leave src null -> CoverArt renders the icon placeholder */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trackId, artist, title]);

  return <CoverArt src={src} alt={alt} className={className} />;
}
