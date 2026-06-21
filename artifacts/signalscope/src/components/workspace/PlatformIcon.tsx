import {
  Music2,
  Instagram,
  Youtube,
  Radio,
  CalendarDays,
  Share2,
  type LucideIcon,
} from "lucide-react";

const MAP: { match: string[]; icon: LucideIcon }[] = [
  { match: ["tiktok", "tik tok"], icon: Music2 },
  { match: ["instagram", "reels", "ig"], icon: Instagram },
  { match: ["youtube", "shorts", "yt"], icon: Youtube },
  { match: ["spotify", "apple music", "streaming", "playlist"], icon: Radio },
  { match: ["live", "tour", "event", "concert", "venue"], icon: CalendarDays },
];

export function resolvePlatformIcon(platform: string): LucideIcon {
  const p = platform.toLowerCase();
  for (const entry of MAP) {
    if (entry.match.some((m) => p.includes(m))) return entry.icon;
  }
  return Share2;
}

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = resolvePlatformIcon(platform);
  return <Icon className={className} />;
}
