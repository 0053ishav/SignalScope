import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { PlatformFit } from "@/types/intelligence";
import { platformScoreValue } from "@/lib/intelligence";
import { EmptyChart } from "../ChartCard";

export default function PlatformFitBar({ platformFit }: { platformFit: PlatformFit[] }) {
  const data = useMemo(
    () => platformFit.map((p) => ({ name: p.platform, score: platformScoreValue(p.score) })),
    [platformFit],
  );

  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 30, bottom: 0 }}>
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
          width={110}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
