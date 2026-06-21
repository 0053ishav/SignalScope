import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, className = "h-52" }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

export function EmptyChart() {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
      No data available
    </div>
  );
}
