"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

interface LineWidgetProps {
  title: string
  data: Array<{ label: string; value: number }>
  dataKey?: string
  labelKey?: string
  color?: string
}

export function LineWidget({
  title,
  data,
  dataKey = "value",
  labelKey = "label",
  color = "var(--chart-2)",
}: LineWidgetProps) {
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
          <LineChart
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
              cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '5 5' }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey={dataKey}
              type="monotone"
              stroke={color}
              strokeWidth={2}
              dot={{
                fill: color,
                r: 3,
              }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
