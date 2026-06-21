import { LyricSegment, RichSyncLine } from "@/types/music";

export function normalizeRichSync(
  lines: RichSyncLine[]
): LyricSegment[] {
  return lines.map((line) => ({
    startTime: line.ts,
    endTime: line.te,
    text: line.x,
  }));
}