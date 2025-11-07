import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet } from "lucide-react"
import { templateService, type Template } from "@/api/services/template.service"
import { dataService } from "@/api/services/data.service"

interface UploadFileDialogProps {
  onUploadSuccess?: () => void
  trigger?: React.ReactNode
}

export function UploadFileDialog({ onUploadSuccess, trigger }: UploadFileDialogProps) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateService.getAll()
        setTemplates(data)
      } catch (error) {
        console.error("Error al cargar templates:", error)
        toast.error("Error al cargar templates")
      } finally {
        setIsLoadingTemplates(false)
      }
    }

    if (open) {
      fetchTemplates()
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea un archivo Excel o CSV
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ]
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error("Tipo de archivo no válido", {
          description: "Por favor, sube un archivo Excel (.xlsx, .xls) o CSV",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplateId) {
      toast.error("Selecciona un template")
      return
    }

    if (!selectedFile) {
      toast.error("Selecciona un archivo")
      return
    }

    setIsLoading(true)

    try {
      await dataService.upload(selectedTemplateId, selectedFile)
      
      toast.success("Archivo subido exitosamente", {
        description: `El archivo "${selectedFile.name}" ha sido procesado`,
      })

      // Reset form
      setSelectedTemplateId("")
      setSelectedFile(null)
      setOpen(false)

      // Callback para refrescar la lista
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (error) {
      toast.error("Error al subir el archivo", {
        description: error instanceof Error ? error.message : "Por favor, intenta de nuevo",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form cuando se cierra
        setSelectedTemplateId("")
        setSelectedFile(null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir Archivo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Subir Archivo de Datos</DialogTitle>
            <DialogDescription>
              Selecciona un template y sube tu archivo Excel o CSV. Los datos serán validados según la estructura del template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="template">Template</Label>
              {isLoadingTemplates ? (
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              ) : templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay templates disponibles. Crea uno primero.
                </p>
              ) : (
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Selecciona un template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({Object.keys(template.columns).length} columnas)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="file">Archivo</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !selectedTemplateId || !selectedFile}>
              {isLoading ? "Subiendo..." : "Subir Archivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
