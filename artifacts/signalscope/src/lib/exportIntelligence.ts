/**
 * Shared intelligence collector.
 *
 * Assembles the COMPLETE current-track intelligence from the workspace context
 * into one structured, serializable object — omitting any section that has no
 * real data. This single object feeds all export formats (JSON, Markdown) and
 * the print/PDF view, so every surface stays consistent and never fabricates.
 */
import type { TrackWorkspaceValue } from "@/context/TrackWorkspaceContext";
import { extractRichSyncSignals, type RichSyncSignal } from "@/lib/intelligence";
import { buildHeadlineKpis, type HeadlineKpi } from "@/lib/songstats";
import {
  livePresenceSummary,
  touringRecommendations,
  eventLocation,
  formatEventDate,
} from "@/lib/jambase";
import type { PlatformFit } from "@/types/intelligence";

export interface ExportTrackMeta {
  title: string;
  artist: string;
  album?: string;
  isrc?: string;
  durationSeconds?: number;
  spotifyId?: string;
  explicit: boolean;
  genres: string[];
}

export interface ExportSongstats {
  headlineKpis: { label: string; value: string; source: string }[];
  topMarkets: { country: string; value: number }[];
  growth?: { metric: string; percent: number; window: string };
  platforms: string[];
}

export interface ExportJamBaseEvent {
  name?: string;
  date: string;
  location: string;
  venue?: string;
}

export interface ExportJamBase {
  livePresence?: string;
  upcomingEventCount: number;
  countryCount: number;
  cityCount: number;
  largestVenue?: { name: string; capacity: number };
  upcomingEvents: ExportJamBaseEvent[];
  touringRecommendations: string[];
}

export interface ExportTimelineEntry {
  time?: string;
  type: string;
  source: string;
  text: string;
}

export interface IntelligenceExport {
  generatedAt: string;
  track: ExportTrackMeta;
  sources: string[];

  report?: {
    source: string;
    confidence: number;
    summary: string;
    scores: { audience: number; emotion: number; virality: number; growth: number };
    audienceArchetypes: string[];
    emotionalPositioning: string[];
    culturalPositioning: string[];
    viralDrivers: string[];
    contentOpportunities: string[];
    growthRecommendations: string[];
    artistActions: string[];
    platformFit: PlatformFit[];
    evidence: { audience: string[]; emotion: string[]; culture: string[] };
  };

  analysis?: {
    meaning?: string;
    moods: string[];
    themes: { theme: string; quotes: string[] }[];
  };

