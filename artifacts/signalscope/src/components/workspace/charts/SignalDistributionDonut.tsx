import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { IntelligenceReport } from "@/types/intelligence";
import { CHART_COLORS } from "@/lib/intelligence";
import { EmptyChart } from "../ChartCard";

export default function SignalDistributionDonut({ report }: { report: IntelligenceReport }) {
  const data = useMemo(
    () =>
      [
        { name: "Archetypes", value: report.audienceArchetypes.length },
        { name: "Emotions", value: report.emotionalPositioning.length },
        { name: "Cultural", value: report.culturalPositioning.length },
        { name: "Viral", value: report.viralDrivers.length },
      ].filter((d) => d.value > 0),
    [report],
  );

  if (data.length === 0) return <EmptyChart />;

  return (
    <>
      <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
    </>
  );
}
