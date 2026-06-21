import { Link } from "wouter";
import { TrackDetails, LyricsResponse, AnalysisResponse, LyricSegment } from "@/types/music";

interface Props {
  track: TrackDetails;
  lyrics: LyricsResponse | null;
  segments: LyricSegment[];
  analysis: AnalysisResponse | null;
}

export default function SourceIntelligencePanel({ track, lyrics, segments, analysis }: Props) {
  const previewLyrics = lyrics?.lyrics_body?.split("\n").filter(Boolean).slice(0, 10).join("\n") || "No lyrics available.";
  const previewSync = segments.slice(0, 5);

  const mainThemes = analysis?.themes?.main_themes || [];
  const mainMoods = analysis?.moods?.main_moods || [];
  
  return (
    <div className="w-80 shrink-0 border-l border-border bg-card/30 overflow-y-auto hidden xl:block custom-scrollbar">
      <div className="p-5 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <h2 className="font-semibold tracking-tight text-foreground">Source Intelligence</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Raw inputs & context</p>
      </div>

      <div className="p-5 space-y-8">
        {/* Track Info */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Metadata</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Album</span>
              <span className="text-right text-foreground font-medium truncate ml-4">{track.album_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISRC</span>
              <span className="text-right text-foreground font-medium font-mono">{track.track_isrc || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Explicit</span>
              <span className="text-right text-foreground font-medium">{track.explicit ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating</span>
              <span className="text-right text-foreground font-medium">{track.track_rating}</span>
            </div>
          </div>
        </section>

        <div className="h-px bg-border" />

        {/* Themes */}
        {mainThemes.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-foreground mb-3">Core Themes</h3>
            <div className="flex flex-wrap gap-1.5">
              {mainThemes.map(t => (
                <span key={t.theme} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                  {t.theme}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Moods */}
        {mainMoods.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-foreground mb-3">Sonic Moods</h3>
            <div className="flex flex-wrap gap-1.5">
              {mainMoods.map(m => (
                <span key={m} className="px-2 py-1 rounded-md border border-primary/20 bg-primary/5 text-primary text-xs">
                  {m}
                </span>
              ))}
            </div>
          </section>
        )}

        {(mainThemes.length > 0 || mainMoods.length > 0) && <div className="h-px bg-border" />}

        {/* Meaning Analysis */}
        {analysis?.meaning?.explanation && (
          <section>
            <h3 className="text-sm font-medium text-foreground mb-3">Meaning Analysis</h3>
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-6">
              {analysis.meaning.explanation}
            </p>
          </section>
        )}

        {analysis?.meaning?.explanation && <div className="h-px bg-border" />}

        {/* Lyrics */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Lyrics Sample</h3>
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
        </section>

        {/* RichSync */}
        {previewSync.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-foreground mb-3">RichSync Timeline</h3>
            <div className="space-y-2">
              {previewSync.map((s, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-primary font-mono w-8 shrink-0">{Math.floor(s.startTime)}s</span>
                  <span className="text-muted-foreground truncate">{s.text}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}