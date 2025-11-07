import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { templateService, type Template } from "@/api/services/template.service"

export function Templates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateService.getAll()
        setTemplates(data)
      } catch (err) {
        console.error("Error al cargar templates:", err)
        setError("No se pudieron cargar los templates")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getColumnBadgeVariant = (type: string) => {
    switch (type) {
      case 'text':
        return 'default'
      case 'number':
        return 'secondary'
      case 'date':
        return 'outline'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Cargando templates...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground">
          Gestiona tus plantillas de datos. {templates.length} {templates.length === 1 ? 'template' : 'templates'} disponibles.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card 
            key={template._id} 
            className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
            onClick={() => navigate(`/templates/${template._id}`)}
          >
            <CardHeader>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription>
                Creado {formatDate(template.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Columnas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(template.columns).map(([columnName, columnType]) => (
                    <Badge 
                      key={columnName} 
                      variant={getColumnBadgeVariant(columnType)}
                    >
                      {columnName}: {columnType}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Card para crear nuevo template */}
        <Card 
          className="border-dashed border-2 hover:shadow-lg hover:border-primary transition-all cursor-pointer"
          onClick={() => navigate('/templates/create')}
        >
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Plus className="h-12 w-12" />
              <p className="font-medium">Crear Template</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
