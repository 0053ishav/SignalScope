import {
  AnalysisResponse,
  LyricsResponse,
  RichSyncLine,
  TrackDetails,
} from "@/types/music";

import {
  ExtractionInput,
  SongSignals,
  ThemeSignal,
} from "./types";

export function extractThemes(
  analysis: AnalysisResponse | null
): ThemeSignal[] {
  return (
    analysis?.themes?.main_themes?.map(
      (theme) => ({
        theme: theme.theme,
        quotes: theme.quotes ?? [],
      })
    ) ?? []
  );
}

export function extractMoods(
  analysis: AnalysisResponse | null
): string[] {
  return analysis?.moods?.main_moods ?? [];
}

export function extractMeaning(
  analysis: AnalysisResponse | null
): string {
  return (
    analysis?.meaning?.explanation ??
    ""
  );
}

export function extractModerationFlags(
  analysis: AnalysisResponse | null
): string[] {
  if (
    !analysis?.moderation?.categories
  ) {
    return [];
  }

  return analysis.moderation.categories
    .filter(
      (category) =>
        category.is_present
    )
    .map(
      (category) =>
        category.category
    );
}

function formatTime(
  seconds: number
) {
  const mins = Math.floor(
    seconds / 60
  );

  const secs = Math.floor(
    seconds % 60
  );

  return `${mins}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function extractRichSyncMoments(
  lines: RichSyncLine[]
): string[] {
  const identityWords = [
    "i",
    "me",
    "my",
    "we",
    "our",
  ];

  const emotionalWords = [
    "love",
    "pain",
    "dream",
    "hope",
    "alone",
    "home",
    "heart",
    "life",
  ];

  const scored = lines.map(
    (line) => {
      const text =
        line.x.toLowerCase();

      let score = 0;

      if (line.x.length > 40)
        score += 1;

      identityWords.forEach(
        (word) => {
          if (
            text.includes(word)
          )
            score += 2;
        }
      );

      emotionalWords.forEach(
        (word) => {
          if (
            text.includes(word)
          )
            score += 2;
        }
      );

      return {
        text: line.x,
        ts: line.ts,
        score,
      };
    }
  );

  return scored
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, 5)
    .map(
      (item) =>
        `${formatTime(
          item.ts
        )} - ${item.text}`
    );
}

export function extractSongSignals({
  track,
  lyrics,
  richSync,
  analysis,
}: ExtractionInput): SongSignals {
  const trackData =
    track as TrackDetails;

  const lyricsData =
    lyrics as LyricsResponse;

let richSyncLines: RichSyncLine[] =
  [];

if (Array.isArray(richSync)) {
  richSyncLines = richSync;
}
  const analysisData =
    analysis as AnalysisResponse;

  return {
    artist:
      trackData.artist_name,
    title:
      trackData.track_name,
    album:
      trackData.album_name,

    genre:
      trackData.primary_genres?.music_genre_list
        ?.map(
          (g) =>
            g.music_genre
              .music_genre_name
        )
        .join(", ") ?? "",

    lyrics:
      lyricsData?.lyrics_body ??
      "",

    meaning:
      extractMeaning(
        analysisData
      ),

    moods:
      extractMoods(
        analysisData
      ),

    themes:
      extractThemes(
        analysisData
      ),

    richSyncMoments:
      extractRichSyncMoments(
        richSyncLines
      ),

    moderationFlags:
      extractModerationFlags(
        analysisData
      ),

    explicitContent:
      Boolean(
        trackData.explicit
      ),
  };
}