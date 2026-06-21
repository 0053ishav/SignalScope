import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
  children: ReactNode;
}

export default function IntelligenceCard({
  title,
  icon: Icon,
  iconClassName = "text-primary",
  className = "",
  children,
}: Props) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className={`w-4 h-4 ${iconClassName}`} />}
          {title && <h3 className="font-semibold text-foreground">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}
