import { SongSignals } from "./types";

export function calculateSignalScores(
  signals: SongSignals
) {
  const text = (
    signals.lyrics ?? ""
  ).toLowerCase();

  const identityWords = [
    "i",
    "me",
    "my",
    "we",
    "our",
  ];

  const emotionWords = [
    "love",
    "pain",
    "dream",
    "hope",
    "heart",
    "alone",
  ];

  const storytellingWords = [
    "remember",
    "when",
    "then",
    "yesterday",
    "before",
  ];

  function countMatches(
    words: string[]
  ) {
    return words.reduce(
      (count, word) =>
        count +
        (
          text.match(
            new RegExp(
              `\\b${word}\\b`,
              "g"
            )
          )?.length ?? 0
        ),
      0
    );
  }

  const identity =
    Math.min(
      countMatches(
        identityWords
      ) * 5,
      100
    );

  const emotion =
    Math.min(
      countMatches(
        emotionWords
      ) * 5,
      100
    );

  const storytelling =
    Math.min(
      countMatches(
        storytellingWords
      ) * 10,
      100
    );

  const virality =
    Math.min(
      signals.richSyncMoments
        .length * 20,
      100
    );

  return {
    identity,
    emotion,
    storytelling,
    virality,
  };
}