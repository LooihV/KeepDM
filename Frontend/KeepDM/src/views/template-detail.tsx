import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Download, 
  Type, 
  Hash, 
  Calendar, 
  Check, 
  Mail,
  FileSpreadsheet,
  Pencil,
  Trash2
} from "lucide-react"
import { templateService, type Template } from "@/api/services/template.service"

type ColumnType = "text" | "number" | "date" | "boolean" | "email"

const columnTypeConfig = {
  text: { label: "Texto", icon: Type, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  number: { label: "Número", icon: Hash, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  date: { label: "Fecha", icon: Calendar, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  boolean: { label: "Sí/No", icon: Check, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  email: { label: "Email", icon: Mail, color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
}

export function TemplateDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) {
        toast.error("ID de template no válido")
        navigate("/templates")
        return
      }

      try {
        const data = await templateService.getById(id)
        setTemplate(data)
      } catch (error) {
        toast.error("Error al cargar el template", {
          description: error instanceof Error ? error.message : "Por favor, intenta de nuevo",
        })
        navigate("/templates")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [id, navigate])

  const handleDownloadExcel = async () => {
    if (!id) return

    setIsDownloading(true)
    try {
      const blob = await templateService.downloadExcel(id)
      
      // Crear un URL temporal para el blob
      const url = window.URL.createObjectURL(blob)
      
      // Crear un elemento <a> temporal para forzar la descarga
      const link = document.createElement('a')
      link.href = url
      link.download = `${template?.name || 'template'}.xlsx`
      
      // Agregar al DOM, hacer click y remover
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Liberar el URL temporal
      window.URL.revokeObjectURL(url)
      
      toast.success("Descarga iniciada", {
        description: `El archivo "${template?.name}.xlsx" se está descargando`,
      })
    } catch (error) {
      toast.error("Error al descargar el archivo", {
        description: error instanceof Error ? error.message : "Por favor, intenta de nuevo",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el template "${template?.name}"?\n\nEsta acción no se puede deshacer.`
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await templateService.delete(id)
      
      toast.success("Template eliminado", {
        description: `El template "${template?.name}" ha sido eliminado exitosamente`,
      })

      setTimeout(() => navigate("/templates"), 1500)
    } catch (error) {
      toast.error("Error al eliminar el template", {
        description: error instanceof Error ? error.message : "Por favor, intenta de nuevo",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!template) {
    return null
  }

  const columnEntries = Object.entries(template.columns)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">{template.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {columnEntries.length} {columnEntries.length === 1 ? "columna" : "columnas"} · Creado el {formatDate(template.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/templates")}
              disabled={isDownloading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/templates/${id}/edit`)}
              disabled={isDownloading}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={handleDownloadExcel} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Descargando..." : "Descargar Excel"}
            </Button>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Template</CardTitle>
            <CardDescription>
              Detalles y metadatos del template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm font-mono">{template._id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Usuario</p>
                <p className="text-sm font-mono">{template.user_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
                <p className="text-sm">{formatDate(template.created_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Última actualización</p>
                <p className="text-sm">{formatDate(template.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Columns */}
        <Card>
          <CardHeader>
            <CardTitle>Columnas ({columnEntries.length})</CardTitle>
            <CardDescription>
              Estructura y tipos de datos del template
            </CardDescription>
          </CardHeader>
          <CardContent>
            {columnEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Este template no tiene columnas definidas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {columnEntries.map(([name, type]) => {
                  const config = columnTypeConfig[type as ColumnType]
                  const Icon = config?.icon || Type
                  const colorClass = config?.color || columnTypeConfig.text.color
                  const label = config?.label || type

                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-muted-foreground">
                            Tipo: {label}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={colorClass}>
                        {label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            <CardDescription>
              Eliminar este template de forma permanente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Eliminar este template</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta acción no se puede deshacer. Todos los datos asociados se eliminarán permanentemente.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isDownloading}
                className="ml-4"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Eliminando..." : "Eliminar Template"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
