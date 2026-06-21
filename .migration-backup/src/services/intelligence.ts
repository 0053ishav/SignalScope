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
        });

    const text =
        response.text ?? "{}";

    let parsed;

    try {
        const cleaned =
            text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

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

    return IntelligenceSchema.parse(
        parsed
    );
}