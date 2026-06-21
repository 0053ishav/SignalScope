import { useEffect, useState } from "react";
import { Link } from "wouter";

import { TrackDetails, LyricsResponse, AnalysisResponse } from "@/types/music";
import { parseRichSync } from "@/lib/richsync/parseRichSync";
import { normalizeRichSync } from "@/lib/richsync/normalizeRichSync";

import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import IntelligenceView from "@/components/IntelligenceView";
import SourceIntelligencePanel from "@/components/SourceIntelligencePanel";
import { Loader2 } from "lucide-react";

interface TrackPageProps {
  id: string;
}

export default function TrackPage({ id }: TrackPageProps) {
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<TrackDetails | null>(null);
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null);
  const [richsync, setRichsync] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  
  const [activeSection, setActiveSection] = useState("executive");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
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
          setRichsync(richsyncData);
          setAnalysis(analysisData);
        }
      } catch (error) {
        console.error("Track page error:", error);
        if (!cancelled) setTrack(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[calc(100vh-64px)]">
        <h1 className="text-2xl font-bold mb-4">Track Not Found</h1>
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
          Return to Search
        </Link>
      </div>
    );
  }

  const richsyncLines = richsync?.richsync_body ? parseRichSync(richsync.richsync_body) : [];
  const segments = normalizeRichSync(richsyncLines);

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      <WorkspaceSidebar activeSection={activeSection} onSelect={setActiveSection} />
      <IntelligenceView 
        track={track} 
        lyrics={lyrics} 
        richSync={richsync} 
        analysis={analysis} 
        activeSection={activeSection} 
      />
      <SourceIntelligencePanel 
        track={track} 
        lyrics={lyrics} 
        segments={segments} 
        analysis={analysis} 
      />
    </div>
  );
}