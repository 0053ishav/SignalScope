import { useEffect, useState } from "react";
import { BRAND } from "@/lib/branding";

/**
 * Cover art with a guaranteed visual: shows the provided artwork when available
 * and falls back to the SignalScope icon placeholder on missing/broken images.
 * Artwork priority (when a URL is supplied) is the caller's responsibility:
 * Songstats → Musixmatch → (no URL) → this icon placeholder.
 */
export function CoverArt({
  src,
  alt = "",
  className = "",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showPlaceholder = !src || failed;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-border bg-secondary ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/15 to-blue-500/15">
          <img
            src={BRAND.logoIcon}
            alt=""
            aria-hidden="true"
            className="h-2/3 w-2/3 object-contain opacity-80"
          />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
