import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, Plus, X, AlertCircle, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Table as TableIcon, Hash } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { dataService, type DataFileDetail, type ColumnAnalysis } from "@/api/services/data.service"
import { dashboardService, type ChartType, type AggregationType } from "@/api/services/dashboard.service"

interface Widget {
  position: number
  chart_type: ChartType | ''
  title: string
  columns: string[]
  aggregation: AggregationType | null
}

const CHART_TYPES = [
  { value: 'kpi', label: 'KPI', icon: Hash, description: 'Métrica única' },
  { value: 'bar', label: 'Barras', icon: BarChart3, description: 'Comparar categorías' },
  { value: 'line', label: 'Líneas', icon: LineChartIcon, description: 'Tendencias' },
  { value: 'area', label: 'Área', icon: LineChartIcon, description: 'Volumen' },
  { value: 'pie', label: 'Pastel', icon: PieChartIcon, description: 'Distribución' },
  { value: 'table', label: 'Tabla', icon: TableIcon, description: 'Datos detallados' },
]

const AGGREGATIONS = [
  { value: 'sum', label: 'Suma', description: 'Total acumulado' },
  { value: 'avg', label: 'Promedio', description: 'Valor medio' },
  { value: 'count', label: 'Contar', description: 'Total de registros' },
  { value: 'min', label: 'Mínimo', description: 'Valor más bajo' },
  { value: 'max', label: 'Máximo', description: 'Valor más alto' },
]

