import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WidgetErrorProps {
  title: string
  message?: string
}

export function WidgetError({ title, message = "Los datos recibidos son inválidos o están incompletos" }: WidgetErrorProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el widget</AlertTitle>
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
