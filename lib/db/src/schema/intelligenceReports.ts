import { pgTable, integer, jsonb, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const intelligenceReportsTable = pgTable("intelligence_reports", {
  commontrackId: integer("commontrack_id").primaryKey(),
  report: jsonb("report").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIntelligenceReportSchema = createInsertSchema(intelligenceReportsTable).omit({
  createdAt: true,
});
export type InsertIntelligenceReport = z.infer<typeof insertIntelligenceReportSchema>;
export type IntelligenceReportRow = typeof intelligenceReportsTable.$inferSelect;
