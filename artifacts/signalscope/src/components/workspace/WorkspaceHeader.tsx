import { RefreshCw, ShieldCheck, ChevronRight, Menu } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { getNavItem } from "./nav";
import WorkspaceActions from "./WorkspaceActions";
import SafeArtwork from "./SafeArtwork";
import { artworkCandidates } from "@/lib/songstatsMetadata";
import { liveBadges } from "@/lib/jambase";

export default function WorkspaceHeader({ view, onMenuClick }: { view: string; onMenuClick?: () => void }) {
  const { track, songstats, jambase, jambaseStatus, report, reportLoading, confidence, regenerate } =
    useTrackWorkspace();
  const nav = getNavItem(view);
  const artwork = artworkCandidates(songstats, [
    track.album_coverart_100x100,
    track.album_coverart_350x350,
  ]);
  const badges = jambaseStatus === "ok" ? liveBadges(jambase) : [];

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="md:hidden p-2 -ml-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <SafeArtwork
          sources={artwork}
          alt={track.album_name}
          className="w-10 h-10 rounded-md border border-border shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate max-w-[140px]">{track.track_name}</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-medium">{nav?.label ?? "Workspace"}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-sm font-bold tracking-tight truncate">{track.artist_name}</h1>
            {report && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                <ShieldCheck className="w-3 h-3" />
                {confidence}%
              </span>
            )}
            {badges.map((b) => (
              <span
                key={b.label}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border"
              >
                <span className="font-semibold text-foreground">{b.value}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <WorkspaceActions />
        <button
          onClick={regenerate}
          disabled={reportLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Regenerate report"
        >
          <RefreshCw className={`w-4 h-4 ${reportLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Regenerate</span>
        </button>
      </div>
    </div>
  );
}