  richSyncHighlights: { time: string; signal: string; text: string }[];
  songstats?: ExportSongstats;
  jambase?: ExportJamBase;
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function trackGenres(track: TrackWorkspaceValue["track"]): string[] {
  return (
    track.primary_genres?.music_genre_list
      ?.map((g) => g.music_genre?.music_genre_name)
      .filter((g): g is string => Boolean(g)) ?? []
  );
}

/** Active intelligence sources for this track (only those with real data). */
export function activeSources(ctx: TrackWorkspaceValue): string[] {
  const sources = ["Musixmatch"];
  if (ctx.report && ctx.reportSource === "gemini") sources.push("Gemini");
  if (ctx.songstatsStatus === "ok" && ctx.songstats) sources.push("Songstats");
  if (ctx.jambaseStatus === "ok" && ctx.jambase) sources.push("JamBase");
  return sources;
}

export function collectIntelligence(ctx: TrackWorkspaceValue): IntelligenceExport {
  const { track, analysis, report, segments } = ctx;

  const out: IntelligenceExport = {
    generatedAt: new Date().toISOString(),
    sources: activeSources(ctx),
    track: {
      title: track.track_name,
      artist: track.artist_name,
      album: track.album_name || undefined,
      isrc: track.track_isrc || undefined,
      durationSeconds: track.track_length || undefined,
      spotifyId: track.track_spotify_id || undefined,
      explicit: Boolean(track.explicit),
      genres: trackGenres(track),
    },
    richSyncHighlights: [],
  };

  if (report) {
    out.report = {
      source: report.source ?? "unknown",
      confidence: report.confidence,
      summary: report.summary,
      scores: report.scores,
      audienceArchetypes: report.audienceArchetypes ?? [],
      emotionalPositioning: report.emotionalPositioning ?? [],
      culturalPositioning: report.culturalPositioning ?? [],
      viralDrivers: report.viralDrivers ?? [],
      contentOpportunities: report.contentOpportunities ?? [],
      growthRecommendations: report.growthRecommendations ?? [],
      artistActions: report.artistActions ?? [],
      platformFit: report.platformFit ?? [],
      evidence: report.evidence ?? { audience: [], emotion: [], culture: [] },
    };
  }

  const moods = analysis?.moods?.main_moods ?? [];
  const themes = analysis?.themes?.main_themes ?? [];
  const meaning = analysis?.meaning?.explanation;
  if (moods.length || themes.length || meaning) {
    out.analysis = {
      meaning: meaning || undefined,
      moods,
      themes: themes.map((t) => ({ theme: t.theme, quotes: t.quotes ?? [] })),
    };
  }

  const signals: RichSyncSignal[] = extractRichSyncSignals(segments);
  out.richSyncHighlights = signals.map((s) => ({
    time: fmtTime(s.time),
    signal: s.signal,
    text: s.text,
  }));

  if (ctx.songstatsStatus === "ok" && ctx.songstats) {
    const data = ctx.songstats;
    const kpis: HeadlineKpi[] = buildHeadlineKpis(data);
    out.songstats = {
      headlineKpis: kpis.map((k) => ({ label: k.label, value: k.formatted, source: k.source })),
      topMarkets: data.topMarkets.slice(0, 5).map((m) => ({ country: m.country, value: m.value })),
      growth: data.growth
        ? { metric: data.growth.metric, percent: data.growth.percent, window: data.growth.window }
        : undefined,
      platforms: data.platforms.map((p) => p.label),
    };
  }

  if (ctx.jambaseStatus === "ok" && ctx.jambase) {
    const data = ctx.jambase;
    out.jambase = {
      livePresence: livePresenceSummary(data) || undefined,
      upcomingEventCount: data.upcomingEventCount,
      countryCount: data.countryCount,
      cityCount: data.cityCount,
      largestVenue:
        data.largestVenue && data.largestVenue.capacity > 0
          ? { name: data.largestVenue.name, capacity: data.largestVenue.capacity }
          : undefined,
      upcomingEvents: data.upcomingEvents.slice(0, 10).map((e) => ({
        name: e.name,
        date: formatEventDate(e.date),
        location: eventLocation(e),
        venue: e.venueName,
      })),
      touringRecommendations: touringRecommendations(data),
    };
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Formatters                                                                 */
/* -------------------------------------------------------------------------- */

export function toJson(data: IntelligenceExport): string {
  return JSON.stringify(data, null, 2);
}

export function exportSlug(data: IntelligenceExport): string {
  return (
    `${data.track.artist}-${data.track.title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "signalscope"
  );
}

function bullets(items: string[]): string {
  return items.map((i) => `- ${i}`).join("\n");
}

export function toMarkdown(data: IntelligenceExport): string {
  const lines: string[] = [];
  const t = data.track;

  lines.push(`# SignalScope Intelligence — ${t.title}`);
  lines.push(`**Artist:** ${t.artist}`);
  if (t.album) lines.push(`**Album:** ${t.album}`);
  const metaBits: string[] = [];
  if (t.isrc) metaBits.push(`ISRC ${t.isrc}`);
  if (t.durationSeconds) metaBits.push(`Duration ${fmtTime(t.durationSeconds)}`);
  metaBits.push(t.explicit ? "Explicit" : "Clean");
  lines.push(`**Track:** ${metaBits.join(" · ")}`);
  if (t.genres.length) lines.push(`**Genres:** ${t.genres.join(", ")}`);
  lines.push(`**Sources:** ${data.sources.join(", ")}`);
  lines.push(`_Generated ${new Date(data.generatedAt).toLocaleString()}_`);
  lines.push("");

  if (data.report) {
    const r = data.report;
    lines.push(`## Executive Briefing`);
    lines.push(`_Confidence: ${r.confidence}% · Source: ${r.source}_`);
    lines.push("");
    lines.push(r.summary);
    lines.push("");
    lines.push(`## Headline Scores`);
    lines.push(`| Dimension | Score |`);
    lines.push(`| --- | --- |`);
    lines.push(`| Audience | ${r.scores.audience} |`);
    lines.push(`| Emotion | ${r.scores.emotion} |`);
    lines.push(`| Virality | ${r.scores.virality} |`);
    lines.push(`| Growth | ${r.scores.growth} |`);
    lines.push("");

    const sectionMap: [string, string[]][] = [
      ["Audience Archetypes", r.audienceArchetypes],
      ["Emotional Positioning", r.emotionalPositioning],
      ["Cultural Positioning", r.culturalPositioning],
      ["Viral Drivers", r.viralDrivers],
      ["Content Opportunities", r.contentOpportunities],
      ["Growth Recommendations", r.growthRecommendations],
      ["Artist Actions", r.artistActions],
    ];
    for (const [title, items] of sectionMap) {
      if (items.length) {
        lines.push(`## ${title}`);
        lines.push(bullets(items));
        lines.push("");
      }
    }

    if (r.platformFit.length) {
      lines.push(`## Platform Fit`);
      lines.push(`| Platform | Fit | Reason |`);
      lines.push(`| --- | --- | --- |`);
      for (const p of r.platformFit) {
        lines.push(`| ${p.platform} | ${p.score} | ${p.reason} |`);
      }
      lines.push("");
    }

    const ev = r.evidence;
    if (ev.audience.length || ev.emotion.length || ev.culture.length) {
      lines.push(`## Evidence`);
      if (ev.audience.length) {
        lines.push(`### Audience`);
        lines.push(bullets(ev.audience));
        lines.push("");
      }
      if (ev.emotion.length) {
        lines.push(`### Emotion`);
        lines.push(bullets(ev.emotion));
        lines.push("");
      }
      if (ev.culture.length) {
        lines.push(`### Culture`);
        lines.push(bullets(ev.culture));
        lines.push("");
      }
    }
  }

  if (data.songstats) {
    const s = data.songstats;
    lines.push(`## Market Performance (Songstats)`);
    if (s.growth) {
      const arrow = s.growth.percent > 0 ? "▲" : s.growth.percent < 0 ? "▼" : "▬";
      lines.push(`**Momentum:** ${arrow} ${s.growth.percent}% ${s.growth.metric} (${s.growth.window})`);
      lines.push("");
    }
    if (s.headlineKpis.length) {
      lines.push(`| Metric | Value | Source |`);
      lines.push(`| --- | --- | --- |`);
      for (const k of s.headlineKpis) lines.push(`| ${k.label} | ${k.value} | ${k.source} |`);
      lines.push("");
    }
    if (s.topMarkets.length) {
      lines.push(`### Top Markets`);
      lines.push(bullets(s.topMarkets.map((m) => `${m.country} — ${m.value.toLocaleString()}`)));
      lines.push("");
    }
  }

  if (data.jambase) {
    const j = data.jambase;
    lines.push(`## Live Intelligence (JamBase)`);
    if (j.livePresence) {
      lines.push(j.livePresence);
      lines.push("");
    }
    if (j.upcomingEvents.length) {
      lines.push(`### Upcoming Events`);
      lines.push(
        bullets(
          j.upcomingEvents.map(
            (e) =>
              `${e.date} — ${e.name || e.venue || "Event"}${e.location ? ` (${e.location})` : ""}`,
          ),
        ),
      );
      lines.push("");
    }
    if (j.touringRecommendations.length) {
      lines.push(`### Touring Recommendations`);
      lines.push(bullets(j.touringRecommendations));
      lines.push("");
    }
  }

  if (data.analysis) {
    const a = data.analysis;
    lines.push(`## Source Signals (Musixmatch)`);
    if (a.meaning) {
      lines.push(`**Meaning:** ${a.meaning}`);
      lines.push("");
    }
    if (a.moods.length) {
      lines.push(`**Moods:** ${a.moods.join(", ")}`);
      lines.push("");
    }
    if (a.themes.length) {
      lines.push(`### Themes`);
      for (const th of a.themes) {
        lines.push(`- **${th.theme}**${th.quotes.length ? `: ${th.quotes.join(" / ")}` : ""}`);
      }
      lines.push("");
    }
  }

  if (data.richSyncHighlights.length) {
    lines.push(`## RichSync Highlights`);
    lines.push(
      bullets(data.richSyncHighlights.map((h) => `${h.time} [${h.signal}] ${h.text}`)),
    );
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}
