import { z } from "zod";

export const IntelligenceSchema =
  z.object({
    summary: z.string(),

    audienceArchetypes:
      z.array(z.string()),

    emotionalPositioning:
      z.array(z.string()),

    culturalPositioning:
      z.array(z.string()),

    contentOpportunities:
      z.array(z.string()),

    growthRecommendations:
      z.array(z.string()),

    platformFit: z.array(
      z.object({
        platform:
          z.string(),

        score: z.enum([
          "High",
          "Medium",
          "Low",
        ]),

        reason:
          z.string(),
      })
    ),

    scores: z.object({
      audience: z.number(),
      emotion: z.number(),
      virality: z.number(),
      growth: z.number(),
    }),

    confidence: z.number(),

    viralDrivers: z.array(z.string()),

    evidence: z.object({
      audience: z.array(z.string()),
      emotion: z.array(z.string()),
      culture: z.array(z.string()),
    }),

    artistActions: z.array(
      z.string()
    ),

  });

export type IntelligenceResponse =
  z.infer<
    typeof IntelligenceSchema
  >;