import { createContext, useContext } from "react";
import type { TrackDetails, LyricsResponse, AnalysisResponse, LyricSegment } from "@/types/music";
import type { IntelligenceReport, ReportSource } from "@/types/intelligence";
import type { SongstatsTrackData, SongstatsSignals, SongstatsUiStatus } from "@/types/songstats";

export interface TrackWorkspaceValue {
  id: string;
  track: TrackDetails;
  lyrics: LyricsResponse | null;
  richSync: unknown;
  segments: LyricSegment[];
  analysis: AnalysisResponse | null;

  report: IntelligenceReport | null;
  reportLoading: boolean;
  reportError: string;
  reportSource: ReportSource | null;
  regenerate: () => void;

  confidence: number;

  /** Songstats market intelligence — loaded independently of the AI report. */
  songstats: SongstatsTrackData | null;
  songstatsSignals: SongstatsSignals | null;
  songstatsStatus: SongstatsUiStatus;
}

export const TrackWorkspaceContext = createContext<TrackWorkspaceValue | null>(null);

export function useTrackWorkspace(): TrackWorkspaceValue {
  const ctx = useContext(TrackWorkspaceContext);
  if (!ctx) {
    throw new Error("useTrackWorkspace must be used within a TrackWorkspaceContext provider");
  }
  return ctx;
}
