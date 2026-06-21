export interface PlatformFit {
  platform: string;
  score: "High" | "Medium" | "Low";
  reason: string;
}

export type ReportSource = "gemini" | "fallback";

export interface IntelligenceReport {
  summary: string;

  scores: {
    audience: number;
    emotion: number;
    virality: number;
    growth: number;
  };

  confidence: number;

  viralDrivers: string[];

  audienceArchetypes: string[];
  emotionalPositioning: string[];
  culturalPositioning: string[];

  evidence: {
    audience: string[];
    emotion: string[];
    culture: string[];
  };

  contentOpportunities: string[];
  growthRecommendations: string[];

  artistActions: string[];

  platformFit: PlatformFit[];

  /** Provenance metadata attached by the API (non-LLM fields). */
  source?: ReportSource;
  cached?: boolean;
}