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

import { parseRichSync } from "@/lib/richsync/parseRichSync";

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

// Identity / emotional lexicons for RichSync salience scoring. These MUST stay
// in sync with the frontend mirror in
// `artifacts/signalscope/src/lib/intelligence.ts` (IDENTITY_WORDS / EMOTIONAL_WORDS)
// so the displayed timeline matches the moments fed into report generation.
const IDENTITY_WORDS = ["i", "me", "my", "we", "our", "us", "mine"];
const EMOTIONAL_WORDS = [
  "love",
  "pain",
  "dream",
  "hope",
  "alone",
  "home",
  "heart",
  "life",
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function extractRichSyncMoments(
  lines: RichSyncLine[]
): string[] {
  const scored = lines.map((line) => {
    const tokens = tokenize(line.x);
    const identityHits = tokens.filter((t) =>
      IDENTITY_WORDS.includes(t)
    ).length;
    const emotionalHits = tokens.filter((t) =>
      EMOTIONAL_WORDS.includes(t)
    ).length;
    const isNarrative = line.x.length > 40;

    const score =
      identityHits * 2 + emotionalHits * 2 + (isNarrative ? 1 : 0);

    return { text: line.x, ts: line.ts, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => `${formatTime(item.ts)} - ${item.text}`);
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

  // The frontend forwards the raw Musixmatch RichSync payload, which is an
  // object carrying a JSON-encoded `richsync_body` string. Parse it so the
  // timing moments actually populate (older code only handled pre-parsed
  // arrays, silently dropping RichSync entirely).
  let richSyncLines: RichSyncLine[] = [];

  if (Array.isArray(richSync)) {
    richSyncLines = richSync;
  } else if (
    richSync &&
    typeof richSync === "object" &&
    typeof (richSync as { richsync_body?: unknown }).richsync_body === "string"
  ) {
    richSyncLines = parseRichSync(
      (richSync as { richsync_body: string }).richsync_body
    );
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