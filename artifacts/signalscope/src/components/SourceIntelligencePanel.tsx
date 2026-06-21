import { useState, ReactNode } from "react";
import { ChevronDown, Database, FileText, Music2, Tags, Clock, Sparkles } from "lucide-react";
import { TrackDetails, LyricsResponse, AnalysisResponse, LyricSegment } from "@/types/music";

interface Props {
  track: TrackDetails;
  lyrics: LyricsResponse | null;
  segments: LyricSegment[];
  analysis: AnalysisResponse | null;
}

function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SourceIntelligencePanel({ track, lyrics, segments, analysis }: Props) {
  const previewLyrics =
    lyrics?.lyrics_body?.split("\n").filter(Boolean).slice(0, 12).join("\n") || "No lyrics available.";
  const previewSync = segments.slice(0, 6);

  const mainThemes = analysis?.themes?.main_themes || [];
  const mainMoods = analysis?.moods?.main_moods || [];
  const genres =
    track.primary_genres?.music_genre_list?.map((g) => g.music_genre?.music_genre_name).filter(Boolean) || [];

  return (
    <div className="w-80 shrink-0 border-l border-border bg-card/30 overflow-y-auto hidden xl:block custom-scrollbar">
      <div className="p-5 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <h2 className="font-semibold tracking-tight text-foreground">Source Data</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Raw inputs &amp; context</p>
      </div>

      <div className="divide-y divide-border">
        {/* Track Metadata */}
        <CollapsibleGroup title="Track Metadata" icon={Database} defaultOpen>
          <div className="space-y-3 text-sm">
            <Row label="Album" value={track.album_name} />
            <Row label="ISRC" value={track.track_isrc || "N/A"} mono />
            <Row label="Duration" value={formatDuration(track.track_length)} mono icon={Clock} />
            <Row label="Explicit" value={track.explicit ? "Yes" : "No"} />
            <Row label="Rating" value={String(track.track_rating)} />
            {genres.length > 0 && (
              <div className="pt-1">
                <p className="text-muted-foreground mb-2">Genres</p>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g) => (
                    <span key={g} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleGroup>

        {/* Mood Analysis */}
        {mainMoods.length > 0 && (
          <CollapsibleGroup title="Mood Analysis" icon={Music2} defaultOpen>
            <div className="flex flex-wrap gap-1.5">
              {mainMoods.map((m) => (
                <span
                  key={m}
                  className="px-2 py-1 rounded-md border border-primary/20 bg-primary/5 text-primary text-xs"
                >
                  {m}
                </span>
              ))}
            </div>
            {analysis?.moods?.description && (
              <p className="text-xs leading-relaxed text-muted-foreground mt-3">{analysis.moods.description}</p>
            )}
          </CollapsibleGroup>
        )}

        {/* Theme Analysis */}
        {mainThemes.length > 0 && (
          <CollapsibleGroup title="Theme Analysis" icon={Tags} defaultOpen>
            <div className="space-y-3">
              {mainThemes.map((t) => (
                <div key={t.theme}>
                  <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                    {t.theme}
                  </span>
                  {t.quotes?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {t.quotes.slice(0, 2).map((q, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground italic border-l-2 border-border pl-2 leading-relaxed"
                        >
                          “{q}”
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleGroup>
        )}

        {/* Musixmatch Intelligence */}
        {(analysis?.meaning?.explanation || analysis?.rating) && (
          <CollapsibleGroup title="Musixmatch Intelligence" icon={Sparkles}>
            {analysis?.rating && (
              <div className="space-y-3 text-sm mb-3">
                <Row label="Audience" value={analysis.rating.audience} />
                <Row label="Descriptor" value={analysis.rating.descriptor} />
              </div>
            )}
            {analysis?.meaning?.explanation && (
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Meaning</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{analysis.meaning.explanation}</p>
              </div>
            )}
          </CollapsibleGroup>
        )}

        {/* Lyrics Analysis */}
        <CollapsibleGroup title="Lyrics Analysis" icon={FileText}>
          <div className="flex items-center justify-end mb-2">
            {lyrics?.lyrics_language && (
              <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {lyrics.lyrics_language}
              </span>
            )}
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {previewLyrics}
            </p>
          </div>
        </CollapsibleGroup>

        {/* RichSync Moments */}
        {previewSync.length > 0 && (
          <CollapsibleGroup title="RichSync Moments" icon={Clock}>
            <div className="space-y-2">
              {previewSync.map((s, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-primary font-mono w-8 shrink-0">{Math.floor(s.startTime)}s</span>
                  <span className="text-muted-foreground truncate">{s.text}</span>
                </div>
              ))}
            </div>
          </CollapsibleGroup>
        )}
      </div>
    </div>
  );
}

function CollapsibleGroup({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="px-5 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function Row({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: any;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <span className={`text-right text-foreground font-medium truncate ml-4 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
