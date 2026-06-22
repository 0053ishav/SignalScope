import { useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2, Headphones, AudioLines, AlertCircle } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Executive Audio Briefing control. On first activation it asks the shell to
 * generate (or fetch the cached) briefing; once ready it becomes a play/pause
 * control with elapsed/total duration and a voice badge. Honest "unavailable"
 * state when ElevenLabs is not configured — the workspace never breaks.
 */
export default function AudioBriefingButton() {
  const { audioBriefing, audioStatus, requestAudioBriefing } = useTrackWorkspace();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  // When a new briefing becomes ready, auto-play it once.
  useEffect(() => {
    if (audioStatus === "ready" && audioBriefing && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [audioStatus, audioBriefing]);

  if (audioStatus === "unavailable") {
    return (
      <span
        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-muted-foreground bg-secondary/60 border border-border"
        title="Audio briefing requires an ElevenLabs voice to be configured"
      >
        <Headphones className="w-3.5 h-3.5" />
        Audio unavailable
      </span>
    );
  }

  // Initial / loading / error states — single action button.
  if (audioStatus !== "ready" || !audioBriefing) {
    const loading = audioStatus === "loading";
    const error = audioStatus === "error";
    return (
      <button
        onClick={requestAudioBriefing}
        disabled={loading}
        title={error ? "Briefing failed — click to retry" : "Generate the executive audio briefing"}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : error ? (
          <AlertCircle className="w-4 h-4 text-amber-400" />
        ) : (
          <Headphones className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {loading ? "Generating…" : error ? "Retry briefing" : "Audio briefing"}
        </span>
      </button>
    );
  }

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-secondary border border-border">
      <audio
        ref={audioRef}
        src={audioBriefing.url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause briefing" : "Play briefing"}
        className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors cursor-pointer shrink-0"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {fmt(elapsed)} / {fmt(duration)}
      </span>
      <span
        className="hidden lg:inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground border-l border-border pl-2"
        title="Voice provided by ElevenLabs"
      >
        <AudioLines className="w-3 h-3" />
        {audioBriefing.voiceName || "ElevenLabs"}
      </span>
    </div>
  );
}
