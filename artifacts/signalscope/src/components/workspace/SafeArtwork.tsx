import { useState } from "react";
import { Music } from "lucide-react";

interface Props {
  /** Ordered candidate URLs; the first that loads is shown. */
  sources: string[];
  alt: string;
  className?: string;
}

/**
 * Artwork that never renders a broken image: it walks an ordered list of
 * candidate URLs (e.g. Songstats avatar → Musixmatch cover) and falls back to a
 * neutral placeholder glyph when every candidate fails to load.
 */
export default function SafeArtwork({ sources, alt, className = "" }: Props) {
  const [index, setIndex] = useState(0);
  const url = sources[index];

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-secondary text-muted-foreground ${className}`}>
        <Music className="w-1/3 h-1/3" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setIndex((i) => i + 1)}
      className={`object-cover ${className}`}
    />
  );
}
