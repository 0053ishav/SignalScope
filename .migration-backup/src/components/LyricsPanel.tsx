"use client";

import { LyricSegment } from "@/types/music";
import { useEffect, useMemo, useRef, useState } from "react";

interface LyricsPanelProps {
  lyrics?: string;
  language?: string;
  translations?: string[];
  segments?: LyricSegment[];
  commontrackId: string;
}

export default function LyricsPanel({
  lyrics,
  language,
  translations = [],
  segments = [],
  commontrackId,
}: LyricsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language ?? "en");
  const [currentTime, setCurrentTime] = useState(0);
  const [translatedLyrics, setTranslatedLyrics] = useState<string | null>(null);

  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeSegment = useMemo(() => {
    return segments.find(
      (segment) =>
        currentTime >= segment.startTime && currentTime <= segment.endTime,
    );
  }, [segments, currentTime]);

  useEffect(() => {
    if (isScrubbing) return;

    const activeEl = activeLineRef.current;
    const container = lyricsContainerRef.current;

    if (!activeEl || !container) return;

    const activeTop = activeEl.offsetTop;
    const activeHeight = activeEl.offsetHeight;

    container.scrollTo({
      top: activeTop - container.clientHeight + activeHeight / 2,
      behavior: "smooth",
    });
  }, [activeSegment, isScrubbing]);


  if (!lyrics?.trim()) {
    return (
      <section className="rounded-2xl border border-border bg-card/80 p-6">
        <h2 className="text-xl font-semibold">Lyrics</h2>
        <p className="text-sm text-muted mt-2">
          No lyrics available for this track.
        </p>
      </section>
    );
  }

  async function handleLanguageChange(lang: string) {
    setSelectedLanguage(lang);
    setTranslationError(null);

    if (lang === language) {
      setTranslatedLyrics(null);
      setTranslationError(null);
      return;
    }

    try {
      setLoadingTranslation(true);

      const response = await fetch(
        `/api/lyrics/translation?commontrackId=${commontrackId}&language=${lang}`,
      );

      const data = await response.json();
      setTranslatedLyrics(data.translation);
      setExpanded(true);
    } catch (error) {
      setTranslationError("Translation unavailable");
      console.error(error);
    } finally {
      setLoadingTranslation(false);
    }
  }

  const displayedLyrics = translatedLyrics ?? lyrics;

  const preview = displayedLyrics
    .split("\n")
    .filter(Boolean)
    .slice(0, 8)
    .join("\n");

  const lyricLines = (expanded ? displayedLyrics : preview)
    .split("\n")
    .filter(Boolean);

  const maxTime =
    segments.length > 0
      ? Math.ceil(segments[segments.length - 1].endTime)
      : 300;

  const showTimeline = selectedLanguage === language;

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-transparent p-6 backdrop-blur-sm">
      {/* Header */}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {showTimeline ? "Lyrics & RichSync Timeline" : "Translated Lyrics"}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {selectedLanguage.toUpperCase()}
          </p>
        </div>

        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
          Musixmatch
        </span>
      </div>

      {/* Translation Selector */}

      {translations.length > 0 && (
        <div className="mb-5">
          <label className="mb-2 block text-xs text-muted">Translation</label>

          <select
            disabled={loadingTranslation}
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className={`w-full rounded-lg border border-border bg-card px-3 py-2 text-sm ${
              loadingTranslation ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <option value={language}>
              {language?.toUpperCase()} (Original)
            </option>

            {translations.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      {loadingTranslation && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />

          <span className="text-sm text-violet-300">
            Loading Translation...
          </span>
        </div>
      )}

      {translationError && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-300">{translationError}</p>
        </div>
      )}
      {/* Timeline */}

      {showTimeline && segments.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>{currentTime.toFixed(1)}s</span>

            <span>{maxTime.toFixed(0)}s</span>
          </div>

          <input
            type="range"
            min={0}
            max={maxTime}
            step={0.1}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full"
              onMouseDown={() => setIsScrubbing(true)}
  onMouseUp={() => setIsScrubbing(false)}
  onTouchStart={() => setIsScrubbing(true)}
  onTouchEnd={() => setIsScrubbing(false)}
          />
        </div>
      )}

      {/* RichSync Lines */}

      {showTimeline && segments.length > 0 ? (
        <div
          ref={lyricsContainerRef}
          className="max-h-[500px] overflow-y-auto scrollbar-hide space-y-2"
        >
          {segments.map((segment, index) => {
            const isActive = activeSegment?.startTime === segment.startTime;

            return (
              <div
                ref={isActive ? activeLineRef : null}
                key={`${segment.startTime}-${index}`}
                className={`rounded-xl border p-4 transition-all duration-300 ${
                  isActive
                    ? "border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10 scale-[1.02]"
                    : "border-transparent text-zinc-400"
                }`}
              >
                <div
                  className={`mb-1 text-xs ${
                    isActive
                      ? "text-violet-300 font-semibold"
                      : "text-violet-400"
                  }`}
                >
                  {segment.startTime.toFixed(1)}s
                </div>

                <div>{segment.text}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div
            className={
              expanded ? "max-h-[500px] overflow-y-auto scrollbar-hide" : ""
            }
          >
            <div className="space-y-3">
              {lyricLines.map((line, index) => (
                <p
                  key={index}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-all hover:bg-violet-500/5 hover:text-white"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {!expanded && (
            <div className="pointer-events-none mt-2 h-12 bg-gradient-to-t from-card to-transparent" />
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/20"
          >
            {expanded ? "Hide Lyrics ↑" : "Show Full Lyrics ↓"}
          </button>
        </>
      )}
    </section>
  );
}
