import { FileSpreadsheet } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function UploadEmptyNoTemplates() {
  const navigate = useNavigate()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileSpreadsheet />
        </EmptyMedia>
        <EmptyTitle>No tienes templates</EmptyTitle>
        <EmptyDescription>
          Necesitas crear un template primero antes de poder subir archivos. 
          Los templates definen la estructura de tus datos.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/templates/create")}>
            Crear Template
          </Button>
          <Button variant="outline" onClick={() => navigate("/templates")}>
            Ver Templates
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
