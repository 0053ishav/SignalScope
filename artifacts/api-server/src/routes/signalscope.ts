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
import { db, intelligenceReportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

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

export default router;
