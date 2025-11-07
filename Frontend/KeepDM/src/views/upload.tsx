import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UploadEmptyNoTemplates } from "@/components/upload-empty-no-templates"
import { UploadEmptyNoFiles } from "@/components/upload-empty-no-files"
import { UploadFileDialog } from "@/components/upload-file-dialog"
import { templateService } from "@/api/services/template.service"
import { dataService, type DataFile } from "@/api/services/data.service"

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSourceTypeBadge = (type?: string) => {
  if (!type) return { variant: 'outline' as const, label: 'Desconocido' }
  switch (type.toLowerCase()) {
    case 'excel':
      return { variant: 'default' as const, label: 'Excel' }
    case 'csv':
      return { variant: 'secondary' as const, label: 'CSV' }
    default:
      return { variant: 'outline' as const, label: type }
  }
}

export function Upload() {
  const navigate = useNavigate()
  const [hasTemplates, setHasTemplates] = useState(false)
  const [dataFiles, setDataFiles] = useState<DataFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])

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

  const refreshData = async () => {
    try {
      const files = await dataService.getAll()
      setDataFiles(files)
    } catch (error) {
      console.error("Error al refrescar datos:", error)
    }
  }

  const columns = useMemo<ColumnDef<DataFile>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "source_type",
      header: "Tipo",
      cell: ({ row }) => {
        const badgeInfo = getSourceTypeBadge(row.getValue("source_type"))
        return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
      },
    },
    {
      accessorKey: "num_rows",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Filas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const rows = row.getValue("num_rows") as number
        return <div>{rows.toLocaleString()}</div>
      },
    },
    {
      accessorKey: "num_columns",
      header: "Columnas",
      cell: ({ row }) => <div>{row.getValue("num_columns")}</div>,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="text-sm">{formatDate(row.getValue("created_at"))}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const file = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/upload/${file.data_id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Editar", file.data_id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => console.log("Eliminar", file.data_id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [navigate])

  const table = useReactTable({
    data: dataFiles,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  // Renderizado condicional dentro de un solo return
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Cargar Datos</h1>
        <p className="text-muted-foreground">
          {isLoading 
            ? "Cargando..." 
            : !hasTemplates 
            ? "Importa datos desde archivos externos"
            : dataFiles.length === 0
            ? "Importa datos desde archivos externos"
            : `Gestiona tus archivos de datos. ${dataFiles.length} ${dataFiles.length === 1 ? 'archivo' : 'archivos'} disponibles.`
          }
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      ) : !hasTemplates ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <UploadEmptyNoTemplates />
        </div>
      ) : dataFiles.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <UploadFileDialog 
            onUploadSuccess={refreshData}
            trigger={<UploadEmptyNoFiles />}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <UploadFileDialog onUploadSuccess={refreshData} />
          </div>

          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No hay resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
