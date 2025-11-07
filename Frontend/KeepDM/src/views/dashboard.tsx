import { ChartAreaInteractive } from '@/components/chart-example'

export function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Vista principal del sistema. Aquí podrás ver un resumen de tu actividad y estadísticas importantes.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}