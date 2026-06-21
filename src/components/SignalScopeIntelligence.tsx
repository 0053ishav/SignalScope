"use client";

import { AnalysisResponse, LyricsResponse, TrackDetails } from "@/types/music";
import { useState } from "react";

interface PlatformFit {
  platform: string;
  score: "High" | "Medium" | "Low";
  reason: string;
}

interface IntelligenceReport {
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
}

interface Props {
  track: TrackDetails;
  lyrics: LyricsResponse | null;
  richSync: unknown;
  analysis: AnalysisResponse;
}

export default function SignalScopeIntelligence({
  track,
  lyrics,
  richSync,
  analysis,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [report, setReport] =
    useState<IntelligenceReport | null>(
      null
    );

  async function generate() {
    try {
      setLoading(true);
      setError("");

  const response = await fetch(
  "/api/intelligence",
  {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",
    },

    body: JSON.stringify({
      track,
      lyrics,
      richSync,
      analysis,
    }),
  }
);

if (!response.ok) {
  throw new Error(
    "Failed to generate intelligence"
  );
}

const data =
  await response.json();

      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unknown Error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!report) {
    return (
      <section className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">
              SignalScope Intelligence
            </h3>

            <p className="mt-1 text-sm text-muted">
              AI-powered audience intelligence
              generated from lyrics,
              themes, moods and cultural
              signals.
            </p>
          </div>

          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            AI
          </span>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="rounded-xl bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500 disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? "Generating Intelligence..."
              : "Generate Intelligence"}
          </button>
        </div>
      </section>
    );
  }

 return (
  <section className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-semibold">
          SignalScope Intelligence
        </h3>

        <p className="mt-1 text-sm text-muted">
          AI-powered audience intelligence generated from lyrics,
          themes, moods and cultural signals.
        </p>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="rounded-lg border border-violet-500/20 px-3 py-2 text-sm cursor-pointer"
      >
        {loading
          ? "Generating..."
          : "Regenerate"}
      </button>
    </div>

    {/* Summary */}

    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted">
        Executive Summary
      </p>

      <p className="mt-3 leading-7">
        {report.summary}
      </p>
    </div>

    {/* Scores */}

    <div className="mt-6 grid gap-4 md:grid-cols-4">
      <ScoreCard
        label="Audience"
        value={report.scores.audience}
      />

      <ScoreCard
        label="Emotion"
        value={report.scores.emotion}
      />

      <ScoreCard
        label="Virality"
        value={report.scores.virality}
      />

      <ScoreCard
        label="Growth"
        value={report.scores.growth}
      />
    </div>

    {/* Confidence */}

    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          Confidence Score
        </span>

        <span className="text-lg font-bold">
          {report.confidence}/100
        </span>
      </div>
    </div>

    {/* Core Insights */}

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <SectionCard
        title="Audience Archetypes"
        items={report.audienceArchetypes}
      />

      <SectionCard
        title="Emotional Positioning"
        items={report.emotionalPositioning}
      />

      <SectionCard
        title="Cultural Positioning"
        items={report.culturalPositioning}
      />

      <SectionCard
        title="Growth Recommendations"
        items={report.growthRecommendations}
      />
    </div>

    {/* Viral Drivers */}

    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <p className="font-medium">
        Viral Drivers
      </p>

      <ul className="mt-4 space-y-2">
        {report.viralDrivers.map(
          (item) => (
            <li key={item}>
              • {item}
            </li>
          )
        )}
      </ul>
    </div>

    {/* Content Opportunities */}

    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <p className="font-medium">
        Content Opportunities
      </p>

      <ul className="mt-4 space-y-2">
        {report.contentOpportunities.map(
          (item) => (
            <li key={item}>
              • {item}
            </li>
          )
        )}
      </ul>
    </div>

    {/* Artist Actions */}

    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <p className="font-medium">
        Artist Actions
      </p>

      <ul className="mt-4 space-y-2">
        {report.artistActions.map(
          (item) => (
            <li key={item}>
              • {item}
            </li>
          )
        )}
      </ul>
    </div>

    {/* Evidence */}

    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <SectionCard
        title="Audience Evidence"
        items={report.evidence.audience}
      />

      <SectionCard
        title="Emotion Evidence"
        items={report.evidence.emotion}
      />

      <SectionCard
        title="Culture Evidence"
        items={report.evidence.culture}
      />
    </div>

    {/* Platform Fit */}

    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <p className="font-medium">
        Platform Fit
      </p>

      <div className="mt-4 space-y-4">
        {report.platformFit.map(
          (platform) => (
            <div
              key={platform.platform}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {platform.platform}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    platform.score ===
                    "High"
                      ? "bg-green-500/10 text-green-400"
                      : platform.score ===
                          "Medium"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {platform.score}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted">
                {platform.reason}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  </section>
);
}

function SectionCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-medium">
        {title}
      </p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item}>
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}