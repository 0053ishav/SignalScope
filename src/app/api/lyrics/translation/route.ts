import { NextRequest, NextResponse } from "next/server";
import { getLyricsTranslation } from "@/services/musixmatch";

export async function GET(
  request: NextRequest
) {
  const searchParams =
    request.nextUrl.searchParams;

  const commontrackId =
    searchParams.get("commontrackId");

  const language =
    searchParams.get("language");

  if (!commontrackId || !language) {
    return NextResponse.json(
      {
        error: "Missing params",
      },
      {
        status: 400,
      }
    );
  }

  const translation =
    await getLyricsTranslation(
      commontrackId,
      language
    );
  return NextResponse.json({
    translation,
  });
}