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
import type {
  JamBaseLiveData,
  JamBaseSignals,
  JamBaseUiStatus,
  JamBaseResponse,
} from "@/types/jambase";
import { parseRichSync } from "@/lib/richsync/parseRichSync";
import { normalizeRichSync } from "@/lib/richsync/normalizeRichSync";
import { clamp } from "@/lib/intelligence";

import {
  TrackWorkspaceContext,
  type TrackWorkspaceValue,
  type AudioBriefing,
  type AudioBriefingStatus,
} from "@/context/TrackWorkspaceContext";
import { KNOWN_VIEWS, DEFAULT_VIEW } from "@/components/workspace/nav";
import { composeBriefingScript } from "@/lib/audioBriefing";
import { PrintReport } from "@/components/workspace/PrintReport";

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
import CreativeNetworkPage from "@/pages/workspace/CreativeNetworkPage";
import TimelinePage from "@/pages/workspace/TimelinePage";

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
  credits: CreativeNetworkPage,
  timeline: TimelinePage,
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

  const [jambase, setJambase] = useState<JamBaseLiveData | null>(null);
  const [jambaseSignals, setJambaseSignals] = useState<JamBaseSignals | null>(null);
  const [jambaseStatus, setJambaseStatus] = useState<JamBaseUiStatus>("loading");

  const [audioBriefing, setAudioBriefing] = useState<AudioBriefing | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioBriefingStatus>("idle");
  const audioUrlRef = useRef<string | null>(null);

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

  // Reset the audio briefing whenever the track changes; revoke any blob URL.
  useEffect(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioBriefing(null);
    setAudioStatus("idle");
  }, [track?.commontrack_id]);

  // Revoke the last blob URL on unmount.
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const requestAudioBriefing = useCallback(async () => {
    if (!track) return;
    setAudioStatus("loading");
    try {
      const script = composeBriefingScript({
        track,
        report,
        analysis,
        songstats,
        songstatsStatus,
        jambase,
        jambaseStatus,
      });
      const res = await fetch("/api/audio-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commontrackId: track.commontrack_id, script }),
      });
      const data = await res.json();
      if (data.status === "ok" && data.audio) {
        const byteChars = atob(data.audio);
        const bytes = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
        const blob = new Blob([bytes], { type: data.mimeType || "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = url;
        setAudioBriefing({ url, mimeType: data.mimeType || "audio/mpeg", voiceName: data.voiceName });
        setAudioStatus("ready");
      } else if (data.status === "unavailable") {
        setAudioStatus("unavailable");
      } else {
        setAudioStatus("error");
      }
    } catch {
      setAudioStatus("error");
    }
  }, [track, report, analysis, songstats, songstatsStatus, jambase, jambaseStatus]);

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

  // Load JamBase live/touring data independently of the AI report and
  // Songstats, keyed off the track's artist name. Any failure degrades to an
  // honest status — it never blocks the workspace or any other intelligence.
  useEffect(() => {
    if (!track) return;
    let cancelled = false;

    const path = `/api/jambase/${encodeURIComponent(artistName?.trim() || "none")}`;

    setJambaseStatus("loading");
    setJambase(null);
    setJambaseSignals(null);

    fetch(path)
      .then((r) => (r.ok ? (r.json() as Promise<JamBaseResponse>) : Promise.reject(new Error("jambase request failed"))))
      .then((res) => {
        if (cancelled) return;
        if (res.status === "ok" && res.data) {
          setJambase(res.data);
          setJambaseSignals(res.signals ?? null);
          setJambaseStatus("ok");
        } else {
          setJambaseStatus(res.status === "ok" ? "empty" : res.status);
        }
      })
      .catch(() => {
        if (!cancelled) setJambaseStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [artistName, track]);

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
    jambase,
    jambaseSignals,
    jambaseStatus,
    audioBriefing,
    audioStatus,
    requestAudioBriefing,
  };

  const Page = PAGES[view] ?? OverviewPage;

  return (
    <TrackWorkspaceContext.Provider value={value}>
      <PrintReport />
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
