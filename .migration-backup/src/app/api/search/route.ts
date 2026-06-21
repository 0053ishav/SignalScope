import { searchTracks } from "@/services/musixmatch";
import { NextResponse } from "next/server";

export async function GET(
  request: Request
) {
  const { searchParams } = new URL(
    request.url
  );

  const query =
    searchParams.get("q") ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const tracks =
      await searchTracks(query);
// console.log("tracks: ", tracks)

    return NextResponse.json(tracks);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}