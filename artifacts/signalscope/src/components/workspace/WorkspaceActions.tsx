import { useEffect, useRef, useState } from "react";
import { FileOutput, Printer, Download, Link2, Check, ChevronDown } from "lucide-react";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";

export default function WorkspaceActions() {
  const { track, report, reportSource } = useTrackWorkspace();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const slug = `${track.artist_name}-${track.track_name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  function downloadJson() {
    if (!report) return;
    const payload = {
      track: {
        commontrack_id: track.commontrack_id,
        track_name: track.track_name,
        artist_name: track.artist_name,
        album_name: track.album_name,
        isrc: track.track_isrc ?? null,
      },
      source: reportSource ?? report.source ?? "unknown",
      generatedAt: new Date().toISOString(),
      report,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signalscope-${slug || track.commontrack_id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function shareReport() {
    const url = window.location.href;
    const title = `SignalScope — ${track.track_name} · ${track.artist_name}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: "Audience intelligence report", url });
        setOpen(false);
        return;
      } catch {
        /* user dismissed share sheet — fall through to copy */
      }
    }
    await copyLink();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors cursor-pointer"
        title="Export & share"
      >
        <FileOutput className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-popover shadow-xl z-30 p-1.5 animate-in fade-in slide-in-from-top-1"
        >
          <MenuItem icon={Printer} label="Print / Save as PDF" onClick={() => { window.print(); setOpen(false); }} />
          <MenuItem
            icon={Download}
            label="Download Intelligence (JSON)"
            onClick={downloadJson}
            disabled={!report}
            hint={!report ? "Report still generating" : undefined}
          />
          <div className="my-1 h-px bg-border" />
          <MenuItem
            icon={copied ? Check : Link2}
            label={copied ? "Link copied" : "Copy link"}
            onClick={copyLink}
            accent={copied}
          />
          <MenuItem icon={FileOutput} label="Share report" onClick={shareReport} />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-secondary"
      } ${accent ? "text-emerald-400" : "text-foreground"}`}
      title={hint}
    >
      <Icon className={`w-4 h-4 shrink-0 ${accent ? "text-emerald-400" : "text-muted-foreground"}`} />
      <span className="flex-1">{label}</span>
    </button>
  );
}
