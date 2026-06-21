import { NextResponse } from "next/server";

import { generateIntelligenceReport } from "@/services/intelligence";

export async function GET() {
  try {
    const result =
      await generateIntelligenceReport({
        track: {
          artist_name:
            "Eminem",

          track_name:
            "Lose Yourself",

          album_name:
            "8 Mile",

          explicit: 1,

          primary_genres: {
            music_genre_list: [
              {
                music_genre: {
                  music_genre_name:
                    "Hip Hop",
                },
              },
            ],
          },
        },

        lyrics: {
          lyrics_body:
            `
Look, if you had one shot,
or one opportunity,
to seize everything you ever wanted...
`,
        },

        richSync: [
          {
            ts: 15,
            x: "You only get one shot",
          },

          {
            ts: 42,
            x: "Lose yourself in the music",
          },

          {
            ts: 78,
            x: "You can do anything",
          },
        ],

        analysis: {
          moods: {
            main_moods: [
              "empowerment",
              "inspiration",
            ],
          },

          themes: {
            main_themes: [
              {
                theme:
                  "ambition",

                quotes: [],
              },

              {
                theme:
                  "identity",

                quotes: [],
              },
            ],
          },

          meaning: {
            explanation:
              "A song about pursuing opportunity and overcoming fear.",
          },

          moderation: {
            categories: [],
          },
        },
      });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,

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