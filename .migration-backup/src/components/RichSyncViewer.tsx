import { LyricSegment } from "@/types/music";
import { log } from "console";

interface RichSyncViewerProps {
  segments: LyricSegment[];
}

export default function RichSyncViewer({
  segments,
}: RichSyncViewerProps) {
  if (!segments.length) {
    return null;
  }
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        RichSync Timeline
      </h2>

      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
        {segments.map((segment, index) => (
          <div
            key={`${segment.startTime}-${index}`}
            className="rounded-lg border border-border p-3"
          >
            <p className="text-xs text-violet-400">
              {segment.startTime.toFixed(2)}s →{" "}
              {segment.endTime.toFixed(2)}s
            </p>

            <p className="mt-1 text-sm">
              {segment.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}