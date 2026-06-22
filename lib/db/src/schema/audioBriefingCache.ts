import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Cache of generated Executive Audio Briefings, keyed by Musixmatch
 * `commontrack_id`. ElevenLabs text-to-speech is a paid, rate-limited API and
 * the briefing script is deterministic per track, so caching lets the briefing
 * be generated exactly once and replayed across sessions. `audio` holds the
 * base64-encoded audio bytes; `mimeType` the returned content type.
 */
export const audioBriefingCacheTable = pgTable("audio_briefing_cache", {
  commontrackId: integer("commontrack_id").primaryKey(),
  audio: text("audio").notNull(),
  mimeType: text("mime_type").notNull(),
  voiceId: text("voice_id").notNull(),
  voiceName: text("voice_name"),
  script: text("script"),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const insertAudioBriefingCacheSchema = createInsertSchema(audioBriefingCacheTable).omit({
  fetchedAt: true,
});
export type InsertAudioBriefingCache = z.infer<typeof insertAudioBriefingCacheSchema>;
export type AudioBriefingCacheRow = typeof audioBriefingCacheTable.$inferSelect;
