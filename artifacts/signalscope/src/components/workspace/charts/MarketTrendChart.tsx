import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { SongstatsTrend } from "@/types/songstats";
import { formatCompactNumber } from "@/lib/songstats";
import { EmptyChart } from "../ChartCard";

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MarketTrendChart({ trend }: { trend: SongstatsTrend }) {
  const data = useMemo(
    () => trend.points.map((p) => ({ date: p.date, value: p.value })),
    [trend.points],
  );

  if (data.length < 2) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="marketTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          axisLine={false}
          tickLine={false}
          minTickGap={28}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v: number) => formatCompactNumber(v)}
          axisLine={false}
          tickLine={false}
          width={48}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--border))" }}
          labelFormatter={(label: string) => formatDate(label)}
          formatter={(value: number) => [formatCompactNumber(value), trend.metric]}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#marketTrendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
