import { useEffect, useRef, useState, useCallback, type ComponentType } from "react";
import { Link, Redirect } from "wouter";
import { Loader2 } from "lucide-react";

import type { TrackDetails, LyricsResponse, AnalysisResponse, LyricSegment } from "@/types/music";
import type { IntelligenceReport } from "@/types/intelligence";
import type {
  SongstatsTrackData,
  SongstatsSignals,
  SongstatsUiStatus,
  SongstatsResponse,
} from "@/types/songstats";
import { parseRichSync } from "@/lib/richsync/parseRichSync";
import { normalizeRichSync } from "@/lib/richsync/normalizeRichSync";
import { clamp } from "@/lib/intelligence";

import { TrackWorkspaceContext, type TrackWorkspaceValue } from "@/context/TrackWorkspaceContext";
import { KNOWN_VIEWS, DEFAULT_VIEW } from "@/components/workspace/nav";

import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import SourceIntelligencePanel from "@/components/SourceIntelligencePanel";
import TrackPerformanceBanner from "@/components/workspace/TrackPerformanceBanner";

import OverviewPage from "@/pages/workspace/OverviewPage";
import AudiencePage from "@/pages/workspace/AudiencePage";
import EmotionalPage from "@/pages/workspace/EmotionalPage";
import CulturalPage from "@/pages/workspace/CulturalPage";
import ContentPage from "@/pages/workspace/ContentPage";
import DistributionPage from "@/pages/workspace/DistributionPage";
import EvidencePage from "@/pages/workspace/EvidencePage";
import SourceDataPage from "@/pages/workspace/SourceDataPage";
import PerformancePage from "@/pages/workspace/PerformancePage";
import LivePage from "@/pages/workspace/LivePage";
import SonicPage from "@/pages/workspace/SonicPage";

interface Props {
  id: string;
  view: string;
}

const PAGES: Record<string, ComponentType> = {
  overview: OverviewPage,
  audience: AudiencePage,
  emotional: EmotionalPage,
  cultural: CulturalPage,
  content: ContentPage,
  distribution: DistributionPage,
  evidence: EvidencePage,
  source: SourceDataPage,
  performance: PerformancePage,
  live: LivePage,
  sonic: SonicPage,
};

export default function TrackWorkspace({ id, view }: Props) {
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<TrackDetails | null>(null);
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null);
  const [richSync, setRichSync] = useState<unknown>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [songstats, setSongstats] = useState<SongstatsTrackData | null>(null);
  const [songstatsSignals, setSongstatsSignals] = useState<SongstatsSignals | null>(null);
  const [songstatsStatus, setSongstatsStatus] = useState<SongstatsUiStatus>("loading");

  const generatedForRef = useRef<number | null>(null);

  // Load source data, keyed on the route id.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLyrics(null);
      setRichSync(null);
      setAnalysis(null);
      try {
        const trackRes = await fetch(`/api/track/${id}`);
        if (!trackRes.ok) throw new Error("Failed to fetch track");
        const trackData: TrackDetails = await trackRes.json();
        if (cancelled) return;
        setTrack(trackData);

        if (trackData?.commontrack_id) {
          const commontrackId = String(trackData.commontrack_id);
          const [lyricsData, richsyncData, analysisData] = await Promise.all([
            fetch(`/api/lyrics/${commontrackId}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
            fetch(`/api/richSync/${commontrackId}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
            fetch(`/api/analysis/${commontrackId}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
          ]);
          if (cancelled) return;
          setLyrics(lyricsData);
          setRichSync(richsyncData);
          setAnalysis(analysisData);
        }
      } catch (error) {
        console.error("Track workspace error:", error);
        if (!cancelled) setTrack(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const generate = useCallback(
    async (
      t: TrackDetails,
      l: LyricsResponse | null,
      r: unknown,
      a: AnalysisResponse | null,
      force = false,
    ) => {
      try {
        setReportLoading(true);
        setReportError("");
        const response = await fetch(force ? "/api/intelligence?refresh=true" : "/api/intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ track: t, lyrics: l, richSync: r, analysis: a }),
        });
        if (!response.ok) throw new Error("Failed to generate intelligence");
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setReportError(err instanceof Error ? err.message : "Unknown Error");
      } finally {
        setReportLoading(false);
      }
    },
    [],
  );

  // Generate the report exactly once per track (commontrack_id).
  useEffect(() => {
    if (!track || loading) return;
    if (generatedForRef.current === track.commontrack_id) return;
    generatedForRef.current = track.commontrack_id;
    setReport(null);
    generate(track, lyrics, richSync, analysis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, loading]);

  const regenerate = useCallback(() => {
    if (!track) return;
    generate(track, lyrics, richSync, analysis, true);
  }, [track, lyrics, richSync, analysis, generate]);

  // Load Songstats market data independently of the AI report, keyed off the
  // track's ISRC. Any failure degrades to an honest status — it never blocks
  // the workspace or the intelligence report.
  const isrc = track?.track_isrc;
  const artistName = track?.artist_name;
  const trackName = track?.track_name;
  useEffect(() => {
    if (!track) return;
    let cancelled = false;

    const params = new URLSearchParams();
    if (artistName) params.set("artist", artistName);
    if (trackName) params.set("title", trackName);
    const path = `/api/songstats/${encodeURIComponent(isrc?.trim() || "none")}?${params.toString()}`;

    setSongstatsStatus("loading");
    setSongstats(null);
    setSongstatsSignals(null);

    fetch(path)
      .then((r) => (r.ok ? (r.json() as Promise<SongstatsResponse>) : Promise.reject(new Error("songstats request failed"))))
      .then((res) => {
        if (cancelled) return;
        if (res.status === "ok" && res.data) {
          setSongstats(res.data);
          setSongstatsSignals(res.signals ?? null);
          setSongstatsStatus("ok");
        } else {
          setSongstatsStatus(res.status === "ok" ? "empty" : res.status);
        }
      })
      .catch(() => {
        if (!cancelled) setSongstatsStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isrc, artistName, trackName, track]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-65px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[calc(100vh-65px)]">
        <h1 className="text-2xl font-bold mb-4">Track Not Found</h1>
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
          Return to Search
        </Link>
      </div>
    );
  }

  if (!KNOWN_VIEWS.includes(view)) {
    return <Redirect to={`/track/${id}/${DEFAULT_VIEW}`} />;
  }

  const richsyncLines =
    richSync && typeof richSync === "object" && "richsync_body" in richSync
      ? parseRichSync((richSync as { richsync_body: string }).richsync_body)
      : [];
  const segments: LyricSegment[] = normalizeRichSync(richsyncLines);

  const value: TrackWorkspaceValue = {
    id,
    track,
    lyrics,
    richSync,
    segments,
    analysis,
    report,
    reportLoading,
    reportError,
    reportSource: report?.source ?? null,
    regenerate,
    confidence: report ? clamp(report.confidence) : 0,
    songstats,
    songstatsSignals,
    songstatsStatus,
  };

  const Page = PAGES[view] ?? OverviewPage;

  return (
    <TrackWorkspaceContext.Provider value={value}>
      <WorkspaceLayout
        sidebar={
          <WorkspaceSidebar
            id={id}
            view={view}
            mobileOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />
        }
        header={<WorkspaceHeader view={view} onMenuClick={() => setMobileNavOpen(true)} />}
        banner={<TrackPerformanceBanner />}
        rightRail={<SourceIntelligencePanel />}
      >
        <Page />
      </WorkspaceLayout>
    </TrackWorkspaceContext.Provider>
  );
}
