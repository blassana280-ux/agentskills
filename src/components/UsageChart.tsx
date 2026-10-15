import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCost } from "../lib/core";

export type UsageChartPoint = { provider: string; count: number; cost: number; costKnown: boolean };

export default function UsageChart({ data }: { data: UsageChartPoint[] }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="provider" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(value) => `$${Number(value).toFixed(3)}`} width={62} />
          <Tooltip cursor={{ fill: "var(--chart-hover)" }} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} formatter={(value: number) => [formatCost(value), "Coût"]} />
          <Bar dataKey="cost" fill="var(--accent)" radius={[7, 7, 2, 2]} maxBarSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
