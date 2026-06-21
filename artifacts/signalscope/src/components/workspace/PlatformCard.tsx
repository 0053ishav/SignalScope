import type { PlatformFit } from "@/types/intelligence";
import { PlatformIcon } from "./PlatformIcon";

interface Props {
  fit: PlatformFit;
}

const SCORE_STYLES: Record<PlatformFit["score"], string> = {
  High: "bg-emerald-500/10 text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-destructive/10 text-destructive",
};

export default function PlatformCard({ fit }: Props) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-center mb-1.5">
        <span className="flex items-center gap-2 font-medium text-sm">
          <PlatformIcon platform={fit.platform} className="w-4 h-4 text-muted-foreground" />
          {fit.platform}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${SCORE_STYLES[fit.score]}`}>{fit.score} Fit</span>
      </div>
      {fit.reason && <p className="text-xs text-muted-foreground leading-relaxed">{fit.reason}</p>}
    </div>
  );
}
