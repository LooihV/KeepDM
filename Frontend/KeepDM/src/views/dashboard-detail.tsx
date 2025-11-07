import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardService, type Dashboard } from "@/api/services/dashboard.service"

export function DashboardDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!id) return

      try {
        // TODO: Implementar endpoint getById cuando esté disponible
        const dashboards = await dashboardService.getAll()
        const found = dashboards.find((d) => d._id === id)
        setDashboard(found || null)
      } catch (error) {
        console.error("Error al cargar dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
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

  if (!dashboard) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Dashboard no encontrado</p>
        </div>
      </div>
    )
  }

  // Ordenar widgets por posición
  const sortedWidgets = [...dashboard.widgets].sort((a, b) => a.position - b.position)

  // Dividir widgets según el layout: 3 arriba, 1 en medio, 2 abajo
  const topWidgets = sortedWidgets.slice(0, 3) // Posiciones 1, 2, 3
  const middleWidget = sortedWidgets[3] // Posición 4
  const bottomWidgets = sortedWidgets.slice(4, 6) // Posiciones 5, 6

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
            <h1 className="text-3xl font-bold">{dashboard.name}</h1>
            <p className="text-muted-foreground">
              {dashboard.widgets.length} widgets • Layout: {dashboard.layout_type}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="flex flex-col gap-4">
        {/* Fila superior: 3 widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topWidgets.map((widget) => (
            <Card key={widget.position} className="h-[250px]">
              <CardHeader>
                <CardTitle className="text-base">{widget.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-sm font-medium">{widget.chart_type.toUpperCase()}</p>
                    <p className="text-xs mt-1">Position {widget.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fila media: 1 widget full width */}
        {middleWidget && (
          <div className="grid grid-cols-1 gap-4">
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-base">{middleWidget.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-sm font-medium">{middleWidget.chart_type.toUpperCase()}</p>
                    <p className="text-xs mt-1">Position {middleWidget.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fila inferior: 2 widgets */}
        {bottomWidgets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bottomWidgets.map((widget) => (
              <Card key={widget.position} className="h-[300px]">
                <CardHeader>
                  <CardTitle className="text-base">{widget.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <p className="text-sm font-medium">{widget.chart_type.toUpperCase()}</p>
                      <p className="text-xs mt-1">Position {widget.position}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
