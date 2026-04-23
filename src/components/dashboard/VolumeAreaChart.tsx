"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
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

export function VolumeAreaChart({ incidents }: VolumeAreaChartProps) {
  const data = computeWeeklyVolume(incidents);

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col pt-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Incident Volume
          </p>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
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
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="none"
                stroke="hsl(var(--border))"
                strokeOpacity={0.3}
                horizontal
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#ef4444"
                strokeWidth={1.5}
                fill="url(#volumeGradient)"
                dot={{ r: 2.5, fill: "#ef4444", strokeWidth: 0 }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
