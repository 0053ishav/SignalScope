import { RichSyncLine } from "@/types/music";

export function parseRichSync(
  richsyncBody: string
): RichSyncLine[] {
  try {
    return JSON.parse(richsyncBody);
  } catch {
    return [];
  }
}