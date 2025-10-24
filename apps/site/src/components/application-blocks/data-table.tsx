"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/packages/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAdminState } from "@/components/admin/AdminStateProvider"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogClose,
} from "@/packages/components/ui/revola"

type ColumnSchema = {
  name: string
  type: string
  nullable: boolean
  primary: boolean
}

type CollectionData = Record<string, any>

type StateResponse = {
  success: boolean
  state: {
    collection: string
    page: number
    pageSize: number
    filters: any[]
  }
  schema: {
    columns: ColumnSchema[]
    total: number
    totalPages: number
  }
  data: CollectionData[]
}

// Helper to format cell value
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "boolean") return value ? "✓" : "✗"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

// Dynamic column generator
function generateColumns(schema: ColumnSchema[], onDeleteRequest: (row: Row<CollectionData>) => void, onEditRequest: (row: Row<CollectionData>) => void): ColumnDef<CollectionData>[] {
  return [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
    ...schema.map((col) => ({
      accessorKey: col.name,
      header: () => (
        <div className="flex items-center gap-1">
          <span>{col.name}</span>
          {col.primary && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              PK
        </Badge>
          )}
      </div>
    ),
      cell: ({ row }: { row: Row<CollectionData> }) => (
        <div className={`${col.primary ? "font-mono font-medium" : ""}`}>
          {formatCellValue(row.original[col.name])}
        </div>
      ),
    })),
  {
    id: "actions",
      cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditRequest(row)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteRequest(row)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
}

export function DataTable() {
  const { state, setState } = useAdminState()

  const [data, setData] = React.useState<CollectionData[]>([])
  const [schema, setSchema] = React.useState<ColumnSchema[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const primaryKey = React.useMemo(() => schema.find((c) => c.primary)?.name || "id", [schema])

  const fetchData = React.useCallback(async (abortSignal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("c", state.collection)
      params.set("p", String(state.page))
      params.set("ps", String(state.pageSize))
      if (state.filters.length) params.set("f", JSON.stringify(state.filters))

      const res = await fetch(`/api/admin/state?${params.toString()}`, {
        signal: abortSignal,
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`)
      }
      const json: StateResponse = await res.json()
      
      // Update local state
      setState(() => json.state)
      setSchema(json.schema.columns)
      setTotal(json.schema.total)
      setTotalPages(json.schema.totalPages)
      setData(json.data)
    } catch (e) {
      if ((e as any).name !== "AbortError") {
        setError((e as Error).message)
      }
    } finally {
      setLoading(false)
    }
  }, [state.collection, state.page, state.pageSize, JSON.stringify(state.filters), setState])

  React.useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData])

  // pagination sync with admin state
  const [pagination, setPagination] = React.useState({
    pageIndex: Math.max(0, state.page - 1),
    pageSize: state.pageSize,
  })

  React.useEffect(() => {
    // when table pagination changes, reflect to admin state
    setState((prev) => ({
      ...prev,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }))
  }, [pagination.pageIndex, pagination.pageSize, setState])

  React.useEffect(() => {
    // when admin state changes externally (via URL), update table
    setPagination({ pageIndex: Math.max(0, state.page - 1), pageSize: state.pageSize })
  }, [state.page, state.pageSize])

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Delete confirmation state
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [recordToDelete, setRecordToDelete] = React.useState<CollectionData | null>(null)
  const onDeleteRequest = React.useCallback((row: Row<CollectionData>) => {
    setRecordToDelete(row.original)
    setConfirmOpen(true)
  }, [])

  // Create dialog state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [createError, setCreateError] = React.useState<string | null>(null)

  // Clear form data when collection changes
  React.useEffect(() => {
    setFormData({})
    setCreateError(null)
  }, [state.collection])

  // Fields to skip (auto-generated): id, uuid, {x}aid, created_at, updated_at, deleted_at
  const isAutoGeneratedField = React.useCallback((fieldName: string): boolean => {
    const lower = fieldName.toLowerCase()
    return (
      lower === 'id' ||
      lower === 'uuid' ||
      lower.endsWith('aid') ||
      lower === 'created_at' ||
      lower === 'updated_at' ||
      lower === 'deleted_at'
    )
  }, [])

  const editableFields = React.useMemo(
    () => schema.filter((col) => !isAutoGeneratedField(col.name) && !col.primary),
    [schema, isAutoGeneratedField]
  )

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false)
  const [recordToEdit, setRecordToEdit] = React.useState<CollectionData | null>(null)
  const [editData, setEditData] = React.useState<Record<string, string>>({})
  const [editError, setEditError] = React.useState<string | null>(null)

  // Clear edit data when collection changes
  React.useEffect(() => {
    setEditData({})
    setEditError(null)
    setRecordToEdit(null)
  }, [state.collection])

  const onEditRequest = React.useCallback((row: Row<CollectionData>) => {
    const record = row.original
    setRecordToEdit(record)
    const initial: Record<string, string> = {}
    for (const col of schema) {
      if (!isAutoGeneratedField(col.name) && !col.primary) {
        initial[col.name] = record[col.name] != null ? String(record[col.name]) : ''
      }
    }
    setEditData(initial)
    setEditOpen(true)
  }, [schema, isAutoGeneratedField])

  const handleEditFieldChange = React.useCallback((fieldName: string, value: string) => {
    setEditData((prev) => ({ ...prev, [fieldName]: value }))
  }, [])

  // Create dialog keep after
  // Generate columns dynamically
  const columns = React.useMemo(
    () => (schema.length > 0 ? generateColumns(schema, onDeleteRequest, onEditRequest) : []),
    [schema, onDeleteRequest, onEditRequest]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    pageCount: totalPages,
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  async function handleConfirmDelete() {
    if (!recordToDelete) return
    const idValue = recordToDelete[primaryKey]
    try {
      const res = await fetch(`/api/admin/${encodeURIComponent(state.collection)}/${encodeURIComponent(String(idValue))}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setConfirmOpen(false)
      setRecordToDelete(null)
      await fetchData()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    try {
      const res = await fetch(`/api/admin/${encodeURIComponent(state.collection)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        throw new Error(json.error || `Create failed: ${res.status}`)
      }
      setCreateOpen(false)
      setFormData({})
      await fetchData()
    } catch (e) {
      setCreateError((e as Error).message)
    }
  }

  const handleFieldChange = React.useCallback((fieldName: string, value: string) => {
    setFormData((prev: Record<string, string>) => ({ ...prev, [fieldName]: value }))
  }, [])

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recordToEdit) return
    setEditError(null)
    try {
      const idValue = recordToEdit[primaryKey]
      const res = await fetch(`/api/admin/${encodeURIComponent(state.collection)}/${encodeURIComponent(String(idValue))}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        throw new Error(json.error || `Update failed: ${res.status}`)
      }
      setEditOpen(false)
      setRecordToEdit(null)
      setEditData({})
      await fetchData()
    } catch (e) {
      setEditError((e as Error).message)
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-end px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <IconPlus />
            <span className="hidden lg:inline">Add</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        {loading && (
          <div className="flex items-center justify-center py-8">
            <IconLoader className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading {state.collection}...</span>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Error: {error}
          </div>
        )}
        {!loading && !error && (
          <>
        <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                        No data found in {state.collection}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} selected · {total} total records
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {state.page} of {totalPages || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                    disabled={state.page === 1}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                    disabled={state.page === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                    disabled={state.page >= totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                    onClick={() => table.setPageIndex(totalPages - 1)}
                    disabled={state.page >= totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </TabsContent>

      <ResponsiveDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ResponsiveDialogContent className="p-5">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete record?</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              This action cannot be undone. You are about to delete one record from "{state.collection}".
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </ResponsiveDialogFooter>
          <ResponsiveDialogClose className="sr-only" />
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <ResponsiveDialog open={createOpen} onOpenChange={setCreateOpen}>
        <ResponsiveDialogContent className="max-h-[90vh] overflow-y-auto p-5">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Add new record to {state.collection}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Fill in the fields below. Auto-generated fields (id, uuid, aid/raid/haid, created_at, updated_at, deleted_at) are hidden and will be created automatically.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 p-4">
            {editableFields.map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                  {field.name}
                  {!field.nullable && <span className="text-destructive ml-1">*</span>}
                  <span className="text-muted-foreground ml-2 text-xs">({field.type})</span>
                </Label>
                <Input
                  id={`field-${field.name}`}
                  type="text"
                  required={!field.nullable}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.name}`}
                />
              </div>
            ))}
            {createError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {createError}
              </div>
            )}
            <ResponsiveDialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </ResponsiveDialogFooter>
          </form>
          <ResponsiveDialogClose className="sr-only" />
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <ResponsiveDialog open={editOpen} onOpenChange={setEditOpen}>
        <ResponsiveDialogContent className="max-h-[90vh] overflow-y-auto p-5">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Edit record in {state.collection}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Change fields below. Auto-generated fields are not editable and hidden.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 p-4">
            {schema.filter((f) => !isAutoGeneratedField(f.name) && !f.primary).map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium">
                  {field.name}
                  {!field.nullable && <span className="text-destructive ml-1">*</span>}
                  <span className="text-muted-foreground ml-2 text-xs">({field.type})</span>
                </Label>
                <Input
                  id={`edit-field-${field.name}`}
                  type="text"
                  required={!field.nullable}
                  value={editData[field.name] || ''}
                  onChange={(e) => handleEditFieldChange(field.name, e.target.value)}
                />
              </div>
            ))}
            {editError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {editError}
              </div>
            )}
            <ResponsiveDialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </ResponsiveDialogFooter>
          </form>
          <ResponsiveDialogClose className="sr-only" />
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </Tabs>
  )
}

