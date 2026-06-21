import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { getSectionSources, type SectionKey } from "@/lib/intelligence";

/**
 * Renders the real inputs that fed a given intelligence section. Only sources
 * that actually exist for this track are shown — never a fixed/fabricated list.
 */
export default function SourceAttribution({ section }: { section: SectionKey }) {
  const { analysis, segments, lyrics, reportSource } = useTrackWorkspace();
  const hasLyrics = Boolean(lyrics?.lyrics_body);
  const sources = getSectionSources(section, analysis, segments, hasLyrics, reportSource);

  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Derived from
      </span>
      {sources.map((s) => (
        <span
          key={`${s.provider}-${s.label}`}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
            s.provider === "Gemini"
              ? "border-primary/25 bg-primary/5 text-primary"
              : "border-border bg-secondary text-secondary-foreground"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {s.label}
        </span>
      ))}
    </div>
  );
}
