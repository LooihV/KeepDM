import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface UploadEmptyNoFilesProps {
  onUploadClick: () => void
}

export function UploadEmptyNoFiles({ onUploadClick }: UploadEmptyNoFilesProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Upload />
        </EmptyMedia>
        <EmptyTitle>No has subido archivos</EmptyTitle>
        <EmptyDescription>
          Sube tu primer archivo de datos para comenzar a trabajar. 
          Asegúrate de que coincida con la estructura de uno de tus templates.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" onClick={onUploadClick}>
          Subir Archivo
        </Button>
      </EmptyContent>
    </Empty>
  )
}
