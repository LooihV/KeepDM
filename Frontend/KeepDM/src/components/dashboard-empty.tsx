import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface DashboardEmptyProps {
  onCreateClick: () => void
}

export function DashboardEmpty({ onCreateClick }: DashboardEmptyProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BarChart3 />
        </EmptyMedia>
        <EmptyTitle>No tienes dashboards</EmptyTitle>
        <EmptyDescription>
          Crea tu primer dashboard para comenzar a visualizar tus datos.
          Necesitas tener archivos de datos cargados para crear un dashboard.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" onClick={onCreateClick}>
          Crear Dashboard
        </Button>
      </EmptyContent>
    </Empty>
  )
}
