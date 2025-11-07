import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WidgetError } from "./widget-error"
import { Badge } from "@/components/ui/badge"

interface TableWidgetProps {
  title: string
  columns: string[]
  data: Array<Record<string, any>>
}

export function TableWidget({ title, columns, data }: TableWidgetProps) {
  // Validar que las columnas existan y sean válidas
  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return <WidgetError title={title} message="Las columnas son undefined, no son un array o están vacías" />
  }

  // Validar que los datos existan (puede estar vacío pero debe ser un array)
  if (!data || !Array.isArray(data)) {
    return <WidgetError title={title} message="Los datos son undefined o no son un array válido" />
  }

  // Determinar si se está mostrando el límite de 100 filas
  const isLimited = data.length === 100
  const rowCount = data.length

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {rowCount} {rowCount === 1 ? 'fila' : 'filas'}
          </Badge>
        </div>
        {isLimited && (
          <CardDescription className="text-xs text-muted-foreground">
            Mostrando las primeras 100 filas
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pb-0">
        <div className="rounded-md border min-h-[200px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="font-semibold whitespace-nowrap">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column} className="max-w-[300px]">
                        {row[column] !== null && row[column] !== undefined
                          ? typeof row[column] === 'boolean'
                            ? (
                              <Badge variant={row[column] ? 'default' : 'secondary'} className="text-xs">
                                {row[column] ? 'Sí' : 'No'}
                              </Badge>
                            )
                            : String(row[column])
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
