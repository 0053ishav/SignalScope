---
name: Gemini intelligence JSON contract
description: Why the SignalScope /api/intelligence Gemini call needs forced JSON + enum normalization
---

# Gemini intelligence response handling

The `POST /api/intelligence` endpoint asks Gemini (gemini-2.5-flash) for a JSON
report validated by a Zod schema. Two failure modes break it if unguarded:

1. **Raw model text is not parseable JSON.** Prompt-only "return JSON" is
   unreliable. Fix: pass `config: { responseMimeType: "application/json" }` to
   `generateContent`, and as a fallback slice the text between the first `{` and
   last `}` before `JSON.parse`.

2. **Enum drift.** `platformFit[].score` must be exactly `High|Medium|Low`, but
   the model returns variants (casing, "High Fit", etc.), causing Zod 500s.
   Fix: normalize each score (substring match → High/Low, else Medium) before
   `IntelligenceSchema.parse`.

**Why it matters now:** the redesigned workspace (IntelligenceView) auto-generates
the report on track-page load, so any 500 here makes the whole center pane hang on
"Synthesizing Intelligence". The old UI hid this behind a manual button.

**How to apply:** if you add new enum-constrained fields to IntelligenceSchema,
either add a matching Gemini `responseSchema` or a normalizer, or expect schema
500s. Generation takes ~15-25s; that loading state is normal.
