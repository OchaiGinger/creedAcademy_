"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  enrollment: {
    label: "Enrollments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ChartData {
  date: string;
  enrollment: number;
}

export function ChartAreaInteractive({ data }: { data: ChartData[] }) {
  // 1. Prevent Hydration/Hanging issues by ensuring we are on the client
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder with the same height to prevent layout shift
    return (
      <div className="h-100 w-full bg-muted/20 animate-pulse rounded-xl" />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Enrollments</CardTitle>
        <CardDescription>
          Real-time enrollment trends (Last 30 Days)
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          // 2. Changed h-75 to a standard Tailwind height h-[300px]
          className="aspect-auto h-75 w-full"
          config={chartConfig}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                // 3. Safety check for invalid dates
                if (isNaN(date.getTime())) return "";
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-40"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return "";
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey="enrollment"
              fill="var(--color-enrollment)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
