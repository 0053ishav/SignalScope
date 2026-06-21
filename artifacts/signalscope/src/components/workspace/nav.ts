import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Globe,
  Sparkles,
  Share2,
  TrendingUp,
  MapPinned,
  AudioWaveform,
  BadgeCheck,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  view: string;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Intelligence",
    items: [
      { view: "overview", label: "Overview", icon: LayoutDashboard },
      { view: "audience", label: "Audience Intelligence", icon: Users },
      { view: "emotional", label: "Emotional Intelligence", icon: HeartHandshake },
      { view: "cultural", label: "Cultural Intelligence", icon: Globe },
      { view: "content", label: "Content Intelligence", icon: Sparkles },
      { view: "distribution", label: "Distribution Intelligence", icon: Share2 },
    ],
  },
  {
    label: "Market",
    items: [
      { view: "performance", label: "Performance Intelligence", icon: TrendingUp },
    ],
  },
  {
    label: "Strategy",
    items: [
      { view: "live", label: "Live Intelligence", icon: MapPinned, soon: true },
      { view: "sonic", label: "Sonic Intelligence", icon: AudioWaveform, soon: true },
    ],
  },
  {
    label: "Analysis",
    items: [
      { view: "evidence", label: "Evidence Layer", icon: BadgeCheck },
      { view: "source", label: "Source Data", icon: Database },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export const KNOWN_VIEWS = ALL_ITEMS.map((i) => i.view);

export const DEFAULT_VIEW = "overview";

export function getNavItem(view: string): NavItem | undefined {
  return ALL_ITEMS.find((i) => i.view === view);
}
