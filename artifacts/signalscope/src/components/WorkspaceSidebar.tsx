import { useEffect, useState } from "react";
import { Link } from "wouter";
import { FileOutput, Lock, X, ChevronRight } from "lucide-react";
import { NAV_GROUPS } from "./workspace/nav";
import { ExportMenuItems } from "./workspace/ExportMenuItems";

interface SidebarProps {
  id: string;
  view: string;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function WorkspaceSidebar({ id, view, mobileOpen, onClose }: SidebarProps) {
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  useEffect(() => {
    if (!exportOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Element) || !target.closest("[data-export-root]")) {
        setExportOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExportOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [exportOpen]);

  const nav = (
    <div className="p-4 space-y-6 flex-1">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {group.label}
          </p>
          <nav className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = view === item.view;
              return (
                <Link
                  key={item.view}
                  href={`/track/${id}/${item.view}`}
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{item.label}</span>
                  {item.soon && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Lock className="w-2.5 h-2.5" />
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      {/* System */}
      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">System</p>
        <nav className="space-y-1">
          <div data-export-root>
            <button
              onClick={() => setExportOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <FileOutput className="w-4 h-4 shrink-0" />
              <span className="truncate">Export Report</span>
              <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${exportOpen ? "rotate-90" : ""}`} />
            </button>
            {exportOpen && (
              <div role="menu" className="mt-1 ml-2 pl-2 border-l border-border space-y-0.5">
                <ExportMenuItems
                  onAfter={() => {
                    setExportOpen(false);
                    onClose();
                  }}
                />
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-card/30 flex-col hidden md:flex custom-scrollbar overflow-y-auto">
        {nav}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Workspace navigation"
          className={`absolute left-0 top-0 h-full w-72 max-w-[85%] bg-card border-r border-border flex flex-col overflow-y-auto custom-scrollbar transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold tracking-tight">Navigation</span>
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {nav}
        </aside>
      </div>
    </>
  );
}
