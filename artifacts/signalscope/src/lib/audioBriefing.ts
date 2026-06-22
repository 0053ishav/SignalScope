/**
 * Deterministic Executive Audio Briefing script composer.
 *
 * Builds a ~60–90s spoken briefing (roughly 150–230 words) from REAL data only,
 * reusing the same derived helpers as the on-screen workspace. Every clause is
 * conditional on real data being present — nothing is fabricated, and sections
 * without data are simply omitted. The resulting plain-text script is sent to
 * the backend for text-to-speech.
 */
import type { TrackWorkspaceValue } from "@/context/TrackWorkspaceContext";
import { livePresenceSummary } from "@/lib/jambase";

/** The slice of workspace state the briefing script is composed from. */
export type BriefingInput = Pick<
  TrackWorkspaceValue,
  "track" | "report" | "analysis" | "songstats" | "songstatsStatus" | "jambase" | "jambaseStatus"
>;

function sentence(s: string): string {
  const trimmed = s.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function list(items: string[], max = 3): string {
  const clean = items.map((i) => i.trim()).filter(Boolean).slice(0, max);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

export function composeBriefingScript(ctx: BriefingInput): string {
  const { track, report, analysis } = ctx;
  const parts: string[] = [];

  parts.push(
    sentence(
      `SignalScope executive briefing for ${track.track_name} by ${track.artist_name}`,
    ),
  );

  if (report) {
    if (report.summary) parts.push(sentence(report.summary));

    const s = report.scores;
    parts.push(
      sentence(
        `Headline scores: audience ${s.audience}, emotional resonance ${s.emotion}, virality ${s.virality}, and growth ${s.growth}, out of one hundred`,
      ),
    );

    if (report.audienceArchetypes?.length) {
      parts.push(sentence(`The core audience skews toward ${list(report.audienceArchetypes)}`));
    }
    if (report.emotionalPositioning?.length) {
      parts.push(sentence(`Emotionally, it lands as ${list(report.emotionalPositioning, 2)}`));
    }
    if (report.viralDrivers?.length) {
      parts.push(sentence(`Its strongest viral drivers are ${list(report.viralDrivers)}`));
    }
    if (report.platformFit?.length) {
      const high = report.platformFit.filter((p) => p.score === "High").map((p) => p.platform);
      if (high.length) {
        parts.push(sentence(`Platform fit is strongest on ${list(high)}`));
      }
    }
  } else if (analysis?.themes?.main_themes?.length) {
    const themes = analysis.themes.main_themes.map((t) => t.theme);
    parts.push(sentence(`Lyrically, the dominant themes are ${list(themes)}`));
  }

  if (ctx.songstatsStatus === "ok" && ctx.songstats?.growth) {
    const g = ctx.songstats.growth;
    const direction = g.percent > 0 ? "up" : g.percent < 0 ? "down" : "flat";
    parts.push(
      sentence(
        `On the market side, ${g.metric} is ${direction} ${Math.abs(g.percent)} percent over the ${g.window}`,
      ),
    );
  }

  if (ctx.jambaseStatus === "ok" && ctx.jambase) {
    const live = livePresenceSummary(ctx.jambase);
    if (live) parts.push(sentence(live));
  }

  if (report?.artistActions?.length) {
    parts.push(sentence(`Recommended next move: ${report.artistActions[0]}`));
  } else if (report?.contentOpportunities?.length) {
    parts.push(sentence(`Top content opportunity: ${report.contentOpportunities[0]}`));
  }

  parts.push("That concludes your SignalScope briefing.");

  return parts.filter(Boolean).join(" ");
}