export function DashboardCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dataId = searchParams.get('data_id')

  const [dashboardName, setDashboardName] = useState('')
  const [dataAnalysis, setDataAnalysis] = useState<DataFileDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  
  const [widgets, setWidgets] = useState<Widget[]>(
    Array.from({ length: 6 }, (_, i) => ({
      position: i + 1,
      chart_type: '',
      title: '',
      columns: [],
      aggregation: null,
    }))
  )

  useEffect(() => {
    const fetchDataAnalysis = async () => {
      if (!dataId) {
        toast.error("No se especificó un archivo de datos")
        navigate("/upload")
        return
      }

      try {
        const analysis = await dataService.getById(dataId)
        setDataAnalysis(analysis)
      } catch (error) {
        console.error("Error al cargar análisis:", error)
        toast.error("Error al cargar análisis de datos")
        navigate("/upload")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDataAnalysis()
  }, [dataId, navigate])

  const getColumnType = (columnName: string): ColumnAnalysis | undefined => {
    return dataAnalysis?.column_analyses.find(col => col.column_name === columnName)
  }

  const validateWidget = (widget: Widget): string[] => {
    const errors: string[] = []

    if (!widget.chart_type) {
      errors.push("Selecciona un tipo de gráfico")
      return errors
    }

    if (!widget.title.trim()) {
      errors.push("El título es requerido")
    }

    if (widget.columns.length === 0) {
      errors.push("Selecciona al menos una columna")
      return errors
    }

    const columnTypes = widget.columns.map(col => getColumnType(col))

    switch (widget.chart_type) {
      case 'kpi':
        if (widget.columns.length !== 1) {
          errors.push("KPI requiere exactamente 1 columna")
        }
        if (columnTypes[0]?.column_type !== 'number') {
          errors.push("KPI requiere una columna numérica")
        }
        if (!widget.aggregation) {
          errors.push("KPI requiere una agregación")
        }
        break

      case 'bar':
      case 'line':
      case 'area':
        if (widget.columns.length !== 2) {
          errors.push(`${widget.chart_type.toUpperCase()} requiere exactamente 2 columnas`)
        }
        if (columnTypes[0] && !['text', 'date'].includes(columnTypes[0].column_type)) {
          errors.push("Primera columna debe ser texto o fecha")
        }
        if (columnTypes[1]?.column_type !== 'number') {
          errors.push("Segunda columna debe ser numérica")
        }
        if (!widget.aggregation) {
          errors.push("Requiere una agregación")
        }
        break

      case 'pie':
        if (widget.columns.length !== 1) {
          errors.push("PIE requiere exactamente 1 columna")
        }
        if (columnTypes[0]?.column_type !== 'text') {
          errors.push("PIE requiere una columna de texto")
        }
        const column = columnTypes[0]
        if (column && column.unique_count && column.unique_count > 10) {
          errors.push("PIE funciona mejor con ≤10 valores únicos")
        }
        if (widget.aggregation !== 'count') {
          errors.push("PIE requiere agregación 'count'")
        }
        break

      case 'table':
        if (widget.aggregation !== null) {
          errors.push("TABLE no debe tener agregación")
        }
        break
    }

    return errors
  }

  const updateWidget = (position: number, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => 
      w.position === position ? { ...w, ...updates } : w
    ))
  }

  const clearWidget = (position: number) => {
    setWidgets(prev => prev.map(w => 
      w.position === position 
        ? { position, chart_type: '', title: '', columns: [], aggregation: null }
        : w
    ))
  }

  const handleSave = async () => {
    if (!dashboardName.trim()) {
      toast.error("El nombre del dashboard es requerido")
      return
    }

    const filledWidgets = widgets.filter(w => w.chart_type !== '')
    
    if (filledWidgets.length === 0) {
      toast.error("Agrega al menos un widget al dashboard")
      return
    }

    // Validar todos los widgets
    const allErrors: { position: number; errors: string[] }[] = []
    filledWidgets.forEach(widget => {
      const errors = validateWidget(widget)
      if (errors.length > 0) {
        allErrors.push({ position: widget.position, errors })
      }
    })

    if (allErrors.length > 0) {
      toast.error("Hay errores en algunos widgets", {
        description: `Revisa los widgets en posición ${allErrors.map(e => e.position).join(', ')}`
      })
      return
    }

    setIsSaving(true)

    try {
      // Preparar payload
      const payload = {
        template_id: dataAnalysis!.template_id,
        data_id: dataId!,
        name: dashboardName,
        widgets: filledWidgets.map(w => ({
          position: w.position,
          chart_type: w.chart_type as ChartType,
          title: w.title,
          columns: w.columns,
          aggregation: w.aggregation,
          filters: null,
        })),
      }

      await dashboardService.create(payload)

      toast.success("Dashboard creado exitosamente", {
        description: `"${dashboardName}" ha sido creado`
      })

      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Error al crear dashboard:", error)
      toast.error("Error al crear dashboard", {
        description: error instanceof Error ? error.message : "Intenta de nuevo"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando análisis de datos...</p>
        </div>
      </div>
    )
  }

  if (!dataAnalysis) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No se pudo cargar el análisis</p>
        </div>
      </div>
    )
  }

  const selectedWidget = selectedPosition ? widgets.find(w => w.position === selectedPosition) : null
  const widgetErrors = selectedWidget ? validateWidget(selectedWidget) : []

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
            <h1 className="text-3xl font-bold">Crear Dashboard</h1>
            <p className="text-muted-foreground">
              Configura widgets para visualizar tus datos
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? "Guardando..." : "Guardar Dashboard"}
        </Button>
      </div>

      {/* Dashboard Name */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Dashboard</Label>
            <Input
              id="name"
              placeholder="Ej: Análisis de Ventas Q4"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
            />
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Datos:</span> {dataAnalysis.num_rows.toLocaleString()} filas
            </div>
            <div>
              <span className="font-medium">Columnas:</span> {dataAnalysis.num_columns}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Layout Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout del Dashboard</CardTitle>
              <CardDescription>
                Haz click en una posición para configurar un widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Grid Layout */}
              <div className="space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(pos => {
                    const widget = widgets.find(w => w.position === pos)!
                    const isSelected = selectedPosition === pos
                    const haContent = widget.chart_type !== ''
                    const ChartIcon = CHART_TYPES.find(t => t.value === widget.chart_type)?.icon

                    return (
                      <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`
                          relative h-32 rounded-lg border-2 transition-all
                          ${isSelected ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/25 hover:border-primary/50'}
                          ${haContent ? 'border-solid' : ''}
                        `}
                      >
                        {haContent ? (
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            {ChartIcon && <ChartIcon className="h-6 w-6 mb-1 text-primary" />}
                            <p className="text-xs font-medium line-clamp-2 text-center">
                              {widget.title || 'Sin título'}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {widget.chart_type}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <Plus className="h-6 w-6 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Posición {pos}</p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 gap-4">
                  {[4].map(pos => {
                    const widget = widgets.find(w => w.position === pos)!
                    const isSelected = selectedPosition === pos
                    const hasContent = widget.chart_type !== ''
                    const ChartIcon = CHART_TYPES.find(t => t.value === widget.chart_type)?.icon

                    return (
                      <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`
                          relative h-32 rounded-lg border-2 transition-all
                          ${isSelected ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/25 hover:border-primary/50'}
                          ${hasContent ? 'border-solid' : ''}
                        `}
                      >
                        {hasContent ? (
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            {ChartIcon && <ChartIcon className="h-8 w-8 mb-2 text-primary" />}
                            <p className="text-sm font-medium line-clamp-2 text-center">
                              {widget.title || 'Sin título'}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {widget.chart_type}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Posición {pos} - Widget Grande</p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  {[5, 6].map(pos => {
                    const widget = widgets.find(w => w.position === pos)!
                    const isSelected = selectedPosition === pos
                    const hasContent = widget.chart_type !== ''
                    const ChartIcon = CHART_TYPES.find(t => t.value === widget.chart_type)?.icon

                    return (
                      <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`
                          relative h-32 rounded-lg border-2 transition-all
                          ${isSelected ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/25 hover:border-primary/50'}
                          ${hasContent ? 'border-solid' : ''}
                        `}
                      >
                        {hasContent ? (
                          <div className="flex flex-col items-center justify-center h-full p-2">
                            {ChartIcon && <ChartIcon className="h-6 w-6 mb-1 text-primary" />}
                            <p className="text-xs font-medium line-clamp-2 text-center">
                              {widget.title || 'Sin título'}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {widget.chart_type}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <Plus className="h-6 w-6 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Posición {pos}</p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widget Configuration */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedPosition ? `Posición ${selectedPosition}` : 'Selecciona una posición'}
                </CardTitle>
                {selectedPosition && selectedWidget?.chart_type && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearWidget(selectedPosition)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedPosition && (
                <CardDescription>
                  Configura el widget para esta posición
                </CardDescription>
              )}
            </CardHeader>
            {selectedPosition && selectedWidget ? (
              <CardContent className="space-y-4">
                {/* Chart Type */}
                <div className="grid gap-2">
                  <Label>Tipo de Gráfico</Label>
                  <Select
                    value={selectedWidget.chart_type}
                    onValueChange={(value) => {
                      updateWidget(selectedPosition, {
                        chart_type: value as ChartType,
                        columns: [],
                        aggregation: value === 'table' ? null : value === 'pie' ? 'count' : selectedWidget.aggregation,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_TYPES.map(type => {
                        const Icon = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span>{type.label}</span>
                                <span className="text-xs text-muted-foreground">{type.description}</span>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                {selectedWidget.chart_type && (
                  <div className="grid gap-2">
                    <Label>Título del Widget</Label>
                    <Input
                      placeholder="Ej: Total de Ventas"
                      value={selectedWidget.title}
                      onChange={(e) => updateWidget(selectedPosition, { title: e.target.value })}
                    />
                  </div>
                )}

                {/* Columns */}
                {selectedWidget.chart_type && (
                  <div className="grid gap-2">
                    <Label>
                      Columnas
                      <span className="text-xs text-muted-foreground ml-2">
                        ({selectedWidget.chart_type === 'kpi' || selectedWidget.chart_type === 'pie' ? '1' : selectedWidget.chart_type === 'table' ? '1+' : '2'} requerida{selectedWidget.chart_type === 'table' ? 's' : ''})
                      </span>
                    </Label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {dataAnalysis.column_analyses.map((col) => {
                        const isSelected = selectedWidget.columns.includes(col.column_name)
                        const canAdd = selectedWidget.chart_type === 'table' || selectedWidget.columns.length < (selectedWidget.chart_type === 'bar' || selectedWidget.chart_type === 'line' || selectedWidget.chart_type === 'area' ? 2 : 1)
                        const selectedIndex = selectedWidget.columns.indexOf(col.column_name)
                        
                        return (
                          <button
                            key={col.column_name}
                            onClick={() => {
                              if (isSelected) {
                                updateWidget(selectedPosition, {
                                  columns: selectedWidget.columns.filter(c => c !== col.column_name)
                                })
                              } else if (canAdd) {
                                updateWidget(selectedPosition, {
                                  columns: [...selectedWidget.columns, col.column_name]
                                })
                              }
                            }}
                            disabled={!canAdd && !isSelected}
                            className={`
                              w-full text-left p-2 rounded border transition-all text-sm
                              ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                              ${!canAdd && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Badge variant={col.column_type === 'number' ? 'default' : 'secondary'} className="text-xs shrink-0">
                                  {col.column_type}
                                </Badge>
                                <span className="font-medium truncate">{col.column_name}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isSelected && (
                                  <>
                                    {(selectedWidget.chart_type === 'bar' || selectedWidget.chart_type === 'line' || selectedWidget.chart_type === 'area') && (
                                      <Badge variant="outline" className="text-xs">
                                        {selectedIndex === 0 ? 'Categoría' : 'Valor'}
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">✓</Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Aggregation */}
                {selectedWidget.chart_type && selectedWidget.chart_type !== 'table' && (
                  <div className="grid gap-2">
                    <Label>Agregación</Label>
                    <Select
                      value={selectedWidget.aggregation || ''}
                      onValueChange={(value) => updateWidget(selectedPosition, { aggregation: value as AggregationType })}
                      disabled={selectedWidget.chart_type === 'pie'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona agregación" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGGREGATIONS.map(agg => (
                          <SelectItem key={agg.value} value={agg.value}>
                            <div className="flex flex-col">
                              <span>{agg.label}</span>
                              <span className="text-xs text-muted-foreground">{agg.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Validation Errors */}
                {widgetErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errores de validación</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {widgetErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Selecciona una posición en el layout para comenzar a configurar un widget
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
