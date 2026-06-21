import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function WorkspacePage({ id, title, description, children }: Props) {
  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar"
      data-report-section={id}
    >
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>}
        </div>
        {children}
        <div className="pb-6" />
      </div>
    </div>
  );
}
