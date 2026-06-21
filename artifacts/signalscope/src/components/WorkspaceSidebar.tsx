import { Layers, Activity, Globe, TrendingUp, Zap, Mic2, LayoutDashboard, Share2, Download, Settings } from "lucide-react";

interface SidebarProps {
  onSelect: (id: string) => void;
  activeSection: string;
}

export default function WorkspaceSidebar({ onSelect, activeSection }: SidebarProps) {
  const groups = [
    {
      label: "Intelligence",
      items: [
        { id: "executive", label: "Executive Briefing", icon: LayoutDashboard },
        { id: "audience", label: "Audience Intelligence", icon: Layers },
        { id: "emotion", label: "Emotional Analysis", icon: Activity },
        { id: "cultural", label: "Cultural Signals", icon: Globe },
        { id: "virality", label: "Virality Intelligence", icon: Zap },
      ]
    },
    {
      label: "Strategy",
      items: [
        { id: "growth", label: "Growth Intelligence", icon: TrendingUp },
        { id: "distribution", label: "Distribution Strategy", icon: Share2 },
        { id: "actions", label: "Artist Actions", icon: Mic2 },
      ]
    }
  ];

  return (
    <div className="w-64 shrink-0 border-r border-border bg-card/30 flex flex-col hidden md:flex custom-scrollbar overflow-y-auto">
      <div className="p-4 space-y-6">
        {groups.map((group, i) => (
          <div key={i}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {group.label}
            </p>
            <nav className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      active 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
        
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            System
          </p>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}