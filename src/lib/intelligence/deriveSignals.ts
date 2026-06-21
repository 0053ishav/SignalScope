import {
    AUDIENCE_GRAPH,
    CULTURAL_GRAPH,
    MOOD_GRAPH,
    PLATFORM_GRAPH,
    THEME_GRAPH,
} from "./ontology";

import {
    DerivedSignals,
    SongSignals,
} from "./types";

export function deriveSignals(
    signals: SongSignals
): DerivedSignals {
    const emotions =
        new Set<string>();

    const audienceArchetypes =
        new Set<string>();

    const culturalSignals =
        new Set<string>();

    const platformBias =
        new Set<string>();

    const contentAngles =
        new Set<string>();

    const contentOpportunities =
        new Set<string>();

    let confidence = 0;

    /*
     * Mood Processing
     */
    signals.moods.forEach(
        (rawMood) => {
            const mood =
                rawMood.toLowerCase();

            const data =
                MOOD_GRAPH[
                mood as keyof typeof MOOD_GRAPH
                ];

            if (!data) return;

            confidence += 8;

            data.emotions?.forEach(
                (value) =>
                    emotions.add(value)
            );

            data.audiences?.forEach(
                (value) =>
                    audienceArchetypes.add(
                        value
                    )
            );

            data.culturalSignals?.forEach(
                (value) =>
                    culturalSignals.add(
                        value
                    )
            );

            data.platforms?.forEach(
                (value) =>
                    platformBias.add(value)
            );

            data.contentFormats?.forEach(
                (value) =>
                    contentOpportunities.add(
                        value
                    )
            );

        }
    );

    /*
     * Theme Processing
     */
    signals.themes.forEach(
        (themeObj) => {
            const theme =
                themeObj.theme.toLowerCase();

            const data =
                THEME_GRAPH[
                theme as keyof typeof THEME_GRAPH
                ];

            if (!data) return;

            confidence += 12;

            data.archetypes?.forEach(
                (value) =>
                    audienceArchetypes.add(
                        value
                    )
            );

            data.contentAngles?.forEach(
                (value) =>
                    contentAngles.add(
                        value
                    )
            );

            data.culturalSignals?.forEach(
                (value) =>
                    culturalSignals.add(
                        value
                    )
            );

            data.contentFormats?.forEach(
                (value) =>
                    contentOpportunities.add(
                        value
                    )
            );
        }
    );

    /*
     * Audience Graph Expansion
     */
    [...audienceArchetypes].forEach(
        (audience) => {
            const data =
                AUDIENCE_GRAPH[
                audience as keyof typeof AUDIENCE_GRAPH
                ];

            if (!data) return;

            data.interests?.forEach(
                (interest) => {
                    contentAngles.add(
                        interest
                    );

                    contentOpportunities.add(
                        `${interest} Content`
                    );
                }
            );
        }
    );

    /*
     * Cultural Expansion
     */
    [...culturalSignals].forEach(
        (signal) => {
            const data =
                CULTURAL_GRAPH[
                signal as keyof typeof CULTURAL_GRAPH
                ];

            if (!data) return;

            data.forEach(
                (item: string) =>
                    culturalSignals.add(
                        item
                    )
            );
        }
    );

    /*
     * Platform Expansion
     */
    [...platformBias].forEach(
        (platform) => {
            const data =
                PLATFORM_GRAPH[
                platform as keyof typeof PLATFORM_GRAPH
                ];

            if (!data) return;

            data.signals?.forEach(
                (signal) => {
                    contentAngles.add(signal);

                    contentOpportunities.add(
                        `${signal} Content`
                    );
                }
            );

            contentOpportunities.add(
                `${platform} Campaign`
            );

            contentOpportunities.add(
                `${platform} Challenge`
            );

        }
    );

    /*
     * RichSync Boost
     */
    if (
        signals.richSyncMoments
            .length > 0
    ) {
        confidence +=
            signals.richSyncMoments
                .length * 2;
    }

    /*
     * Meaning Boost
     */
    if (
        signals.meaning &&
        signals.meaning.length > 0
    ) {
        confidence += 15;
    }

    /*
     * Clamp
     */
    const confidenceScore =
        Math.min(
            Math.max(confidence, 0),
            100
        );

    if (emotions.size === 0) {
        emotions.add("General Emotional Appeal");
    }

    if (
        audienceArchetypes.size === 0
    ) {
        audienceArchetypes.add(
            "General Music Audience"
        );
    }

    if (
        platformBias.size === 0
    ) {
        platformBias.add(
            "Spotify Playlists"
        );
    }

    return {
        emotions: [
            ...emotions,
        ],

        audienceArchetypes: [
            ...audienceArchetypes,
        ],

        culturalSignals: [
            ...culturalSignals,
        ],

        platformBias: [
            ...platformBias,
        ],

        contentAngles: [
            ...contentAngles,
        ],

        contentOpportunities: [
            ...contentOpportunities,
        ],

        confidenceScore,
    };
}