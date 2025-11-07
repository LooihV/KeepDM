import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Sparkles, Type, Hash, Calendar, Check, Mail } from "lucide-react"
import { templateService } from "@/api/services/template.service"

type ColumnType = "text" | "number" | "date" | "boolean" | "email"

interface Column {
  id: string
  name: string
  type: ColumnType
}

const columnTypeConfig = {
  text: { label: "Texto", icon: Type, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  number: { label: "Número", icon: Hash, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  date: { label: "Fecha", icon: Calendar, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  boolean: { label: "Sí/No", icon: Check, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  email: { label: "Email", icon: Mail, color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
}

export function TemplateCreate() {
  const navigate = useNavigate()
  const [templateName, setTemplateName] = useState("")
  const [columns, setColumns] = useState<Column[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<ColumnType>("text")
  const [isLoading, setIsLoading] = useState(false)

  const addColumn = () => {
    if (!newColumnName.trim()) {
      toast.error("El nombre de la columna es requerido")
      return
    }

    const columnExists = columns.some(
      (col) => col.name.toLowerCase() === newColumnName.toLowerCase()
    )

    if (columnExists) {
      toast.error("Ya existe una columna con ese nombre")
      return
    }

    const newColumn: Column = {
      id: Math.random().toString(36).substr(2, 9),
      name: newColumnName.trim(),
      type: newColumnType,
    }

    setColumns([...columns, newColumn])
    setNewColumnName("")
    setNewColumnType("text")
  }

  const removeColumn = (id: string) => {
    setColumns(columns.filter((col) => col.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateName.trim()) {
      toast.error("El nombre del template es requerido")
      return
    }

    if (columns.length === 0) {
      toast.error("Debes agregar al menos una columna")
      return
    }

    setIsLoading(true)

    try {
      const columnsObject = columns.reduce((acc, col) => {
        acc[col.name] = col.type
        return acc
      }, {} as Record<string, string>)

      await templateService.create({
        name: templateName,
        columns: columnsObject,
      })

      toast.success("Template creado exitosamente", {
        description: `El template "${templateName}" ha sido creado con ${columns.length} columnas`,
      })

      setTimeout(() => navigate("/templates"), 1500)
    } catch (error) {
      toast.error("Error al crear el template", {
        description: error instanceof Error ? error.message : "Por favor, intenta de nuevo",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Crear Template</h1>
        </div>
        <p className="text-muted-foreground">
          Define la estructura de tu template agregando las columnas necesarias
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>
              Comienza dándole un nombre descriptivo a tu template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="templateName">Nombre del Template</Label>
              <Input
                id="templateName"
                placeholder="Ej: Adult income USA, Customer Data, Sales 2024..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Columnas del Template</CardTitle>
            <CardDescription>
              Define las columnas que tendrá tu template. Cada columna necesita un nombre y un tipo de dato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Formulario para agregar columnas */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="columnName">Nombre de la columna</Label>
                <Input
                  id="columnName"
                  placeholder="Ej: Age, Education, Income..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addColumn()
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor="columnType">Tipo</Label>
                <Select
                  value={newColumnType}
                  onValueChange={(value) => setNewColumnType(value as ColumnType)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="columnType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(columnTypeConfig).map(([type, config]) => {
                      const Icon = config.icon
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={addColumn}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Lista de columnas agregadas */}
            {columns.length > 0 && (
              <div className="space-y-3">
                <Label>Columnas agregadas ({columns.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {columns.map((column) => {
                    const config = columnTypeConfig[column.type]
                    const Icon = config.icon
                    return (
                      <Badge
                        key={column.id}
                        variant="outline"
                        className={`${config.color} pl-2 pr-1 py-1.5 text-sm font-medium border transition-all hover:scale-105`}
                      >
                        <Icon className="h-3.5 w-3.5 mr-1.5" />
                        <span className="mr-2">{column.name}</span>
                        <button
                          type="button"
                          onClick={() => removeColumn(column.id)}
                          className="rounded-full p-0.5 hover:bg-background/50 transition-colors"
                          disabled={isLoading}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {columns.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Aún no has agregado columnas. Usa el formulario de arriba para comenzar a construir tu template
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/templates")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Template"}
          </Button>
        </div>
      </form>
    </div>
  )
}
