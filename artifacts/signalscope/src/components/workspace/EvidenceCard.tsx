import { Quote } from "lucide-react";
import { ACCENTS, type AccentKey } from "@/lib/intelligence";

interface Props {
  title: string;
  items: string[];
  accent: AccentKey;
  emptyHint?: string;
}

export default function EvidenceCard({ title, items, accent, emptyHint }: Props) {
  const a = ACCENTS[accent];
  const hasItems = items?.length > 0;

  if (!hasItems && !emptyHint) return null;

  return (
    <div className={`rounded-xl border ${a.border} ${a.bg} p-4`}>
      <div className={`flex items-center gap-2 mb-3 ${a.text}`}>
        <Quote className="w-4 h-4" />
        <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      {hasItems ? (
        <div className="space-y-2">
          {items.map((e, i) => (
            <div key={i} className={`text-sm text-foreground/90 border-l-2 ${a.bar} pl-3 py-0.5`}>
              {e}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      )}
    </div>
  );
}
