import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  dashboardService, 
  type DashboardData, 
  type KPIWidgetData, 
  type ChartWidgetData, 
  type TableWidgetData 
} from "@/api/services/dashboard.service"
import { KPIWidget, BarWidget, LineWidget, AreaWidget, PieWidget, TableWidget } from "@/components/widgets"
import { WidgetError } from "@/components/widgets/widget-error"

export function DashboardDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!id) return

      try {
        const data = await dashboardService.getData(id)
        setDashboardData(data)
      } catch (error) {
        console.error("Error al cargar dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Dashboard no encontrado</p>
        </div>
      </div>
    )
  }

  // Ordenar widgets por posición
  const sortedWidgets = [...dashboardData.widgets].sort((a, b) => a.position - b.position)

  // Dividir widgets según el layout: 3 arriba, 1 en medio, 2 abajo
  const topWidgets = sortedWidgets.slice(0, 3) // Posiciones 1, 2, 3
  const middleWidget = sortedWidgets[3] // Posición 4
  const bottomWidgets = sortedWidgets.slice(4, 6) // Posiciones 5, 6

  // Función para renderizar un widget según su tipo
  const renderWidget = (widget: DashboardData['widgets'][0]) => {
    const { chart_type, title, data } = widget

    // Validar que existan los datos básicos
    if (!data) {
      return <WidgetError title={title} message="No se recibieron datos para este widget" />
    }

    try {
      switch (chart_type) {
        case 'kpi': {
          const kpiData = data as KPIWidgetData
          // Validación adicional antes de renderizar
          if (kpiData.value === undefined || kpiData.value === null) {
            return <WidgetError title={title} message="El valor del KPI es undefined o null" />
          }
          return (
            <KPIWidget
              title={title}
              value={kpiData.value}
              label={kpiData.label}
              format="number"
            />
          )
        }
        case 'bar': {
          const chartData = data as ChartWidgetData
          // Validación de estructura de datos
          if (!chartData.labels || !chartData.data || !Array.isArray(chartData.labels) || !Array.isArray(chartData.data)) {
            return <WidgetError title={title} message="Los datos del gráfico tienen una estructura inválida" />
          }
          if (chartData.labels.length !== chartData.data.length) {
            return <WidgetError title={title} message="Las etiquetas y los datos no coinciden en cantidad" />
          }
          const formattedData = chartData.labels.map((label, index) => ({
            label,
            value: chartData.data[index],
          }))
          return <BarWidget title={title} data={formattedData} />
        }
        case 'line': {
          const chartData = data as ChartWidgetData
          // Validación de estructura de datos
          if (!chartData.labels || !chartData.data || !Array.isArray(chartData.labels) || !Array.isArray(chartData.data)) {
            return <WidgetError title={title} message="Los datos del gráfico tienen una estructura inválida" />
          }
          if (chartData.labels.length !== chartData.data.length) {
            return <WidgetError title={title} message="Las etiquetas y los datos no coinciden en cantidad" />
          }
          const formattedData = chartData.labels.map((label, index) => ({
            label,
            value: chartData.data[index],
          }))
          return <LineWidget title={title} data={formattedData} />
        }
        case 'area': {
          const chartData = data as ChartWidgetData
          // Validación de estructura de datos
          if (!chartData.labels || !chartData.data || !Array.isArray(chartData.labels) || !Array.isArray(chartData.data)) {
            return <WidgetError title={title} message="Los datos del gráfico tienen una estructura inválida" />
          }
          if (chartData.labels.length !== chartData.data.length) {
            return <WidgetError title={title} message="Las etiquetas y los datos no coinciden en cantidad" />
          }
          const formattedData = chartData.labels.map((label, index) => ({
            label,
            value: chartData.data[index],
          }))
          return <AreaWidget title={title} data={formattedData} />
        }
        case 'pie': {
          const chartData = data as ChartWidgetData
          // Validación de estructura de datos
          if (!chartData.labels || !chartData.data || !Array.isArray(chartData.labels) || !Array.isArray(chartData.data)) {
            return <WidgetError title={title} message="Los datos del gráfico tienen una estructura inválida" />
          }
          if (chartData.labels.length !== chartData.data.length) {
            return <WidgetError title={title} message="Las etiquetas y los datos no coinciden en cantidad" />
          }
          const formattedData = chartData.labels.map((label, index) => ({
            label,
            value: chartData.data[index],
          }))
          return <PieWidget title={title} data={formattedData} />
        }
        case 'table': {
          const tableData = data as TableWidgetData
          // Validación de estructura de datos
          if (!tableData.columns || !tableData.rows || !Array.isArray(tableData.columns) || !Array.isArray(tableData.rows)) {
            return <WidgetError title={title} message="Los datos de la tabla tienen una estructura inválida (se esperan 'columns' y 'rows')" />
          }
          
          // Validar que haya al menos una columna
          if (tableData.columns.length === 0) {
            return <WidgetError title={title} message="La tabla no tiene columnas definidas" />
          }
          
          // Transformar rows (array de arrays) a array de objetos
          const formattedData = tableData.rows.map((row) => {
            const rowObject: Record<string, any> = {}
            tableData.columns.forEach((column, index) => {
              rowObject[column] = row[index]
            })
            return rowObject
          })
          
          return <TableWidget title={title} columns={tableData.columns} data={formattedData} />
        }
        default:
          return (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Tipo de chart no soportado: {chart_type}</p>
                </div>
              </CardContent>
            </Card>
          )
      }
    } catch (error) {
      // Capturar cualquier error durante el renderizado
      console.error(`Error al renderizar widget "${title}":`, error)
      return <WidgetError title={title} message={`Error inesperado: ${error instanceof Error ? error.message : 'Unknown error'}`} />
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dashboardData.name}</h1>
            <p className="text-muted-foreground">
              {dashboardData.widgets.length} widgets • Layout: {dashboardData.layout_type}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="flex flex-col gap-4">
        {/* Fila superior: 3 widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topWidgets.map((widget) => (
            <div key={widget.position} className="h-[250px]">
              {renderWidget(widget)}
            </div>
          ))}
        </div>

        {/* Fila media: 1 widget full width */}
        {middleWidget && (
          <div className="grid grid-cols-1 gap-4">
            <div className="h-[300px]">
              {renderWidget(middleWidget)}
            </div>
          </div>
        )}

        {/* Fila inferior: 2 widgets */}
        {bottomWidgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bottomWidgets.map((widget) => (
              <div key={widget.position} className="h-[300px]">
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
