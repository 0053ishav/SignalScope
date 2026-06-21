import { Link } from "wouter";
import { Clock, ArrowRight, Database } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";

function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SourceIntelligencePanel() {
  const { id, track, analysis } = useTrackWorkspace();

  const mainMoods = analysis?.moods?.main_moods || [];
  const mainThemes = analysis?.themes?.main_themes || [];
  const genres =
    track.primary_genres?.music_genre_list?.map((g) => g.music_genre?.music_genre_name).filter(Boolean) || [];

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card/30 overflow-y-auto hidden xl:block custom-scrollbar">
      <div className="p-5 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <h2 className="font-semibold tracking-tight text-foreground">Source Context</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Signals feeding this analysis</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Track metadata */}
        <div className="space-y-3 text-sm">
          <Row label="Album" value={track.album_name} />
          <Row label="Duration" value={formatDuration(track.track_length)} mono icon={Clock} />
          <Row label="ISRC" value={track.track_isrc || "N/A"} mono />
          <Row label="Explicit" value={track.explicit ? "Yes" : "No"} />
        </div>

        {genres.length > 0 && (
          <Section label="Genres">
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span key={g} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                  {g}
                </span>
              ))}
            </div>
          </Section>
        )}

        {mainMoods.length > 0 && (
          <Section label="Moods">
            <div className="flex flex-wrap gap-1.5">
              {mainMoods.map((m) => (
                <span key={m} className="px-2 py-1 rounded-md border border-primary/20 bg-primary/5 text-primary text-xs">
                  {m}
                </span>
              ))}
            </div>
          </Section>
        )}

        {mainThemes.length > 0 && (
          <Section label="Themes">
            <div className="flex flex-wrap gap-1.5">
              {mainThemes.map((t) => (
                <span key={t.theme} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                  {t.theme}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Link
          href={`/track/${id}/source`}
          className="flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-secondary transition-colors text-sm font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            View full source data
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      {children}
    </div>
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
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <span className={`text-right text-foreground font-medium truncate ml-4 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
