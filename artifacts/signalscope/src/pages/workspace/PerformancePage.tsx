import { TrendingUp } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ComingSoonCard from "@/components/workspace/ComingSoonCard";

export default function PerformancePage() {
  return (
    <WorkspacePage
      id="performance"
      title="Performance Intelligence"
      description="Streaming, chart, and audience performance metrics — a future layer of the workspace."
    >
      <ComingSoonCard
        icon={TrendingUp}
        partner="Songstats"
        description="Real performance signals — streaming velocity, playlist placements, chart movement, and audience growth — will live here once a performance-data partner is connected. Until then, no performance numbers are shown to avoid fabricating metrics."
        sections={["Streaming Velocity", "Playlist Placements", "Chart Movement", "Audience Growth", "Geographic Spread", "Listener Demographics"]}
      />
    </WorkspacePage>
  );
}
