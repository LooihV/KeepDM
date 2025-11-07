import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPIWidgetProps {
  title: string
  value: number
  label?: string
  format?: 'number' | 'currency' | 'percentage'
}

export function KPIWidget({ title, value, label, format = 'number' }: KPIWidgetProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val)
      case 'percentage':
        return `${val.toFixed(2)}%`
      case 'number':
      default:
        return val.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="text-3xl font-bold">{formatValue(value)}</div>
        {label && (
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        )}
      </CardContent>
    </Card>
  )
}
