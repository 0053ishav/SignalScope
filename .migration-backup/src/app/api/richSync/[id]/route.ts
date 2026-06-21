import { NextResponse } from "next/server";
import { getRichSync } from "@/services/musixmatch";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const richsync = await getRichSync(id);

  return NextResponse.json(richsync);
}