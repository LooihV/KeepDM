"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { WidgetError } from "./widget-error"

interface AreaWidgetProps {
  title: string
  data: Array<{ label: string; value: number }>
  dataKey?: string
  labelKey?: string
  color?: string
}

export function AreaWidget({
  title,
  data,
  dataKey = "value",
  labelKey = "label",
  color = "var(--chart-3)",
}: AreaWidgetProps) {
  // Validar que los datos existan y sean válidos
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <WidgetError title={title} message="Los datos del gráfico son undefined, no son un array o están vacíos" />
  }

  // Validar que cada elemento tenga las propiedades necesarias
  const hasInvalidData = data.some(
    item => item === undefined || item === null || item.label === undefined || item.value === undefined || isNaN(item.value)
  )

  if (hasInvalidData) {
    return <WidgetError title={title} message="Algunos elementos de los datos tienen propiedades undefined o valores inválidos" />
  }

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
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >
            <defs>
              <linearGradient id={`fill${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
            <Area
              dataKey={dataKey}
              type="monotone"
              fill={`url(#fill${dataKey})`}
              fillOpacity={0.4}
              stroke={color}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
