import { describe, it, expect } from "vitest";
import { deriveSourceHealth, type SourceHealthInputs, type SourceStatus } from "@/lib/intelligence";

const base: SourceHealthInputs = {
  reportLoading: false,
  reportSource: "gemini",
  reportError: "",
  songstatsStatus: "ok",
  jambaseStatus: "ok",
  audioStatus: "idle",
  audioAvailable: true,
};

function statusOf(name: string, inputs: SourceHealthInputs): SourceStatus {
  const entry = deriveSourceHealth(inputs).find((s) => s.name === name);
  if (!entry) throw new Error(`missing source ${name}`);
  return entry.status;
}

describe("deriveSourceHealth", () => {
  it("always reports Musixmatch as connected (core source)", () => {
    expect(statusOf("Musixmatch", base)).toBe("connected");
    expect(statusOf("Musixmatch", { ...base, songstatsStatus: "error", jambaseStatus: "error" })).toBe("connected");
  });

  it("reflects the Gemini report lifecycle honestly", () => {
    expect(statusOf("Gemini", { ...base, reportLoading: true })).toBe("generating");
    expect(statusOf("Gemini", { ...base, reportSource: "fallback" })).toBe("unavailable");
    expect(statusOf("Gemini", { ...base, reportSource: null, reportError: "boom" })).toBe("unavailable");
    expect(statusOf("Gemini", base)).toBe("connected");
  });

  it("maps Songstats/JamBase feed status", () => {
    expect(statusOf("Songstats", { ...base, songstatsStatus: "loading" })).toBe("generating");
    expect(statusOf("Songstats", { ...base, songstatsStatus: "empty" })).toBe("unavailable");
    expect(statusOf("Songstats", { ...base, songstatsStatus: "error" })).toBe("unavailable");
    expect(statusOf("JamBase", { ...base, jambaseStatus: "ok" })).toBe("connected");
    expect(statusOf("JamBase", { ...base, jambaseStatus: "empty" })).toBe("unavailable");
  });

  it("reflects ElevenLabs probe + audio status", () => {
    expect(statusOf("ElevenLabs", { ...base, audioAvailable: false })).toBe("unavailable");
    expect(statusOf("ElevenLabs", { ...base, audioStatus: "loading" })).toBe("generating");
    expect(statusOf("ElevenLabs", { ...base, audioStatus: "error" })).toBe("unavailable");
    expect(statusOf("ElevenLabs", { ...base, audioAvailable: true, audioStatus: "idle" })).toBe("connected");
    expect(statusOf("ElevenLabs", { ...base, audioAvailable: true, audioStatus: "ready" })).toBe("connected");
    expect(statusOf("ElevenLabs", { ...base, audioAvailable: null, audioStatus: "idle" })).toBe("generating");
  });

  it("keeps Cyanite as a genuine forward-looking partner slot", () => {
    expect(statusOf("Cyanite", base)).toBe("coming-soon");
  });
});
