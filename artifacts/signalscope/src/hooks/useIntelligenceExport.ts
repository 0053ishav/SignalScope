import { useCallback } from "react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import {
  collectIntelligence,
  toJson,
  toMarkdown,
  exportSlug,
} from "@/lib/exportIntelligence";
import { triggerPrintReport } from "@/components/workspace/PrintReport";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Shared export actions used by BOTH the header Export control and the sidebar
 * Export entry, so every surface produces the identical complete-intelligence
 * output. Each format is assembled from the single `collectIntelligence`
 * object, which omits sections with no real data.
 */
export function useIntelligenceExport() {
  const ctx = useTrackWorkspace();

  const exportJson = useCallback(() => {
    const data = collectIntelligence(ctx);
    download(`signalscope-${exportSlug(data)}.json`, toJson(data), "application/json");
  }, [ctx]);

  const exportMarkdown = useCallback(() => {
    const data = collectIntelligence(ctx);
    download(`signalscope-${exportSlug(data)}.md`, toMarkdown(data), "text/markdown");
  }, [ctx]);

  const exportPdf = useCallback(() => {
    // Renders the dedicated #print-report doc on demand, then opens the print
    // dialog — the print stylesheet reveals only that subtree. Rendering on
    // demand avoids permanently duplicating the report in the DOM.
    triggerPrintReport();
  }, []);

  return { exportJson, exportMarkdown, exportPdf };
}
