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
  IconCheck,
  IconX,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react"
import { getCollection } from "../../../functions/_shared/collections/getCollection"
import type { AdminFilter } from "../../../functions/_shared/types"
import { useLocale } from "@/packages/hooks/use-locale"
import { DateTimePicker } from "@/packages/components/ui/date-time-picker"
import { PhoneInput } from "@/packages/components/ui/phone-input"
import qs from "qs"
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

type RelationConfig = {
  collection: string
  valueField: string
  labelField: string
  labelFields?: string[]
  filters?: AdminFilter[]
  inheritSearch?: boolean
}

type ColumnSchemaExtended = ColumnSchema & {
  title?: string
  hidden?: boolean
  hiddenTable?: boolean
  readOnly?: boolean
  required?: boolean
  virtual?: boolean
  defaultCell?: any
  format?: (value: any, locale?: string) => string
  fieldType?: 'text' | 'number' | 'email' | 'phone' | 'password' | 'boolean' | 'date' | 'time' | 'datetime' | 'json' | 'array' | 'object' | 'price'
  relation?: RelationConfig
}

type CollectionData = Record<string, any>

type StateResponse = {
  success: boolean
  state: {
    collection: string
    page: number
    pageSize: number
    filters: AdminFilter[]
  }
  schema: {
    columns: ColumnSchema[]
    total: number
    totalPages: number
  }
  data: CollectionData[]
}

// Helper to format cell value
function formatCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) return "-"
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-center">
        {value ? <IconCheck className="size-4 text-green-600" /> : <IconX className="size-4 text-red-600" />}
      </div>
    )
  }
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

