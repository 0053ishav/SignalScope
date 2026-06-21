import { ShieldCheck } from "lucide-react";
import { clamp, scoreBand, type KpiMeta } from "@/lib/intelligence";

interface Props {
  meta: KpiMeta;
  value: number;
  confidence: number;
}

export default function MetricCard({ meta, value, confidence }: Props) {
  const Icon = meta.icon;
  const v = clamp(value);
  return (
    <div className="p-5 rounded-2xl border border-border bg-card flex flex-col" data-export-kpi={meta.key}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{meta.title}</h3>
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{v}</span>
        <span className="text-sm text-muted-foreground">/100</span>
        <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {scoreBand(v)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary mt-3 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, backgroundColor: meta.ring }} />
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-snug">{meta.description}</p>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/60">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span className="text-[11px] text-muted-foreground">Confidence {clamp(confidence)}%</span>
      </div>
    </div>
  );
}
