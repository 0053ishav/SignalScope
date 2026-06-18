import { getTrack } from "@/services/musixmatch";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const track = await getTrack(id);

    return NextResponse.json(track);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch track",
      },
      {
        status: 500,
      }
    );
  }
}