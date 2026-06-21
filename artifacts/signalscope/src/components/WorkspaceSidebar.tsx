import { Link } from "wouter";
import { FileOutput, Settings, Lock } from "lucide-react";
import { NAV_GROUPS } from "./workspace/nav";

interface SidebarProps {
  id: string;
  view: string;
}

export default function WorkspaceSidebar({ id, view }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card/30 flex-col hidden md:flex custom-scrollbar overflow-y-auto">
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
            <button
              onClick={() => window.print()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <FileOutput className="w-4 h-4 shrink-0" />
              <span className="truncate">Export Report</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground/50 cursor-not-allowed"
              title="Settings — coming soon"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">Settings</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider">
                <Lock className="w-2.5 h-2.5" />
                Soon
              </span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
