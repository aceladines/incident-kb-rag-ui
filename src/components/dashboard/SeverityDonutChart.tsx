"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { Incident, IncidentSeverity } from "@/lib/types";

interface SeverityDonutChartProps {
  incidents: Incident[];
}

const SEVERITY_CONFIG: {
  key: IncidentSeverity;
  label: string;
  color: string;
}[] = [
  { key: "critical", label: "Critical", color: "#ef4444" },
  { key: "high", label: "High", color: "#f97316" },
  { key: "medium", label: "Medium", color: "#eab308" },
  { key: "low", label: "Low", color: "#3b82f6" },
];

function SeverityTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; value: number; color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {name}
        </span>
      </div>
      <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

export function SeverityDonutChart({ incidents }: SeverityDonutChartProps) {
  const data = SEVERITY_CONFIG.map((s) => ({
    name: s.label,
    value: incidents.filter((i) => i.severity === s.key).length,
    color: s.color,
  }));

  const total = incidents.length;

  return (
    <Card className="flex h-full flex-col border-border/60">
      <CardContent className="flex flex-1 flex-col px-4 pt-3 pb-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          By Severity
        </p>
        <div className="flex flex-1 items-center gap-3">
          {/* Donut */}
          <div className="relative flex-[2]">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  animationDuration={800}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      className="outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<SeverityTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-foreground">{total}</p>
                <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                  Total
                </p>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-1 flex-col gap-2.5 pr-1">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="flex-1 text-[11px] text-muted-foreground">
                  {entry.name}
                </span>
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