// Relation Select Component
function RelationSelect({
  relation,
  value,
  onChange,
  disabled,
  required,
}: {
  relation: RelationConfig
  value: any
  onChange: (value: any) => void
  disabled?: boolean
  required?: boolean
}) {
  const [options, setOptions] = React.useState<Array<{ value: any; label: string }>>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const loadOptions = async () => {
      setLoading(true)
      try {
        const queryParams = qs.stringify({
          c: relation.collection,
          p: 1,
          ps: 1000, // Load more items for select
        })

        const res = await fetch(`/api/admin/state?${queryParams}`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
        
        const json: StateResponse = await res.json()
        
        const opts = json.data.map((item) => ({
          value: item[relation.valueField],
          label: relation.labelFields
            ? relation.labelFields.map(f => item[f]).filter(Boolean).join(" ")
            : String(item[relation.labelField] || "-"),
        }))
        
        console.log(`[RelationSelect] Loaded ${opts.length} options for ${relation.collection}:`, opts)
        setOptions(opts)
      } catch (e) {
        console.error(`[RelationSelect] Failed to load options for ${relation.collection}:`, e)
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [relation])

  return (
    <Select value={value ? String(value) : ""} onValueChange={onChange} disabled={disabled || loading} required={required}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Loading..." : "Select..."} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] z-[9999]" position="popper" sideOffset={5}>
        {options.length === 0 && !loading ? (
          <div className="p-2 text-sm text-muted-foreground">No options available</div>
        ) : (
          options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

// Dynamic column generator
function generateColumns(schema: ColumnSchemaExtended[], onDeleteRequest: (row: Row<CollectionData>) => void, onEditRequest: (row: Row<CollectionData>) => void, locale: string = 'en', relationData: Record<string, Record<any, string>> = {}): ColumnDef<CollectionData>[] {
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
    ...schema.filter(col => !col.hidden && !col.hiddenTable).map((col) => ({
      accessorKey: col.name,
      header: () => (
        <div className="flex items-center gap-1">
          <span>{col.title || col.name}</span>
          {col.primary && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              PK
        </Badge>
          )}
      </div>
    ),
      cell: ({ row }: { row: Row<CollectionData> }) => {
        const value = row.original[col.name]
        
        // For boolean type, show checkbox-like display
        if (col.fieldType === 'boolean') {
          const boolValue = value === 1 || value === true || value === '1' || value === 'true'
          return (
            <div className="flex items-center justify-center">
              {boolValue ? (
                <IconCheck className="size-4 text-green-600" />
              ) : (
                <IconX className="size-4 text-red-600" />
              )}
            </div>
          )
        }
        // For price type (stored as integer cents), show as decimal with 2 digits
        if (col.fieldType === 'price') {
          const cents = typeof value === 'number' ? value : Number(value || 0)
          const amount = isFinite(cents) ? (cents / 100).toFixed(2) : '-'
          return <div className={`${col.primary ? "font-mono font-medium" : "font-mono"}`}>{amount}</div>
        }

        // For relation fields, show label instead of value
        if (col.relation && relationData[col.name]) {
          const label = relationData[col.name][value] || value || "-"
          return <div>{label}</div>
        }
        
        // Use defaultCell if value is empty/null/undefined
        const isEmpty = value === null || value === undefined || value === ''
        const displayValue = isEmpty && col.defaultCell !== undefined
          ? col.defaultCell
          : col.format 
            ? col.format(value, locale) 
            : formatCellValue(value)
        
        return (
          <div className={`${col.primary ? "font-mono font-medium" : ""}`}>
            {displayValue}
          </div>
        )
      },
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
  const { locale } = useLocale()

  const [data, setData] = React.useState<CollectionData[]>([])
  const [schema, setSchema] = React.useState<ColumnSchemaExtended[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [relationData, setRelationData] = React.useState<Record<string, Record<any, string>>>({})
  
  // Local search state for input (debounced before updating global state)
  const [searchInput, setSearchInput] = React.useState(state.search)
  
  // Local state for price inputs to allow free input without formatting interference
  const [priceInputs, setPriceInputs] = React.useState<Record<string, string>>({})

  const primaryKey = React.useMemo(() => schema.find((c) => c.primary)?.name || "id", [schema])

  const fetchData = React.useCallback(async (abortSignal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = qs.stringify({
        c: state.collection,
        p: state.page,
        ps: state.pageSize,
        ...(state.search && { s: state.search }),
        ...(state.filters.length > 0 && { filters: state.filters }),
      })

      const res = await fetch(`/api/admin/state?${queryParams}`, {
        signal: abortSignal,
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`)
      }
      const json: StateResponse = await res.json()
      
      // Get collection config and apply column settings
      const collection = getCollection(state.collection)
      const extendedColumns: ColumnSchemaExtended[] = json.schema.columns.map((col) => {
        const columnConfig = (collection as any)[col.name]
        const options = columnConfig?.options || {}
        
        return {
          ...col,
          title: options.title,
          hidden: options.hidden || false,
          hiddenTable: options.hiddenTable || false,
          readOnly: options.readOnly || false,
          required: options.required || false,
          virtual: options.virtual || false,
          defaultCell: options.defaultCell,
          format: options.format,
          fieldType: options.type,
          relation: options.relation,
        }
      })
      
      // Load relation data for display
      const relationsToLoad = extendedColumns.filter(col => col.relation)
      const relationDataMap: Record<string, Record<any, string>> = {}
      
      for (const col of relationsToLoad) {
        if (!col.relation) continue
        
        try {
          // Limit relation fetch to only values actually used in current page data
          const valuesInUse = Array.from(
            new Set(
              (json.data || [])
                .map((row: any) => row[col.name])
                .filter((v: any) => v !== null && v !== undefined && v !== "")
            )
          )

          // Compose relation filters: defaults from schema + limit to values in current page
          const relationFilters: AdminFilter[] = []
          if (Array.isArray(col.relation.filters)) {
            relationFilters.push(...col.relation.filters)
          }
          if (valuesInUse.length > 0) {
            relationFilters.push({ field: col.relation.valueField, op: 'in', value: valuesInUse.join(',') })
          }

          const queryParams = qs.stringify({
            c: col.relation.collection,
            p: 1,
            ps: 1000,
            ...(col.relation.inheritSearch && state.search && { s: state.search }),
            ...(relationFilters.length > 0 && { filters: relationFilters }),
          })
          
          const relRes = await fetch(`/api/admin/state?${queryParams}`, {
            credentials: "include",
          })
          
          if (relRes.ok) {
            const relJson: StateResponse = await relRes.json()
            const map: Record<any, string> = {}
            
            relJson.data.forEach((item) => {
              const value = item[col.relation!.valueField]
              const label = col.relation!.labelFields
                ? col.relation!.labelFields.map(f => item[f]).filter(Boolean).join(" ")
                : String(item[col.relation!.labelField] || "-")
              map[value] = label
            })
            
            relationDataMap[col.name] = map
          }
        } catch (e) {
          console.error(`Failed to load relation data for ${col.name}:`, e)
        }
      }
      
      setRelationData(relationDataMap)
      
      // Update local state (preserve search from current state)
      setState((prev) => ({ ...prev, ...json.state }))
      setSchema(extendedColumns)
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
  }, [state.collection, state.page, state.pageSize, state.search, JSON.stringify(state.filters), setState])

  React.useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData])

  // Sync searchInput with state.search when collection changes
  React.useEffect(() => {
    setSearchInput(state.search)
  }, [state.collection])

  // Debounce search input and update state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== state.search) {
        setState((prev) => ({
          ...prev,
          search: searchInput,
          page: 1, // Reset to first page when search changes
        }))
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchInput, state.search, setState])

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

  // Batch delete confirmation state
  const [batchDeleteOpen, setBatchDeleteOpen] = React.useState(false)
  const [batchDeleting, setBatchDeleting] = React.useState(false)

  // Create dialog state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<Record<string, any>>({})
  const [createError, setCreateError] = React.useState<string | null>(null)

  // Clear form data when collection changes
  React.useEffect(() => {
    setFormData({})
    setCreateError(null)
    setPriceInputs({})
  }, [state.collection])

  // Fields to skip (auto-generated): id, uuid, {x}aid (but not relation fields), created_at, updated_at, deleted_at
  const isAutoGeneratedField = React.useCallback((fieldName: string, hasRelation?: boolean): boolean => {
    const lower = fieldName.toLowerCase()
    return (
      lower === 'id' ||
      lower === 'uuid' ||
      (lower.endsWith('aid') && !hasRelation) || // Skip aid fields unless they have relations
      lower === 'created_at' ||
      lower === 'updated_at' ||
      lower === 'deleted_at'
    )
  }, [])

  const editableFields = React.useMemo(
    () => schema.filter((col) => !isAutoGeneratedField(col.name, !!col.relation) && !col.primary && !col.hidden),
    [schema, isAutoGeneratedField]
  )

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false)
  const [recordToEdit, setRecordToEdit] = React.useState<CollectionData | null>(null)
  const [editData, setEditData] = React.useState<Record<string, any>>({})
  const [editError, setEditError] = React.useState<string | null>(null)

  // Clear edit data when collection changes
  React.useEffect(() => {
    setEditData({})
    setEditError(null)
    setRecordToEdit(null)
    setPriceInputs({})
  }, [state.collection])

  const onEditRequest = React.useCallback((row: Row<CollectionData>) => {
    const record = row.original
    setRecordToEdit(record)
    const initial: Record<string, any> = {}
    for (const col of schema) {
      if (!isAutoGeneratedField(col.name, !!col.relation) && !col.primary) {
        if (col.fieldType === 'boolean') {
          initial[col.name] = record[col.name] === 1 || record[col.name] === true || record[col.name] === '1' || record[col.name] === 'true'
        } else if (col.fieldType === 'date' || col.fieldType === 'time' || col.fieldType === 'datetime') {
          initial[col.name] = record[col.name] ? new Date(record[col.name]) : null
        } else if (col.fieldType === 'price') {
          const cents = record[col.name]
          initial[col.name] = cents == null ? null : Number(cents)
        } else if (col.fieldType === 'json') {
          // Keep JSON fields as objects (or parse from string if needed)
          if (record[col.name] != null) {
            if (typeof record[col.name] === 'string') {
              try {
                initial[col.name] = JSON.parse(record[col.name])
              } catch {
                initial[col.name] = {}
              }
            } else {
              initial[col.name] = record[col.name]
            }
          } else {
            initial[col.name] = {}
          }
        } else {
          initial[col.name] = record[col.name] != null ? String(record[col.name]) : ''
        }
      }
    }
    setEditData(initial)
    setEditOpen(true)
  }, [schema, isAutoGeneratedField])

  const handleEditFieldChange = React.useCallback((fieldName: string, value: string | boolean | Date | number | null) => {
    setEditData((prev) => ({ ...prev, [fieldName]: value }))
  }, [])

  // Create dialog keep after
  // Generate columns dynamically
  const columns = React.useMemo(
    () => (schema.length > 0 ? generateColumns(schema, onDeleteRequest, onEditRequest, locale, relationData) : []),
    [schema, onDeleteRequest, onEditRequest, locale, relationData]
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

  async function handleBatchDelete() {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) return
    
    setBatchDeleting(true)
    setError(null)
    
    try {
      // Delete each selected row
      for (const row of selectedRows) {
        const idValue = row.original[primaryKey]
        const res = await fetch(`/api/admin/${encodeURIComponent(state.collection)}/${encodeURIComponent(String(idValue))}`, {
          method: "DELETE",
          credentials: "include",
        })
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      }
      
      setBatchDeleteOpen(false)
      setRowSelection({}) // Clear selection
      await fetchData()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBatchDeleting(false)
    }
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    try {
      // Convert Date objects to ISO strings and serialize JSON fields for API
      const payload = Object.entries(formData).reduce((acc, [key, value]) => {
        const field = schema.find(f => f.name === key)
        if (field?.fieldType === 'json' && value != null && typeof value === 'object') {
          acc[key] = value // Keep as object, server will stringify
        } else if (value instanceof Date) {
          acc[key] = value.toISOString()
        } else {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)
      
      const res = await fetch(`/api/admin/${encodeURIComponent(state.collection)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
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

  const handleFieldChange = React.useCallback((fieldName: string, value: string | boolean | Date | number | null) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, [fieldName]: value }))
  }, [])

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recordToEdit) return
    setEditError(null)
    try {
      // Convert Date objects to ISO strings and keep JSON fields as objects for API
      const payload = Object.entries(editData).reduce((acc, [key, value]) => {
        const field = schema.find(f => f.name === key)
        if (field?.fieldType === 'json' && value != null && typeof value === 'object') {
          acc[key] = value // Keep as object, server will stringify
        } else if (value instanceof Date) {
          acc[key] = value.toISOString()
        } else {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)
      
      const idValue = recordToEdit[primaryKey]
      const res = await fetch(`/api/admin/${encodeURIComponent(state.collection)}/${encodeURIComponent(String(idValue))}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
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
      <div className="flex items-center justify-between px-4 lg:px-6">
        {/* Search Field */}
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <div className="flex items-center gap-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setBatchDeleteOpen(true)}
              disabled={batchDeleting}
            >
              <IconTrash />
              <span className="hidden lg:inline">Delete Selected</span>
              <span className="lg:hidden">Delete</span>
            </Button>
          )}
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

      <ResponsiveDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <ResponsiveDialogContent className="p-5">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete selected records?</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              This action cannot be undone. You are about to delete {table.getFilteredSelectedRowModel().rows.length} records from "{state.collection}".
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteOpen(false)} disabled={batchDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleBatchDelete} disabled={batchDeleting}>
              {batchDeleting ? (
                <>
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete All'
              )}
            </Button>
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
                {field.fieldType === 'boolean' ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`field-${field.name}`}
                      checked={formData[field.name] === true}
                      onCheckedChange={(checked) => handleFieldChange(field.name, checked === true)}
                    />
                    <Label htmlFor={`field-${field.name}`} className="text-sm font-medium cursor-pointer">
                      {field.title || field.name}
                    </Label>
                  </div>
                ) : field.fieldType === 'date' || field.fieldType === 'time' || field.fieldType === 'datetime' ? (
                  <>
                    <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <DateTimePicker
                      mode={field.fieldType}
                      value={formData[field.name] || null}
                      onChange={(date) => handleFieldChange(field.name, date)}
                      placeholder={`Select ${field.title || field.name}`}
                    />
                  </>
                ) : field.fieldType === 'phone' ? (
                  <>
                    <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <PhoneInput
                      value={formData[field.name] || ''}
                      onChange={(value) => handleFieldChange(field.name, value || '')}
                      placeholder={`Enter ${field.title || field.name}`}
                    />
                  </>
                ) : field.fieldType === 'password' ? (
                  <>
                    <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`field-${field.name}`}
                      type="password"
                      required={!field.nullable}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.title || field.name}`}
                      minLength={8}
                    />
                    <Label htmlFor={`field-${field.name}-confirm`} className="text-sm font-medium">
                      Confirm {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`field-${field.name}-confirm`}
                      type="password"
                      required={!field.nullable}
                      value={formData[`${field.name}_confirm`] || ""}
                      onChange={(e) => handleFieldChange(`${field.name}_confirm`, e.target.value)}
                      placeholder={`Confirm ${field.title || field.name}`}
                      minLength={8}
                    />
                    {formData[field.name] && formData[`${field.name}_confirm`] && formData[field.name] !== formData[`${field.name}_confirm`] && (
                      <p className="text-sm text-destructive">Passwords do not match</p>
                    )}
                  </>
                ) : (field as any).fieldType === 'price' ? (
                  <>
                    <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`field-${field.name}`}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      required={!field.nullable}
                      value={
                        priceInputs[`create-${field.name}`] !== undefined
                          ? priceInputs[`create-${field.name}`]
                          : formData[field.name] === undefined || formData[field.name] === null
                            ? ""
                            : (Number(formData[field.name]) / 100).toFixed(2)
                      }
                      onChange={(e) => {
                        let v = e.target.value.replace(/,/g, '.')
                        // Store raw input value for free editing
                        setPriceInputs(prev => ({ ...prev, [`create-${field.name}`]: v }))
                        // limit to two decimals
                        if (v.includes('.')) {
                          const [i, d] = v.split('.')
                          v = `${i}.${d.slice(0, 2)}`
                        }
                        const num = v === '' ? NaN : Number(v)
                        const cents = !isFinite(num) ? null : Math.round(num * 100)
                        handleFieldChange(field.name, cents)
                      }}
                      onBlur={(e) => {
                        let v = e.target.value.replace(/,/g, '.')
                        // Format on blur
                        if (v.includes('.')) {
                          const [i, d] = v.split('.')
                          v = `${i}.${d.slice(0, 2)}`
                        }
                        const num = v === '' ? NaN : Number(v)
                        if (isFinite(num)) {
                          const formatted = num.toFixed(2)
                          setPriceInputs(prev => ({ ...prev, [`create-${field.name}`]: formatted }))
                          const cents = Math.round(num * 100)
                          handleFieldChange(field.name, cents)
                        }
                      }}
                      placeholder={`Enter ${field.title || field.name}`}
                    />
                  </>
                ) : field.relation ? (
                  <>
                    <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <RelationSelect
                      relation={field.relation}
                      value={formData[field.name]}
                      onChange={(value) => handleFieldChange(field.name, value)}
                      required={!field.nullable}
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`field-${field.name}`}
                      type={field.fieldType === 'email' ? 'email' : field.fieldType === 'number' ? 'number' : 'text'}
                      required={!field.nullable}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.title || field.name}`}
                    />
                  </>
                )}
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
            {schema.filter((f) => !isAutoGeneratedField(f.name, !!f.relation) && !f.primary && !f.hidden).map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                {field.fieldType === 'boolean' ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`edit-field-${field.name}`}
                      checked={editData[field.name] === true}
                      onCheckedChange={(checked) => handleEditFieldChange(field.name, checked === true)}
                      disabled={field.readOnly}
                    />
                    <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium cursor-pointer">
                      {field.title || field.name}
                    </Label>
                  </div>
                ) : field.fieldType === 'date' || field.fieldType === 'time' || field.fieldType === 'datetime' ? (
                  <>
                    <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <DateTimePicker
                      mode={field.fieldType}
                      value={editData[field.name] || null}
                      onChange={(date) => handleEditFieldChange(field.name, date)}
                      placeholder={`Select ${field.title || field.name}`}
                      disabled={field.readOnly}
                    />
                  </>
                ) : field.fieldType === 'phone' ? (
                  <>
                    <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <PhoneInput
                      value={editData[field.name] || ''}
                      onChange={(value) => handleEditFieldChange(field.name, value || '')}
                      placeholder={`Enter ${field.title || field.name}`}
                      disabled={field.readOnly}
                    />
                  </>
                ) : field.fieldType === 'password' ? (
                  <>
                    <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name} (leave empty to keep current)
                    </Label>
                    <Input
                      id={`edit-field-${field.name}`}
                      type="password"
                      value={editData[field.name] || ""}
                      onChange={(e) => handleEditFieldChange(field.name, e.target.value)}
                      placeholder={`Enter new ${field.title || field.name}`}
                      disabled={field.readOnly}
                      minLength={8}
                    />
                    <Label htmlFor={`edit-field-${field.name}-confirm`} className="text-sm font-medium">
                      Confirm {field.title || field.name}
                    </Label>
                    <Input
                      id={`edit-field-${field.name}-confirm`}
                      type="password"
                      value={editData[`${field.name}_confirm`] || ""}
                      onChange={(e) => handleEditFieldChange(`${field.name}_confirm`, e.target.value)}
                      placeholder={`Confirm new ${field.title || field.name}`}
                      disabled={field.readOnly}
                      minLength={8}
                    />
                    {editData[field.name] && editData[`${field.name}_confirm`] && editData[field.name] !== editData[`${field.name}_confirm`] && (
                      <p className="text-sm text-destructive">Passwords do not match</p>
                    )}
                  </>
                ) : (field as any).fieldType === 'price' ? (
                  <>
                    <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`edit-field-${field.name}`}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      required={!field.nullable}
                      value={
                        priceInputs[`edit-${field.name}`] !== undefined
                          ? priceInputs[`edit-${field.name}`]
                          : editData[field.name] === undefined || editData[field.name] === null
                            ? ""
                            : (Number(editData[field.name]) / 100).toFixed(2)
                      }
                      onChange={(e) => {
                        let v = e.target.value.replace(/,/g, '.')
                        // Store raw input value for free editing
                        setPriceInputs(prev => ({ ...prev, [`edit-${field.name}`]: v }))
                        // limit to two decimals
                        if (v.includes('.')) {
                          const [i, d] = v.split('.')
                          v = `${i}.${d.slice(0, 2)}`
                        }
                        const num = v === '' ? NaN : Number(v)
                        const cents = !isFinite(num) ? null : Math.round(num * 100)
                        handleEditFieldChange(field.name, cents)
                      }}
                      onBlur={(e) => {
                        let v = e.target.value.replace(/,/g, '.')
                        // Format on blur
                        if (v.includes('.')) {
                          const [i, d] = v.split('.')
                          v = `${i}.${d.slice(0, 2)}`
                        }
                        const num = v === '' ? NaN : Number(v)
                        if (isFinite(num)) {
                          const formatted = num.toFixed(2)
                          setPriceInputs(prev => ({ ...prev, [`edit-${field.name}`]: formatted }))
                          const cents = Math.round(num * 100)
                          handleEditFieldChange(field.name, cents)
                        }
                      }}
                      disabled={field.readOnly}
                    />
                  </>
                ) : field.relation ? (
                  <>
                    <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <RelationSelect
                      relation={field.relation}
                      value={editData[field.name]}
                      onChange={(value) => handleEditFieldChange(field.name, value)}
                      required={!field.nullable}
                      disabled={field.readOnly}
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor={`edit-field-${field.name}`} className="text-sm font-medium">
                      {field.title || field.name}
                      {!field.nullable && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={`edit-field-${field.name}`}
                      type={field.fieldType === 'email' ? 'email' : field.fieldType === 'number' ? 'number' : 'text'}
                      required={!field.nullable}
                      value={editData[field.name] || ''}
                      onChange={(e) => handleEditFieldChange(field.name, e.target.value)}
                      disabled={field.readOnly}
                    />
                  </>
                )}
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

