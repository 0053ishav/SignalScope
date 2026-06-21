import { NextResponse } from "next/server";

import {
  getTrack,
  getLyrics,
  getRichSync,
  getAnalysis,
} from "@/services/musixmatch";

import { parseRichSync } from "@/lib/richsync/parseRichSync";

import { extractSongSignals } from "@/lib/intelligence/signals";
import { log } from "console";

export async function GET(
  _: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  const track = await getTrack(id);

  const lyrics = await getLyrics(
    String(track.commontrack_id)
  );

  const richsync =
    await getRichSync(
      String(track.commontrack_id)
    );

  const analysis =
    await getAnalysis(
      String(track.commontrack_id)
    );
  const signals =
    extractSongSignals({
      track,
      lyrics,
      richSync: richsync?.richsync_body
        ? parseRichSync(
            richsync.richsync_body
          )
        : [],
      analysis,
    });

  return NextResponse.json(
    analysis
  );
}