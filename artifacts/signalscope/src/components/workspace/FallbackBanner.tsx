import { Info } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";

/**
 * Honest provenance banner. Shown only when the report was produced by the
 * ontology-derived fallback (Gemini unavailable). No metrics are fabricated —
 * fallback scores come from real signal coverage.
 */
export default function FallbackBanner() {
  const { reportSource, regenerate, reportLoading } = useTrackWorkspace();
  if (reportSource !== "fallback") return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3 flex-1">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Derived intelligence</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            AI synthesis was unavailable, so this report was built directly from Musixmatch signals
            (lyrics, moods, themes & RichSync) using the ontology engine. Scores reflect real signal
            coverage — nothing is fabricated.
          </p>
        </div>
      </div>
      <button
        onClick={regenerate}
        disabled={reportLoading}
        className="shrink-0 self-start sm:self-center text-xs font-medium px-3 py-1.5 rounded-md border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Retry AI synthesis
      </button>
    </div>
  );
}
