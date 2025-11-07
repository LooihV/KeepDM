import { useEffect, useState } from "react"
import { UploadEmptyNoTemplates } from "@/components/upload-empty-no-templates"
import { UploadEmptyNoFiles } from "@/components/upload-empty-no-files"
import { templateService } from "@/api/services/template.service"
import { dataService, type DataFile } from "@/api/services/data.service"

export function Upload() {
  const [hasTemplates, setHasTemplates] = useState(false)
  const [dataFiles, setDataFiles] = useState<DataFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templates, files] = await Promise.all([
          templateService.getAll(),
          dataService.getAll(),
        ])
        setHasTemplates(templates.length > 0)
        setDataFiles(files)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUploadClick = () => {
    // Por ahora solo un placeholder
    console.log("Subir archivo clicked")
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Cargar Datos</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no tiene templates
  if (!hasTemplates) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Cargar Datos</h1>
          <p className="text-muted-foreground">
            Importa datos desde archivos externos
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <UploadEmptyNoTemplates />
        </div>
      </div>
    )
  }

  // Si tiene templates pero no tiene archivos
  if (dataFiles.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Cargar Datos</h1>
          <p className="text-muted-foreground">
            Importa datos desde archivos externos
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <UploadEmptyNoFiles onUploadClick={handleUploadClick} />
        </div>
      </div>
    )
  }

  // Si tiene archivos (esto lo implementaremos después)
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Cargar Datos</h1>
        <p className="text-muted-foreground">
          Tienes {dataFiles.length} {dataFiles.length === 1 ? 'archivo' : 'archivos'}
        </p>
      </div>
    </div>
  )
}
