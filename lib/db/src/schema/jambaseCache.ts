import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Cache of normalized JamBase live/touring payloads, keyed by a normalized
 * artist key (lowercased, trimmed name). JamBase is a rate-limited API and an
 * artist's upcoming-events list changes slowly, so caching lets the workspace
 * re-render across view changes without re-hitting the API. `data` holds the
 * already normalized `JamBaseLiveData` shape produced by the api-server service.
 */
export const jambaseCacheTable = pgTable("jambase_cache", {
  artistKey: text("artist_key").primaryKey(),
  data: jsonb("data").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const insertJambaseCacheSchema = createInsertSchema(jambaseCacheTable).omit({
  fetchedAt: true,
});
export type InsertJambaseCache = z.infer<typeof insertJambaseCacheSchema>;
export type JambaseCacheRow = typeof jambaseCacheTable.$inferSelect;
