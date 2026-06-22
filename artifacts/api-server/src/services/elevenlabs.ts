/**
 * ElevenLabs text-to-speech client.
 *
 * Auth: `xi-api-key` header. Configuration comes from two secrets:
 *   - ELEVENLABS_API_KEY   — account API key
 *   - ELEVENLABS_VOICE_ID  — the voice used for the briefing
 *
 * Every network/shape failure is swallowed into a null result so the route can
 * degrade gracefully — ElevenLabs must NEVER throw up the stack and break the
 * workspace. When the key/voice are absent the service reports "not configured"
 * and the route returns an honest `unavailable` status.
 */

const BASE_URL = "https://api.elevenlabs.io/v1";
const DEFAULT_MODEL = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

function apiKey(): string | undefined {
  return process.env.ELEVENLABS_API_KEY || undefined;
}

function voiceId(): string | undefined {
  return process.env.ELEVENLABS_VOICE_ID || undefined;
}

/** Both the API key and a voice id are required to produce a briefing. */
export function isElevenLabsConfigured(): boolean {
  return Boolean(apiKey() && voiceId());
}

export function getConfiguredVoiceId(): string | undefined {
  return voiceId();
}

export interface SpeechResult {
  /** Base64-encoded audio bytes. */
  audio: string;
  mimeType: string;
  voiceId: string;
}

/**
 * Convert a script to speech. Returns null on any failure (missing config,
 * network error, non-2xx, empty body) so the caller can degrade gracefully.
 */
export async function generateSpeech(script: string): Promise<SpeechResult | null> {
  const key = apiKey();
  const voice = voiceId();
  if (!key || !voice) return null;

  const text = script.trim();
  if (!text) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/text-to-speech/${encodeURIComponent(voice)}?output_format=${DEFAULT_OUTPUT_FORMAT}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );

    if (!res.ok) {
      console.error("ElevenLabs TTS failed", res.status, await res.text().catch(() => ""));
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (!arrayBuffer.byteLength) return null;

    return {
      audio: Buffer.from(arrayBuffer).toString("base64"),
      mimeType: res.headers.get("content-type") || "audio/mpeg",
      voiceId: voice,
    };
  } catch (error) {
    console.error("ElevenLabs TTS error", error);
    return null;
  }
}

/**
 * Best-effort lookup of the configured voice's human name for the UI badge.
 * Returns null on any failure — the UI falls back to a generic label.
 */
export async function getVoiceName(): Promise<string | null> {
  const key = apiKey();
  const voice = voiceId();
  if (!key || !voice) return null;

  try {
    const res = await fetch(`${BASE_URL}/voices/${encodeURIComponent(voice)}`, {
      headers: { "xi-api-key": key, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { name?: string };
    return data?.name?.trim() || null;
  } catch {
    return null;
  }
}
