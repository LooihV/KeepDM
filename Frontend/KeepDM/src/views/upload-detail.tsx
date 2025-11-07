import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  FileSpreadsheet,
  Table2,
  Columns3,
  TrendingUp,
  Hash,
  Type,
  Calendar
} from "lucide-react"
import { dataService, type DataFileDetail, type ColumnAnalysis } from "@/api/services/data.service"

export function UploadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dataFile, setDataFile] = useState<DataFileDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDataFile = async () => {
      if (!id) {
        toast.error("ID de archivo no válido")
        navigate("/upload")
        return
      }

      try {
        const data = await dataService.getById(id)
        setDataFile(data)
      } catch (error) {
        toast.error("Error al cargar el archivo", {
          description: error instanceof Error ? error.message : "Por favor, intenta de nuevo",
        })
        navigate("/upload")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDataFile()
  }, [id, navigate])

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

  if (!dataFile) {
    return null
  }

  const getColumnTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="h-4 w-4" />
      case 'text':
        return <Type className="h-4 w-4" />
      case 'date':
        return <Calendar className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  const getColumnTypeColor = (type: string) => {
    switch (type) {
      case 'number':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'text':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'date':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return 'bg-muted'
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Análisis de Datos</h1>
            </div>
            <p className="text-muted-foreground">
              {dataFile.num_rows.toLocaleString()} filas · {dataFile.num_columns} columnas
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/upload")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Estadísticas básicas del archivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Table2 className="h-4 w-4" />
                  <p className="text-sm font-medium">Número de filas</p>
                </div>
                <p className="text-2xl font-bold">{dataFile.num_rows.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Columns3 className="h-4 w-4" />
                  <p className="text-sm font-medium">Número de columnas</p>
                </div>
                <p className="text-2xl font-bold">{dataFile.num_columns}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <p className="text-sm font-medium">Template ID (debug)</p>
                </div>
                <p className="text-sm font-mono">{dataFile.template_id}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">ID del archivo (debug)</p>
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">{dataFile.data_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column Analyses */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Columnas ({dataFile.column_analyses.length})</CardTitle>
            <CardDescription>
              Estadísticas detalladas por columna
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataFile.column_analyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay análisis de columnas disponibles
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dataFile.column_analyses.map((column: ColumnAnalysis, index: number) => (
                  <Card key={index} className="border-l-4" style={{ borderLeftColor: column.column_type === 'number' ? '#a855f7' : column.column_type === 'text' ? '#3b82f6' : '#f97316' }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getColumnTypeIcon(column.column_type)}
                          <CardTitle className="text-lg">{column.column_name}</CardTitle>
                        </div>
                        <Badge variant="outline" className={getColumnTypeColor(column.column_type)}>
                          {column.column_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total</p>
                          <p className="text-sm font-medium">{column.total_count.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">No nulos</p>
                          <p className="text-sm font-medium">{column.non_null_count.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Nulos</p>
                          <p className="text-sm font-medium text-destructive">{column.null_count.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">% Nulos</p>
                          <p className="text-sm font-medium">{column.null_percentage.toFixed(2)}%</p>
                        </div>
                      </div>

                      {/* Estadísticas específicas para números */}
                      {column.column_type === 'number' && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            Estadísticas numéricas
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
                              <p className="text-sm font-medium">{column.min?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Máximo</p>
                              <p className="text-sm font-medium">{column.max?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Promedio</p>
                              <p className="text-sm font-medium">{column.avg?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Suma</p>
                              <p className="text-sm font-medium">{column.sum?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Estadísticas específicas para texto */}
                      {column.column_type === 'text' && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-3">Valores únicos: {column.unique_count}</p>
                          {column.is_categorical && (
                            <Badge variant="secondary" className="mb-3">Categórica</Badge>
                          )}
                          {column.sample_values && column.sample_values.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Valores de muestra:</p>
                              <div className="flex flex-wrap gap-2">
                                {column.sample_values.map((value: string, idx: number) => (
                                  <Badge key={idx} variant="outline">{value}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visualization Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Sugerencias de Visualización ({dataFile.visualization_suggestions.length})</CardTitle>
            <CardDescription>
              Gráficos recomendados basados en tus datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataFile.visualization_suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay sugerencias de visualización disponibles
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dataFile.visualization_suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{suggestion.chart_type}</Badge>
                        <p className="font-medium">{suggestion.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-muted-foreground">
                          Columnas: {suggestion.columns.join(', ')}
                        </p>
                        {suggestion.aggregation && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <p className="text-xs text-muted-foreground">
                              Agregación: {suggestion.aggregation}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Prioridad {suggestion.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
