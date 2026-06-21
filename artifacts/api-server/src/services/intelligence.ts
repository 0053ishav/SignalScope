import { gemini, GEMINI_MODEL } from "./gemini";

import { buildIntelligencePrompt } from "@/lib/intelligence/prompt";

import { deriveSignals } from "@/lib/intelligence/deriveSignals";

import { extractSongSignals } from "@/lib/intelligence/signals";

import {
    IntelligenceSchema,
    type IntelligenceResponse,
} from "@/lib/intelligence/schema";

import { buildFallbackReport } from "@/lib/intelligence/fallback";

export type ReportSource = "gemini" | "fallback";

export interface GeneratedReport {
    report: IntelligenceResponse;
    source: ReportSource;
}

/**
 * Generate an intelligence report. Tries Gemini first; if Gemini fails for any
 * reason (quota, network, invalid JSON), falls back to the deterministic
 * ontology pipeline so the workspace never appears broken. Both paths return
 * only real, signal-derived data.
 */
export async function generateIntelligenceReport(
    input: {
        track: unknown;
        lyrics: unknown;
        richSync: unknown;
        analysis: unknown;
    }
): Promise<GeneratedReport> {
    const songSignals =
        extractSongSignals(input);

    const derivedSignals =
        deriveSignals(
            songSignals
        );

    try {
        const prompt =
            buildIntelligencePrompt(
                songSignals,
                derivedSignals
            );

        const response =
            await gemini.models.generateContent({
                model: GEMINI_MODEL,

                contents: prompt,

                config: {
                    responseMimeType:
                        "application/json",
                },
            });

        const text =
            response.text ?? "{}";

        let cleaned =
            text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

        const firstBrace =
            cleaned.indexOf("{");

        const lastBrace =
            cleaned.lastIndexOf("}");

        if (
            firstBrace !== -1 &&
            lastBrace !== -1 &&
            lastBrace > firstBrace
        ) {
            cleaned =
                cleaned.slice(
                    firstBrace,
                    lastBrace + 1
                );
        }

        const parsed =
            JSON.parse(cleaned);

        if (
            parsed &&
            Array.isArray(
                parsed.platformFit
            )
        ) {
            parsed.platformFit =
                parsed.platformFit.map(
                    (entry: any) => ({
                        ...entry,
                        score:
                            normalizeScore(
                                entry?.score
                            ),
                    })
                );
        }

        return {
            report: IntelligenceSchema.parse(parsed),
            source: "gemini",
        };
    } catch (error) {
        console.error(
            "Gemini generation failed, using fallback analysis",
            error instanceof Error ? error.message : error
        );

        return {
            report: buildFallbackReport(
                songSignals,
                derivedSignals
            ),
            source: "fallback",
        };
    }
}

function normalizeScore(
    value: unknown
): "High" | "Medium" | "Low" {
    const text = String(
        value ?? ""
    ).toLowerCase();

    if (text.includes("high")) {
        return "High";
    }

    if (text.includes("low")) {
        return "Low";
    }

    return "Medium";
}