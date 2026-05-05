"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { Incident } from "@/lib/types";

interface VolumeAreaChartProps {
  incidents: Incident[];
}

function computeWeeklyVolume(
  incidents: Incident[]
): { week: string; count: number }[] {
  const now = new Date();
  const weeks: { week: string; count: number }[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const count = incidents.filter((inc) => {
      const created = new Date(inc.created_at);
      return created >= weekStart && created < weekEnd;
    }).length;

    const label = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    weeks.push({ week: label, count });
  }

  return weeks;
}

function VolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-foreground">
        {payload[0].value}{" "}
        <span className="font-normal text-muted-foreground">incidents</span>
      </p>
    </div>
  );
}

export function VolumeAreaChart({ incidents }: VolumeAreaChartProps) {
  const data = computeWeeklyVolume(incidents);
  const peak = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="flex h-full flex-col border-border/60">
      <CardContent className="flex flex-1 flex-col px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Incident Volume
          </p>
          <span className="rounded-sm border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
            8 weeks
          </span>
        </div>
        <div className="mt-2 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.4}
                horizontal
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, Math.ceil(peak * 1.2)]}
              />
              <Tooltip
                content={<VolumeTooltip />}
                cursor={{
                  stroke: "var(--primary)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                  strokeOpacity: 0.5,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={1.5}
                fill="url(#volumeGradient)"
                dot={{ r: 2.5, fill: "var(--primary)", strokeWidth: 0 }}
                activeDot={{
                  r: 4,
                  fill: "var(--primary)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
