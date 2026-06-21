import { Check, Minus } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import { getConfidenceDrivers } from "@/lib/intelligence";
import { Gauge } from "lucide-react";

/**
 * Explains WHY the confidence score is what it is, by listing the real source
 * inputs available for this track. Present = the data genuinely exists.
 */
export default function ConfidenceDrivers() {
  const { analysis, segments, lyrics, confidence } = useTrackWorkspace();
  const hasLyrics = Boolean(lyrics?.lyrics_body);
  const drivers = getConfidenceDrivers(analysis, segments, hasLyrics);
  const present = drivers.filter((d) => d.present).length;

  return (
    <IntelligenceCard title="Why this confidence?" icon={Gauge}>
      <p className="text-xs text-muted-foreground mb-4">
        Confidence is <span className="font-semibold text-foreground">{confidence}%</span>, grounded in{" "}
        <span className="font-semibold text-foreground">{present} of {drivers.length}</span> available signal sources.
      </p>
      <ul className="space-y-2.5">
        {drivers.map((d) => {
          const Icon = d.icon;
          return (
            <li key={d.label} className="flex items-start gap-3">
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  d.present ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground"
                }`}
              >
                {d.present ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-medium flex items-center gap-1.5 ${d.present ? "text-foreground" : "text-muted-foreground"}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {d.label}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">{d.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </IntelligenceCard>
  );
}
