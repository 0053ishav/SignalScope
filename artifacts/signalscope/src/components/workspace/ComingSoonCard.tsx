import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";

interface Props {
  icon: LucideIcon;
  partner: string;
  description: string;
  sections: string[];
}

export default function ComingSoonCard({ icon: Icon, partner, description, sections }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" />
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
          <p className="text-xs text-muted-foreground mt-3">
            Will be powered by <span className="font-semibold text-foreground">{partner}</span>
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
        {sections.map((s) => (
          <div
            key={s}
            className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between opacity-60"
          >
            <span className="text-sm font-medium text-foreground">{s}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</span>
          </div>
        ))}
      </div>
    </div>
  );
}
