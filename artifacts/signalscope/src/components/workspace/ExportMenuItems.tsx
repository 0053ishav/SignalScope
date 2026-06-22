import { Printer, Download, FileText } from "lucide-react";
import { useIntelligenceExport } from "@/hooks/useIntelligenceExport";

/**
 * The shared set of export actions (PDF, Markdown, JSON) used by BOTH the header
 * Export control and the sidebar Export entry, so every surface offers the
 * identical complete-intelligence export flow.
 */
export function ExportMenuItems({ onAfter }: { onAfter?: () => void }) {
  const { exportPdf, exportMarkdown, exportJson } = useIntelligenceExport();

  const run = (fn: () => void) => () => {
    fn();
    onAfter?.();
  };

  return (
    <>
      <ExportItem icon={Printer} label="Export PDF" sub="Print-ready report" onClick={run(exportPdf)} />
      <ExportItem icon={FileText} label="Export Markdown" sub="Full intelligence (.md)" onClick={run(exportMarkdown)} />
      <ExportItem icon={Download} label="Export JSON" sub="Structured data (.json)" onClick={run(exportJson)} />
    </>
  );
}

function ExportItem({
  icon: Icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-left text-foreground hover:bg-secondary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
      <span className="flex flex-col">
        <span>{label}</span>
        {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
      </span>
    </button>
  );
}
