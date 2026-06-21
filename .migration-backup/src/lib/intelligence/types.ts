export interface ThemeSignal {
  theme: string;
  quotes: string[];
}

export interface PlatformFit {
  platform:
    | "TikTok"
    | "Instagram Reels"
    | "YouTube Shorts"
    | "Spotify Playlists"
    | "Live Events";

  score: "High" | "Medium" | "Low";

  reason?: string;
}

export interface SignalScores {
  identity: number;
  emotion: number;
  storytelling: number;
  virality: number;
}

export interface SongSignals {
  artist: string;
  title: string;
  album?: string;
  genre?: string;

  lyrics?: string;

  meaning?: string;

  moods: string[];

  themes: ThemeSignal[];

  richSyncMoments: string[];

  moderationFlags: string[];

  explicitContent: boolean;
}

export interface IntelligenceReport {
  summary: string;

  audienceArchetypes: string[];

  emotionalPositioning: string[];

  culturalPositioning: string[];

  contentOpportunities: string[];

  growthRecommendations: string[];

  platformFit: PlatformFit[];
}

export interface ExtractionInput {
  track: unknown;
  lyrics: unknown;
  richSync: unknown;
  analysis: unknown;
}

export interface DerivedSignals {
  emotions: string[];

  audienceArchetypes: string[];

  culturalSignals: string[];

  platformBias: string[];

  contentAngles: string[];

  contentOpportunities: string[],

  confidenceScore: number;
}

export interface FallbackSignalResponse {
  moods: string[];

  themes: {
    theme: string;
    quotes: string[];
  }[];

  meaning: string;
}