import { MapPinned } from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import ComingSoonCard from "@/components/workspace/ComingSoonCard";

export default function LivePage() {
  return (
    <WorkspacePage
      id="live"
      title="Live Intelligence"
      description="Touring, events, and live-performance signals — a future layer of the workspace."
    >
      <ComingSoonCard
        icon={MapPinned}
        partner="JamBase"
        description="Live and touring intelligence — upcoming shows, routing, venue fit, and event demand — will appear here once a live-events partner is connected. No live data is shown until then."
        sections={["Upcoming Shows", "Tour Routing", "Venue Fit", "Event Demand", "Regional Hotspots", "Festival Matches"]}
      />
    </WorkspacePage>
  );
}
