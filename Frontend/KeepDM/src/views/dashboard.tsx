import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardEmpty } from "@/components/dashboard-empty"
import { dashboardService, type Dashboard } from "@/api/services/dashboard.service"

export function Dashboard() {
  const navigate = useNavigate()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await dashboardService.getAll()
        setDashboards(data)
      } catch (error) {
        console.error("Error al cargar dashboards:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboards()
  }, [])

  const handleCreateDashboard = () => {
    navigate("/upload")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboards</h1>
        <p className="text-muted-foreground">
          {isLoading 
            ? "Cargando tus dashboards..." 
            : dashboards.length === 0
            ? "No tienes dashboards creados"
            : `Selecciona un dashboard para visualizar tus datos. ${dashboards.length} ${dashboards.length === 1 ? 'dashboard disponible' : 'dashboards disponibles'}.`
          }
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando dashboards...</p>
        </div>
      ) : dashboards.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <DashboardEmpty onCreateClick={handleCreateDashboard} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {dashboards.map((dashboard) => (
            <Button
              key={dashboard._id}
              variant="outline"
              className="h-auto p-6 justify-start items-center gap-4 hover:bg-accent hover:shadow-md transition-all"
              onClick={() => navigate(`/dashboard/${dashboard._id}`)}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-lg">{dashboard.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {dashboard.widgets.length} {dashboard.widgets.length === 1 ? 'widget' : 'widgets'}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}