import { NextResponse } from "next/server";
import { getAnalysis } from "@/services/musixmatch";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await getAnalysis(id);

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}