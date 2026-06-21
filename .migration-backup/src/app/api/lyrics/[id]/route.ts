import { NextResponse } from "next/server";
import { getLyrics } from "@/services/musixmatch";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lyrics = await getLyrics(id);

    return NextResponse.json(lyrics);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load lyrics" },
      { status: 500 }
    );
  }
}