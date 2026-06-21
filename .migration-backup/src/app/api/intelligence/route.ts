import { NextRequest, NextResponse } from "next/server";

import { generateIntelligenceReport } from "@/services/intelligence";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

          console.log(
      "intelligence request received"
    );


    
    const {
      track,
      lyrics,
      richSync,
      analysis,
    } = body;

    if (!track) {
      return NextResponse.json(
        {
          error:
            "Track data is required",
        },
        {
          status: 400,
        }
      );
    }

    const report =
      await generateIntelligenceReport({
        track,
        lyrics,
        richSync,
        analysis,
      });

    return NextResponse.json(
      report
    );
  } catch (error) {
    console.error(
      "Intelligence Route Error",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown Error",
      },
      {
        status: 500,
      }
    );
  }
}