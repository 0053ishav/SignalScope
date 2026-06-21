import { AudioWaveform } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ComingSoonCard from "@/components/workspace/ComingSoonCard";

export default function SonicPage() {
  return (
    <WorkspacePage
      id="sonic"
      title="Sonic Intelligence"
      description="Audio-derived features — tempo, key, energy, and timbre — a future layer of the workspace."
    >
      <ComingSoonCard
        icon={AudioWaveform}
        partner="Cyanite"
        description="Sonic analysis — tempo, key, energy, danceability, and timbral character derived from the audio itself — will appear here once an audio-analysis partner is connected. No audio features are shown until then."
        sections={["Tempo & Key", "Energy Profile", "Danceability", "Instrumentation", "Timbre", "Genre Affinity"]}
      />
    </WorkspacePage>
  );
}
