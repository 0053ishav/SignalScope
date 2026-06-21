import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Cache of normalized Songstats payloads, keyed by ISRC. Songstats is a
 * rate-limited paid API (10 req/s); caching lets the workspace re-render
 * without re-hitting the API on every view change. `data` holds the already
 * normalized `SongstatsTrackData` shape produced by the api-server service.
 */
export const songstatsCacheTable = pgTable("songstats_cache", {
  isrc: text("isrc").primaryKey(),
  data: jsonb("data").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const insertSongstatsCacheSchema = createInsertSchema(songstatsCacheTable).omit({
  fetchedAt: true,
});
export type InsertSongstatsCache = z.infer<typeof insertSongstatsCacheSchema>;
export type SongstatsCacheRow = typeof songstatsCacheTable.$inferSelect;
