import type { TrackDetails, LyricsResponse, AnalysisResponse } from "@/types/music";
import type { IntelligenceReport } from "@/types/intelligence";

export const TRACK = {
  track_id: 1001,
  track_name: "TRACK_NAME_MARKER",
  track_rating: 50,
  track_length: 215,
  track_isrc: "ISRC_MARKER",
  track_spotify_id: "SPOTIFY_MARKER",
  commontrack_id: 9009,
  artist_id: 7,
  artist_name: "ARTIST_NAME_MARKER",
  album_id: 3,
  album_name: "ALBUM_NAME_MARKER",
  instrumental: 0,
  explicit: 0,
  has_lyrics: 1,
  has_subtitles: 1,
  has_richsync: 1,
  num_favourite: 0,
  restricted: 0,
  updated_time: "2026-01-01T00:00:00Z",
  primary_genres: {
    music_genre_list: [
      {
        music_genre: {
          music_genre_id: 1,
          music_genre_parent_id: 0,
          music_genre_name: "GENRE_MARKER",
          music_genre_name_extended: "GENRE_MARKER",
          music_genre_vanity: "genre-marker",
        },
      },
    ],
  },
} as TrackDetails;

export const LYRICS: LyricsResponse = {
  lyrics_body: "LYRICS_BODY_MARKER",
  lyrics_language: "en",
  explicit: 0,
  lyrics_copyright: "COPYRIGHT_MARKER",
};

export const RICHSYNC = null;

export const ANALYSIS: AnalysisResponse = {
  meaning: { explanation: "MEANING_MARKER" },
  moods: { main_moods: ["MOOD_MARKER"] },
  themes: { main_themes: [{ theme: "THEME_MARKER", quotes: ["QUOTE_MARKER"] }] },
};

export const REPORT: IntelligenceReport = {
  summary: "EXEC_BRIEFING_MARKER",
  scores: { audience: 71, emotion: 64, virality: 58, growth: 80 },
  confidence: 77,
  viralDrivers: ["VIRAL_DRIVER_MARKER"],
  audienceArchetypes: ["ARCHETYPE_ALPHA_MARKER"],
  emotionalPositioning: ["EMOTION_POS_MARKER"],
  culturalPositioning: ["CULTURE_POS_MARKER"],
  evidence: {
    audience: ["AUDIENCE_EVIDENCE_MARKER"],
    emotion: ["EMOTION_EVIDENCE_MARKER"],
    culture: ["CULTURE_EVIDENCE_MARKER"],
  },
  contentOpportunities: ["CONTENT_OPP_MARKER"],
  growthRecommendations: ["GROWTH_REC_MARKER"],
  artistActions: ["ARTIST_ACTION_MARKER"],
  platformFit: [{ platform: "PLATFORM_TIKTOK_MARKER", score: "High", reason: "PLATFORM_REASON_MARKER" }],
};
