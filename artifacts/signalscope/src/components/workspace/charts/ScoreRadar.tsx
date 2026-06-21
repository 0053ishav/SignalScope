import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { IntelligenceReport } from "@/types/intelligence";
import { clamp } from "@/lib/intelligence";

export default function ScoreRadar({ scores }: { scores: IntelligenceReport["scores"] }) {
  const data = useMemo(
    () => [
      { subject: "Audience", A: clamp(scores.audience), fullMark: 100 },
      { subject: "Emotion", A: clamp(scores.emotion), fullMark: 100 },
      { subject: "Virality", A: clamp(scores.virality), fullMark: 100 },
      { subject: "Growth", A: clamp(scores.growth), fullMark: 100 },
    ],
    [scores],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="A"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
