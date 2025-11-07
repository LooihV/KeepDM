"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

interface BarWidgetProps {
  title: string
  data: Array<{ label: string; value: number }>
  dataKey?: string
  labelKey?: string
  color?: string
}

export function BarWidget({
  title,
  data,
  dataKey = "value",
  labelKey = "label",
  color = "var(--chart-1)",
}: BarWidgetProps) {
  // Transformar data al formato que espera recharts
  const chartData = data.map((item) => ({
    [labelKey]: item.label,
    [dataKey]: item.value,
  }))

  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey={labelKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => {
                // Truncar labels largos
                if (value.length > 15) {
                  return value.slice(0, 12) + '...'
                }
                return value
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => {
                // Formatear números grandes
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`
                }
                return value.toString()
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
