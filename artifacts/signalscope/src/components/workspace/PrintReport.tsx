import { useEffect, useLayoutEffect, useState } from "react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import { collectIntelligence } from "@/lib/exportIntelligence";

/** Event that asks the mounted controller to render the print doc and print. */
export const PRINT_REPORT_EVENT = "signalscope:print-report";

export function triggerPrintReport() {
  window.dispatchEvent(new Event(PRINT_REPORT_EVENT));
}

/**
 * Print-only full intelligence document. Hidden on screen; the `@media print`
 * rules in index.css reveal ONLY this subtree so "Export PDF" (window.print)
 * produces a clean report rather than the on-screen app chrome. Renders every
 * section that has real data and silently omits the rest.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 18, breakInside: "avoid" }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#111" }}>{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "0 0 4px 18px", padding: 0 }}>
      {items.map((it, i) => (
        <li key={i} style={{ marginBottom: 2 }}>
          {it}
        </li>
      ))}
    </ul>
  );
}

function PrintReportDoc() {
  const ctx = useTrackWorkspace();
  const data = collectIntelligence(ctx);
  const t = data.track;
  const r = data.report;

  return (
    <div
      id="print-report"
      style={{
        fontFamily: "Geist, system-ui, sans-serif",
        color: "#111",
        fontSize: 12,
        lineHeight: 1.5,
        padding: 32,
      }}
    >
      <header style={{ borderBottom: "2px solid #111", paddingBottom: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#666" }}>
          SignalScope Intelligence Report
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "6px 0 2px" }}>{t.title}</h1>
        <div style={{ fontSize: 14, color: "#333" }}>{t.artist}</div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
          {[
            t.album,
            t.isrc ? `ISRC ${t.isrc}` : null,
            t.explicit ? "Explicit" : "Clean",
            t.genres.length ? t.genres.join(", ") : null,
          ]
            .filter(Boolean)
            .join("  ·  ")}
        </div>
        <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
          Sources: {data.sources.join(", ")} · Generated{" "}
          {new Date(data.generatedAt).toLocaleString()}
        </div>
      </header>

      {r && (
        <>
          <Section title="Executive Briefing">
            <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>
              Confidence {r.confidence}% · Source {r.source}
            </div>
            <p style={{ margin: 0 }}>{r.summary}</p>
          </Section>

          <Section title="Headline Scores">
            <div style={{ display: "flex", gap: 24 }}>
              {(
                [
                  ["Audience", r.scores.audience],
                  ["Emotion", r.scores.emotion],
                  ["Virality", r.scores.virality],
                  ["Growth", r.scores.growth],
                ] as [string, number][]
              ).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{val}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>{label}</div>
                </div>
              ))}
            </div>
          </Section>

          {([
            ["Audience Archetypes", r.audienceArchetypes],
            ["Emotional Positioning", r.emotionalPositioning],
            ["Cultural Positioning", r.culturalPositioning],
            ["Viral Drivers", r.viralDrivers],
            ["Content Opportunities", r.contentOpportunities],
            ["Growth Recommendations", r.growthRecommendations],
            ["Artist Actions", r.artistActions],
          ] as [string, string[]][])
            .filter(([, items]) => items.length > 0)
            .map(([title, items]) => (
              <Section key={title} title={title}>
                <List items={items} />
              </Section>
            ))}

          {r.platformFit.length > 0 && (
            <Section title="Platform Fit">
              {r.platformFit.map((p, i) => (
                <div key={i} style={{ marginBottom: 3 }}>
                  <strong>{p.platform}</strong> — {p.score}: {p.reason}
                </div>
              ))}
            </Section>
          )}

          {(r.evidence.audience.length > 0 ||
            r.evidence.emotion.length > 0 ||
            r.evidence.culture.length > 0) && (
            <Section title="Evidence">
              {r.evidence.audience.length > 0 && (
                <>
                  <div style={{ fontWeight: 600 }}>Audience</div>
                  <List items={r.evidence.audience} />
                </>
              )}
              {r.evidence.emotion.length > 0 && (
                <>
                  <div style={{ fontWeight: 600 }}>Emotion</div>
                  <List items={r.evidence.emotion} />
                </>
              )}
              {r.evidence.culture.length > 0 && (
                <>
                  <div style={{ fontWeight: 600 }}>Culture</div>
                  <List items={r.evidence.culture} />
                </>
              )}
            </Section>
          )}
        </>
      )}

      {data.songstats && (
        <Section title="Market Performance (Songstats)">
          {data.songstats.growth && (
            <p style={{ margin: "0 0 4px" }}>
              Momentum: {data.songstats.growth.percent}% {data.songstats.growth.metric} (
              {data.songstats.growth.window})
            </p>
          )}
          {data.songstats.headlineKpis.map((k, i) => (
            <div key={i}>
              <strong>{k.label}:</strong> {k.value} <span style={{ color: "#888" }}>({k.source})</span>
            </div>
          ))}
          {data.songstats.topMarkets.length > 0 && (
            <>
              <div style={{ fontWeight: 600, marginTop: 4 }}>Top Markets</div>
              <List
                items={data.songstats.topMarkets.map(
                  (m) => `${m.country} — ${m.value.toLocaleString()}`,
                )}
              />
            </>
          )}
        </Section>
      )}

      {data.jambase && (
        <Section title="Live Intelligence (JamBase)">
          {data.jambase.livePresence && <p style={{ margin: "0 0 4px" }}>{data.jambase.livePresence}</p>}
          {data.jambase.upcomingEvents.length > 0 && (
            <>
              <div style={{ fontWeight: 600 }}>Upcoming Events</div>
              <List
                items={data.jambase.upcomingEvents.map(
                  (e) =>
                    `${e.date} — ${e.name || e.venue || "Event"}${e.location ? ` (${e.location})` : ""}`,
                )}
              />
            </>
          )}
          {data.jambase.touringRecommendations.length > 0 && (
            <>
              <div style={{ fontWeight: 600, marginTop: 4 }}>Touring Recommendations</div>
              <List items={data.jambase.touringRecommendations} />
            </>
          )}
        </Section>
      )}

      {data.analysis && (
        <Section title="Source Signals (Musixmatch)">
          {data.analysis.meaning && (
            <p style={{ margin: "0 0 4px" }}>
              <strong>Meaning:</strong> {data.analysis.meaning}
            </p>
          )}
          {data.analysis.moods.length > 0 && (
            <p style={{ margin: "0 0 4px" }}>
              <strong>Moods:</strong> {data.analysis.moods.join(", ")}
            </p>
          )}
          {data.analysis.themes.map((th, i) => (
            <div key={i}>
              <strong>{th.theme}</strong>
              {th.quotes.length > 0 ? `: ${th.quotes.join(" / ")}` : ""}
            </div>
          ))}
        </Section>
      )}

      {data.richSyncHighlights.length > 0 && (
        <Section title="RichSync Highlights">
          {data.richSyncHighlights.map((h, i) => (
            <div key={i}>
              <span style={{ color: "#888" }}>{h.time}</span> [{h.signal}] {h.text}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

/**
 * Mount this once inside the workspace shell. The print document is rendered
 * ONLY while a print is in progress, so it never duplicates on-screen content
 * (which would otherwise confuse assistive tech and tests). On the print event
 * it renders the doc, fires `window.print()`, then unmounts after printing.
 */
export function PrintReport() {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const onTrigger = () => setPrinting(true);
    const onAfterPrint = () => setPrinting(false);
    window.addEventListener(PRINT_REPORT_EVENT, onTrigger);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener(PRINT_REPORT_EVENT, onTrigger);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  useLayoutEffect(() => {
    if (!printing) return;
    // Render the doc first, then open the print dialog on the next frame.
    const id = window.requestAnimationFrame(() => {
      try {
        window.print();
      } finally {
        // Fallback for browsers that don't fire `afterprint`.
        setPrinting(false);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [printing]);

  if (!printing) return null;
  return <PrintReportDoc />;
}
