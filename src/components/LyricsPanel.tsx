"use client";

import { useState } from "react";

interface LyricsPanelProps {
  lyrics?: string;
  language?: string;
}

export default function LyricsPanel({ lyrics, language }: LyricsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!lyrics?.trim()) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Lyrics</h2>

            <p className="text-sm text-muted">
              No lyrics available for this track.
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
            Unavailable
          </span>
        </div>
      </section>
    );
  }

  const preview = lyrics.split("\n").filter(Boolean).slice(0, 8).join("\n");

  const lines = (expanded ? lyrics : preview).split("\n").filter(Boolean);

  return (
    <section className="overflow-hidden  rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-transparent p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lyrics</h2>

          {language && (
            <p className="mt-1 text-sm text-muted">{language.toUpperCase()}</p>
          )}
        </div>

        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
          Musixmatch
        </span>
      </div>

      <div
        className={
          expanded ? "max-h-[500px] overflow-y-auto pr-2 scrollbar-hide" : ""
        }
      >
        <div
          className={
            expanded ? "max-h-[500px] overflow-y-auto scrollbar-hide" : ""
          }
        >
          <div className="space-y-3">
            {lines.map((line, index) => (
              <p
                key={index}
                className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-all hover:bg-violet-500/5 hover:text-white"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {!expanded && (
        <div className="pointer-events-none mt-2 h-12 bg-gradient-to-t from-card to-transparent" />
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/20 cursor-pointer"
      >
        {expanded ? "Hide Lyrics ↑" : "Show Full Lyrics ↓"}
      </button>
    </section>
  );
}
