import { Disc3, FileText, Clock, HeartHandshake, Globe, BrainCircuit, Tag, Plug } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import CollapsibleCard from "@/components/workspace/CollapsibleCard";
import IntelligenceSourcesPanel from "@/components/workspace/IntelligenceSourcesPanel";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";

function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SourceDataPage() {
  const { track, lyrics, segments, analysis } = useTrackWorkspace();

  const genres =
    track.primary_genres?.music_genre_list?.map((g) => g.music_genre?.music_genre_name).filter(Boolean) || [];
  const moods = analysis?.moods?.main_moods || [];
  const themes = analysis?.themes?.main_themes || [];

  return (
    <WorkspacePage
      id="source"
      title="Source Data"
      description="The raw signals feeding this workspace — Musixmatch metadata, lyrics, RichSync timing, and lyrical analysis. No metric here is inferred."
    >
      <div className="space-y-3">
        <CollapsibleCard title="Intelligence Sources" icon={Plug} defaultOpen>
          <p className="text-xs text-muted-foreground mb-4">
            Live data providers feeding this workspace, plus partner integrations on the roadmap.
          </p>
          <IntelligenceSourcesPanel />
        </CollapsibleCard>

        <CollapsibleCard title="Track Metadata" icon={Disc3} defaultOpen>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <MetaRow label="Title" value={track.track_name} />
            <MetaRow label="Artist" value={track.artist_name} />
            <MetaRow label="Album" value={track.album_name} />
            <MetaRow label="Duration" value={formatDuration(track.track_length)} mono />
            <MetaRow label="ISRC" value={track.track_isrc || "N/A"} mono />
            <MetaRow label="Spotify ID" value={track.track_spotify_id || "N/A"} mono />
            <MetaRow label="Explicit" value={track.explicit ? "Yes" : "No"} />
            <MetaRow label="Instrumental" value={track.instrumental ? "Yes" : "No"} />
            <MetaRow label="Has Lyrics" value={track.has_lyrics ? "Yes" : "No"} />
            <MetaRow label="Has RichSync" value={track.has_richsync ? "Yes" : "No"} />
          </dl>
          {genres.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Genres</p>
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <span key={g} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CollapsibleCard>

        {analysis?.meaning?.explanation && (
          <CollapsibleCard title="Meaning" icon={BrainCircuit}>
            <p className="text-sm text-foreground/90 leading-relaxed">{analysis.meaning.explanation}</p>
          </CollapsibleCard>
        )}

        {moods.length > 0 && (
          <CollapsibleCard title="Moods" icon={HeartHandshake}>
            {analysis?.moods?.description && (
              <p className="text-xs text-muted-foreground mb-3">{analysis.moods.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {moods.map((m) => (
                <span key={m} className="px-2 py-1 rounded-md border border-primary/20 bg-primary/5 text-primary text-xs">
                  {m}
                </span>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {themes.length > 0 && (
          <CollapsibleCard title="Themes" icon={Globe}>
            <div className="space-y-3">
              {themes.map((t) => (
                <div key={t.theme} className="rounded-lg border border-border bg-card/60 p-3">
                  <p className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    {t.theme}
                  </p>
                  {t.quotes?.length > 0 && (
                    <ul className="space-y-1">
                      {t.quotes.map((q, i) => (
                        <li key={i} className="text-xs text-muted-foreground border-l-2 border-border pl-2.5 py-0.5">
                          {q}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {lyrics?.lyrics_body && (
          <CollapsibleCard title="Lyrics" icon={FileText}>
            <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
              {lyrics.lyrics_body}
            </pre>
            {lyrics.lyrics_copyright && (
              <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border">
                {lyrics.lyrics_copyright}
              </p>
            )}
          </CollapsibleCard>
        )}

        {segments.length > 0 && (
          <CollapsibleCard title="RichSync Timeline" icon={Clock}>
            <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
              {segments.map((s, i) => (
                <div key={i} className="flex gap-3 text-sm py-1">
                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-14">
                    {formatDuration(s.startTime)}
                  </span>
                  <span className="text-foreground/90">{s.text}</span>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}
      </div>
    </WorkspacePage>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className={`text-foreground font-medium text-right truncate ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
