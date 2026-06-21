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

    const report = await generateIntelligenceReport({
      track,
      lyrics,
      richSync,
      analysis,
    });

    return res.json(report);
  } catch (error) {
    console.error("Intelligence Route Error", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown Error",
    });
  }
});

export default router;
