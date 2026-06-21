import {
  SiSpotify,
  SiTiktok,
  SiYoutube,
  SiInstagram,
  SiApplemusic,
  SiSoundcloud,
  SiShazam,
  SiTidal,
  SiPandora,
  type IconType,
} from "react-icons/si";
import { BarChart3 } from "lucide-react";

/**
 * Official brand icons for the platforms Songstats reports on. Sources without
 * an available brand icon fall back to a neutral chart glyph — never an emoji
 * or a fabricated logo.
 */
const BRAND_ICONS: Record<string, IconType> = {
  spotify: SiSpotify,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  instagram: SiInstagram,
  apple_music: SiApplemusic,
  soundcloud: SiSoundcloud,
  shazam: SiShazam,
  tidal: SiTidal,
  pandora: SiPandora,
};

const BRAND_COLORS: Record<string, string> = {
  spotify: "text-[#1DB954]",
  tiktok: "text-foreground",
  youtube: "text-[#FF0000]",
  instagram: "text-[#E4405F]",
  apple_music: "text-[#FA243C]",
  soundcloud: "text-[#FF5500]",
  shazam: "text-[#0088FF]",
  tidal: "text-foreground",
  pandora: "text-[#224099]",
};

export function songstatsBrandColor(source: string): string {
  return BRAND_COLORS[source] ?? "text-muted-foreground";
}

export default function SongstatsBrandIcon({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const Icon = BRAND_ICONS[source];
  if (!Icon) return <BarChart3 className={className} />;
  return <Icon className={className} />;
}
