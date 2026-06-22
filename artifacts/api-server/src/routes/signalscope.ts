import { Router, type IRouter } from "express";
import {
  searchTracks,
  getTrack,
  getLyrics,
  getRichSync,
  getLyricsTranslation,
  getAnalysis,
} from "@/services/musixmatch";
import { generateIntelligenceReport } from "@/services/intelligence";
import {
  getSongstatsTrackData,
  isSongstatsConfigured,
} from "@/services/songstats";
import { deriveSongstatsSignals } from "@/lib/intelligence/songstatsSignals";
import {
  getJamBaseLiveData,
  isJamBaseConfigured,
} from "@/services/jambase";
import { deriveJamBaseSignals } from "@/lib/intelligence/jambaseSignals";
import {
  isElevenLabsConfigured,
  generateSpeech,
  getVoiceName,
  getConfiguredVoiceId,
} from "@/services/elevenlabs";
import {
  db,
  intelligenceReportsTable,
  songstatsCacheTable,
  jambaseCacheTable,
  audioBriefingCacheTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import type { SongstatsTrackData } from "@/types/songstats";
import type { JamBaseLiveData } from "@/types/jambase";

const router: IRouter = Router();

// Songstats is rate-limited (10 req/s); serve cached snapshots for this long
// before re-fetching.
const SONGSTATS_TTL_MS = 12 * 60 * 60 * 1000; // 12h

// JamBase upcoming-event lists change slowly; serve cached snapshots for this
// long before re-fetching (keyed by normalized artist name).
const JAMBASE_TTL_MS = 6 * 60 * 60 * 1000; // 6h

router.get("/search", async (req, res) => {
  const query = (req.query.q as string) ?? "";

  if (!query) {
    return res.json([]);
  }

  try {
    const tracks = await searchTracks(query);
    return res.json(tracks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Search failed" });
  }
});

router.get("/track/:id", async (req, res) => {
  try {
    const track = await getTrack(req.params.id);
    return res.json(track);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch track" });
  }
});

router.get("/lyrics/translation", async (req, res) => {
  const commontrackId = req.query.commontrackId as string | undefined;
  const language = req.query.language as string | undefined;

  if (!commontrackId || !language) {
    return res.status(400).json({ error: "Missing params" });
  }

  const translation = await getLyricsTranslation(commontrackId, language);
  return res.json({ translation });
});

router.get("/lyrics/:id", async (req, res) => {
  try {
    const lyrics = await getLyrics(req.params.id);
    return res.json(lyrics);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load lyrics" });
  }
});

router.get("/richSync/:id", async (req, res) => {
  const richsync = await getRichSync(req.params.id);
  return res.json(richsync);
});

router.get("/analysis/:id", async (req, res) => {
  try {
    const analysis = await getAnalysis(req.params.id);
    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

router.post("/intelligence", async (req, res) => {
  try {
    const { track, lyrics, richSync, analysis } = req.body ?? {};

    if (!track) {
      return res.status(400).json({ error: "Track data is required" });
    }

    const commontrackId = Number((track as { commontrack_id?: unknown }).commontrack_id);
    const hasKey = Number.isFinite(commontrackId) && commontrackId > 0;
    const forceRefresh = req.query.refresh === "true";

    // 1. Check the persistence layer first — return instantly on cache hit.
    if (hasKey && !forceRefresh) {
      try {
        const [cached] = await db
          .select()
          .from(intelligenceReportsTable)
          .where(eq(intelligenceReportsTable.commontrackId, commontrackId))
          .limit(1);

        if (cached) {
          return res.json({
            ...(cached.report as object),
            source: cached.source,
            cached: true,
          });
        }
      } catch (cacheError) {
        console.error("Intelligence cache read failed", cacheError);
      }
    }

    // 2. Not cached — generate (Gemini, with graceful fallback).
    const { report, source } = await generateIntelligenceReport({
      track,
      lyrics,
      richSync,
      analysis,
    });

    // 3. Persist for next time (best-effort, only Gemini results are durable;
    //    fallback results are saved too so demos stay instant, but can be
    //    refreshed once Gemini is available again via ?refresh=true).
    if (hasKey) {
      try {
        await db
          .insert(intelligenceReportsTable)
          .values({ commontrackId, report, source })
          .onConflictDoUpdate({
            target: intelligenceReportsTable.commontrackId,
            set: { report, source, createdAt: new Date() },
          });
      } catch (saveError) {
        console.error("Intelligence cache write failed", saveError);
      }
    }

    return res.json({ ...report, source, cached: false });
  } catch (error) {
    console.error("Intelligence Route Error", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown Error",
    });
  }
});

/**
 * Songstats market intelligence lookup. Always responds 200 with a status
 * discriminator so the frontend can progressively enhance and never throws:
 *   - "unavailable": no API key configured (honest "not connected" state)
 *   - "empty":       configured, but Songstats has no real data for this track
 *   - "ok":          real normalized data + derived signals
 *   - "error":       unexpected failure (still non-fatal for the workspace)
 */
router.get("/songstats/:isrc", async (req, res) => {
  const rawIsrc = (req.params.isrc ?? "").trim();
  // The frontend sends "none" when a track has no ISRC — treat it as absent so
  // resolution falls through to the artist+title search.
  const isrc = rawIsrc === "none" || rawIsrc === "-" ? "" : rawIsrc;
  const artist = (req.query.artist as string | undefined)?.trim();
  const title = (req.query.title as string | undefined)?.trim();
  const forceRefresh = req.query.refresh === "true";

  if (!isSongstatsConfigured()) {
    return res.json({ status: "unavailable" });
  }

  try {
    // 1. Serve a fresh cache hit (keyed by ISRC) to respect rate limits.
    if (isrc && !forceRefresh) {
      try {
        const [cached] = await db
          .select()
          .from(songstatsCacheTable)
          .where(eq(songstatsCacheTable.isrc, isrc))
          .limit(1);

        if (cached && Date.now() - cached.fetchedAt.getTime() < SONGSTATS_TTL_MS) {
          const data = cached.data as SongstatsTrackData;
          return res.json({
            status: "ok",
            data,
            signals: deriveSongstatsSignals(data),
            cached: true,
          });
        }
      } catch (cacheError) {
        console.error("Songstats cache read failed", cacheError);
      }
    }

    // 2. Fetch + normalize.
    const data = await getSongstatsTrackData({ isrc, artist, title });

    if (!data) {
      return res.json({ status: "empty" });
    }

    // 3. Persist (best-effort) keyed by ISRC when we have one.
    const cacheKey = data.isrc || isrc;
    if (cacheKey) {
      try {
        await db
          .insert(songstatsCacheTable)
          .values({ isrc: cacheKey, data })
          .onConflictDoUpdate({
            target: songstatsCacheTable.isrc,
            set: { data, fetchedAt: new Date() },
          });
      } catch (saveError) {
        console.error("Songstats cache write failed", saveError);
      }
    }

    return res.json({
      status: "ok",
      data,
      signals: deriveSongstatsSignals(data),
      cached: false,
    });
  } catch (error) {
    console.error("Songstats route error", error);
    return res.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * JamBase live/touring intelligence lookup. Always responds 200 with a status
 * discriminator so the frontend can progressively enhance and never throws:
 *   - "unavailable": no API key configured (honest "not connected" state)
 *   - "empty":       configured, but JamBase has no upcoming events for the artist
 *   - "ok":          real normalized live data + derived signals
 *   - "error":       unexpected failure (still non-fatal for the workspace)
 */
router.get("/jambase/:artist", async (req, res) => {
  // Express already URL-decodes path params; the frontend always sends an
  // encodeURIComponent-valid artist name, so this is a plain string here.
  const artist = (req.params.artist ?? "").trim();
  const forceRefresh = req.query.refresh === "true";

  if (!isJamBaseConfigured()) {
    return res.json({ status: "unavailable" });
  }
  if (!artist || artist === "none" || artist === "-") {
    return res.json({ status: "empty" });
  }

  const artistKey = artist.toLowerCase();

  try {
    // 1. Serve a fresh cache hit (keyed by normalized artist) to respect rate limits.
    if (!forceRefresh) {
      try {
        const [cached] = await db
          .select()
          .from(jambaseCacheTable)
          .where(eq(jambaseCacheTable.artistKey, artistKey))
          .limit(1);

        if (cached && Date.now() - cached.fetchedAt.getTime() < JAMBASE_TTL_MS) {
          const data = cached.data as JamBaseLiveData;
          return res.json({
            status: "ok",
            data,
            signals: deriveJamBaseSignals(data),
            cached: true,
          });
        }
      } catch (cacheError) {
        console.error("JamBase cache read failed", cacheError);
      }
    }

    // 2. Fetch + normalize.
    const data = await getJamBaseLiveData(artist);

    if (!data) {
      return res.json({ status: "empty" });
    }

    // 3. Persist (best-effort) keyed by normalized artist.
    try {
      await db
        .insert(jambaseCacheTable)
        .values({ artistKey, data })
        .onConflictDoUpdate({
          target: jambaseCacheTable.artistKey,
          set: { data, fetchedAt: new Date() },
        });
    } catch (saveError) {
      console.error("JamBase cache write failed", saveError);
    }

    return res.json({
      status: "ok",
      data,
      signals: deriveJamBaseSignals(data),
      cached: false,
    });
  } catch (error) {
    console.error("JamBase route error", error);
    return res.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Executive Audio Briefing — text-to-speech via ElevenLabs. Always responds 200
 * with a status discriminator so the frontend can progressively enhance and
 * never throws:
 *   - "unavailable": ElevenLabs not configured (honest "not connected" state)
 *   - "ok":          audio (base64) + mime type + voice metadata
 *   - "error":       generation failed (still non-fatal for the workspace)
 *
 * The briefing script is composed deterministically on the frontend from real
 * data and POSTed here; this route only performs TTS + caches the result keyed
 * by commontrack_id so a briefing is generated exactly once.
 */
router.post("/audio-briefing", async (req, res) => {
  const { commontrackId, script } = (req.body ?? {}) as {
    commontrackId?: unknown;
    script?: unknown;
  };

  if (!isElevenLabsConfigured()) {
    return res.json({ status: "unavailable" });
  }

  const id = Number(commontrackId);
  const hasValidId = Number.isFinite(id) && id > 0;
  const text = typeof script === "string" ? script.trim() : "";

  // A valid commontrack_id is required so every paid generation is cache-keyed
  // (generate-once) and the route can't be used as an open TTS relay.
  if (!hasValidId) {
    return res.json({ status: "error", message: "Invalid track id" });
  }
  if (!text) {
    return res.json({ status: "error", message: "Empty briefing script" });
  }
  // Bound the input so an oversized payload can't drive runaway TTS cost.
  if (text.length > 6000) {
    return res.json({ status: "error", message: "Briefing script too long" });
  }

  try {
    // 1. Serve a cache hit (keyed by commontrack_id) — briefings are stable.
    {
      try {
        const [cached] = await db
          .select()
          .from(audioBriefingCacheTable)
          .where(eq(audioBriefingCacheTable.commontrackId, id))
          .limit(1);

        if (cached) {
          return res.json({
            status: "ok",
            audio: cached.audio,
            mimeType: cached.mimeType,
            voiceId: cached.voiceId,
            voiceName: cached.voiceName ?? undefined,
            cached: true,
          });
        }
      } catch (cacheError) {
        console.error("Audio briefing cache read failed", cacheError);
      }
    }

    // 2. Generate.
    const speech = await generateSpeech(text);
    if (!speech) {
      return res.json({ status: "error", message: "Audio generation failed" });
    }

    const voiceName = await getVoiceName();

    // 3. Persist (best-effort).
    {
      try {
        await db
          .insert(audioBriefingCacheTable)
          .values({
            commontrackId: id,
            audio: speech.audio,
            mimeType: speech.mimeType,
            voiceId: speech.voiceId,
            voiceName: voiceName ?? undefined,
            script: text,
          })
          .onConflictDoUpdate({
            target: audioBriefingCacheTable.commontrackId,
            set: {
              audio: speech.audio,
              mimeType: speech.mimeType,
              voiceId: speech.voiceId,
              voiceName: voiceName ?? undefined,
              script: text,
              fetchedAt: new Date(),
            },
          });
      } catch (saveError) {
        console.error("Audio briefing cache write failed", saveError);
      }
    }

    return res.json({
      status: "ok",
      audio: speech.audio,
      mimeType: speech.mimeType,
      voiceId: speech.voiceId || getConfiguredVoiceId(),
      voiceName: voiceName ?? undefined,
      cached: false,
    });
  } catch (error) {
    console.error("Audio briefing route error", error);
    return res.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Lightweight readiness probe so the UI can show an honest ElevenLabs status
// without spending a TTS generation. Not a data source — just config presence.
router.get("/audio-briefing/status", (_req, res) => {
  res.json({ configured: isElevenLabsConfigured() });
});

export default router;
