import type { ReactNode } from "react";
import { BrainCircuit, AlertCircle, RefreshCw } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import type { IntelligenceReport } from "@/types/intelligence";

interface Props {
  children: (report: IntelligenceReport) => ReactNode;
}

export default function ReportGate({ children }: Props) {
  const { report, reportLoading, reportError, regenerate } = useTrackWorkspace();

  if (reportLoading || (!report && !reportError)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <BrainCircuit className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Synthesizing Intelligence</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          Analyzing semantic meaning, mood metadata, cultural resonance, and platform mechanics…
        </p>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mb-4" />
        <h2 className="text-xl font-bold tracking-tight mb-2">Analysis Failed</h2>
        <p className="text-muted-foreground max-w-md text-sm mb-6">{reportError}</p>
        <button
          onClick={regenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!report) return null;
  return <>{children(report)}</>;
}
