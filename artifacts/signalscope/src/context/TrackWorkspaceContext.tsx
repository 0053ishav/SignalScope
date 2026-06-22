import { createContext, useContext } from "react";
import type { TrackDetails, LyricsResponse, AnalysisResponse, LyricSegment } from "@/types/music";
import type { IntelligenceReport, ReportSource } from "@/types/intelligence";
import type { SongstatsTrackData, SongstatsSignals, SongstatsUiStatus } from "@/types/songstats";
import type { JamBaseLiveData, JamBaseSignals, JamBaseUiStatus } from "@/types/jambase";

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

  /** JamBase live/touring intelligence — loaded independently of the AI report. */
  jambase: JamBaseLiveData | null;
  jambaseSignals: JamBaseSignals | null;
  jambaseStatus: JamBaseUiStatus;

  /** Executive Audio Briefing (ElevenLabs TTS) — generated once on demand. */
  audioBriefing: AudioBriefing | null;
  audioStatus: AudioBriefingStatus;
  requestAudioBriefing: () => void;
}

export type AudioBriefingStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "error";

export interface AudioBriefing {
  /** Object URL for the generated audio blob. */
  url: string;
  mimeType: string;
  voiceName?: string;
}

export const TrackWorkspaceContext = createContext<TrackWorkspaceValue | null>(null);

export function useTrackWorkspace(): TrackWorkspaceValue {
  const ctx = useContext(TrackWorkspaceContext);
  if (!ctx) {
    throw new Error("useTrackWorkspace must be used within a TrackWorkspaceContext provider");
  }
  return ctx;
}
