import { gemini, GEMINI_MODEL } from "./gemini";

import { buildIntelligencePrompt } from "@/lib/intelligence/prompt";

import { deriveSignals } from "@/lib/intelligence/deriveSignals";

import { extractSongSignals } from "@/lib/intelligence/signals";

import {
    IntelligenceSchema,
} from "@/lib/intelligence/schema";

export async function generateIntelligenceReport(
    input: {
        track: unknown;
        lyrics: unknown;
        richSync: unknown;
        analysis: unknown;
    }
) {
    const songSignals =
        extractSongSignals(input);

    const derivedSignals =
        deriveSignals(
            songSignals
        );

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

    let parsed;

    try {
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

        parsed =
            JSON.parse(cleaned);
    } catch (error) {
        console.error(
            "Gemini invalid JSON",
            text
        );

        throw new Error(
            "Failed to parse Gemini response"
        );
    }

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

    return IntelligenceSchema.parse(
        parsed
    );
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