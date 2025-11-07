"use client"

import { Pie, PieChart, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { WidgetError } from "./widget-error"

interface PieWidgetProps {
  title: string
  data: Array<{ label: string; value: number }>
  colors?: string[]
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function PieWidget({
  title,
  data,
  colors = DEFAULT_COLORS,
}: PieWidgetProps) {
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
  const chartData = data.map((item, index) => ({
    name: item.label,
    value: item.value,
    fill: colors[index % colors.length],
  }))

  // Crear config dinámico basado en los datos
  const chartConfig = data.reduce((acc, item, index) => {
    const key = item.label.toLowerCase().replace(/\s+/g, '_')
    acc[key] = {
      label: item.label,
      color: colors[index % colors.length],
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>) satisfies ChartConfig

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              labelLine={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1 }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              verticalAlign="top"
              height={20}
              formatter={(value) => {
                const item = data.find(d => d.label === value)
                return `${value} (${item?.value || 0})`
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
