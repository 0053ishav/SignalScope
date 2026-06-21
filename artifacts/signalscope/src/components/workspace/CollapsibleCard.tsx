import { useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleCard({ title, icon: Icon, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left px-5 py-4 group cursor-pointer hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
}
