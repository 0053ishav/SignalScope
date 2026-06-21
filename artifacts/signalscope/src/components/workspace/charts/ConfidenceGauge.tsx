import { ResponsiveContainer, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { clamp } from "@/lib/intelligence";

export default function ConfidenceGauge({ confidence }: { confidence: number }) {
  const value = clamp(confidence);
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="68%"
          outerRadius="100%"
          barSize={14}
          data={[{ name: "Confidence", value, fill: "hsl(var(--primary))" }]}
          startAngle={90}
          endAngle={90 - (360 * value) / 100}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold tracking-tight">{value}%</span>
        <span className="text-xs text-muted-foreground">confidence</span>
      </div>
    </div>
  );
}
