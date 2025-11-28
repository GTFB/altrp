"use client"

import * as React from "react"
import { AppSidebar } from "@/components/application-blocks/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Database, Loader2, CheckCircle2, XCircle, AlertCircle, Eye, RotateCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { seeds, type SeedMeta } from "../../../../functions/_shared/seeds"
import { ScrollArea } from "@/components/ui/scroll-area"

type SeedItem = {
  id: string
  name: string
  meta: SeedMeta
}

type SeedResult = {
  inserted: number
  skipped: number
  errors: number
}

type RollbackResult = {
  deleted: number
  notFound: number
  errors: number
}

export default function SeedPage() {
  const [loading] = React.useState(false)
  const [seeding, setSeeding] = React.useState(false)
  const [rollingBack, setRollingBack] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [rollbackDialogOpen, setRollbackDialogOpen] = React.useState(false)
  const [exploreDialogOpen, setExploreDialogOpen] = React.useState(false)
  const [selectedSeed, setSelectedSeed] = React.useState<SeedItem | null>(null)
  const [rollbackSeed, setRollbackSeed] = React.useState<SeedItem | null>(null)
  const [exploreSeed, setExploreSeed] = React.useState<SeedItem | null>(null)
  const [result, setResult] = React.useState<{
    success: boolean
    results?: Record<string, SeedResult>
    error?: string
  } | null>(null)
  const [rollbackResult, setRollbackResult] = React.useState<{
    success: boolean
    results?: Record<string, RollbackResult>
    error?: string
  } | null>(null)

  // Convert imported seeds to SeedItem format
  const seedItems = React.useMemo<SeedItem[]>(() => {
    return seeds.map((seed: any) => ({
      id: seed.id,
      name: seed.data.__meta__.name,
      meta: seed.data.__meta__,
    }))
  }, [])

  const handleSeedClick = (seed: SeedItem) => {
    setSelectedSeed(seed)
    setDialogOpen(true)
    setResult(null)
  }

  const handleExploreClick = (seed: SeedItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setExploreSeed(seed)
    setExploreDialogOpen(true)
  }

  const getSeedData = (seedId: string) => {
    const seed = seeds.find((s: any) => s.id === seedId)
    if (!seed) return null
    const { __meta__, ...data } = (seed as any).data
    return data
  }

  const handleConfirmSeed = async () => {
    if (!selectedSeed) return

    setSeeding(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seedId: selectedSeed.id,
        }),
      })

      const data = await response.json() as {
        success?: boolean
        results?: Record<string, SeedResult>
        error?: string
      }

      if (data.success) {
        setResult({
          success: true,
          results: data.results,
        })
      } else {
        setResult({
          success: false,
          error: data.error || 'Unknown error occurred',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: String(error),
      })
    } finally {
      setSeeding(false)
    }
  }

  const handleRollbackClick = (seed: SeedItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setRollbackSeed(seed)
    setRollbackDialogOpen(true)
    setRollbackResult(null)
  }

  const handleConfirmRollback = async () => {
    if (!rollbackSeed) return

    setRollingBack(true)
    setRollbackResult(null)

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seedId: rollbackSeed.id,
        }),
      })

      const data = await response.json() as {
        success?: boolean
        results?: Record<string, RollbackResult>
        error?: string
      }

      if (data.success) {
        setRollbackResult({
          success: true,
          results: data.results,
        })
      } else {
        setRollbackResult({
          success: false,
          error: data.error || 'Unknown error occurred',
        })
      }
    } catch (error) {
      setRollbackResult({
        success: false,
        error: String(error),
      })
    } finally {
      setRollingBack(false)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedSeed(null)
    setResult(null)
  }

  const handleCloseRollbackDialog = () => {
    setRollbackDialogOpen(false)
    setRollbackSeed(null)
    setRollbackResult(null)
  }

  const getTotalRollbackStats = (results?: Record<string, RollbackResult>) => {
    if (!results) return { deleted: 0, notFound: 0, errors: 0 }

    return Object.values(results).reduce(
      (acc, result) => ({
        deleted: acc.deleted + result.deleted,
        notFound: acc.notFound + result.notFound,
        errors: acc.errors + result.errors,
      }),
      { deleted: 0, notFound: 0, errors: 0 }
    )
  }

  const getTotalStats = (results?: Record<string, SeedResult>) => {
    if (!results) return { inserted: 0, skipped: 0, errors: 0 }

    return Object.values(results).reduce(
      (acc, result) => ({
        inserted: acc.inserted + result.inserted,
        skipped: acc.skipped + result.skipped,
        errors: acc.errors + result.errors,
      }),
      { inserted: 0, skipped: 0, errors: 0 }
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin Panel</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Database Seeding</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Database Seeding</h1>
                <p className="text-muted-foreground mt-2">
                  Seed your database with predefined data sets. Each seed file contains structured data that will be inserted if not already present.
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {seedItems.map((seed) => (
                    <Card key={seed.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">
                              {seed.meta?.name || seed.name}
                            </CardTitle>
                          </div>
                        </div>
                        {seed.meta?.versions?.[0] && (
                          <CardDescription className="space-y-1">
                            <div className="font-mono text-xs">
                              v{seed.meta.versions[0].version}
                            </div>
                            <div>{seed.meta.versions[0].description}</div>
                            <div className="text-xs text-muted-foreground">
                              Created: {seed.meta.versions[0].created_at}
                            </div>
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSeedClick(seed)}
                            className="flex-1"
                            variant="outline"
                          >
                            <Database className="mr-2 h-4 w-4" />
                            Seed Database
                          </Button>
                          <Button
                            onClick={(e) => handleRollbackClick(seed, e)}
                            className="flex-1"
                            variant="destructive"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Rollback
                          </Button>
                          <Button
                            onClick={(e) => handleExploreClick(seed, e)}
                            variant="outline"
                            size="icon"
                            title="Explore Data"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {seedItems.length === 0 && !loading && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No seed files found</AlertTitle>
                  <AlertDescription>
                    Add TypeScript seed files to <code className="text-sm">functions/_shared/seeds/</code> directory.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {result ? 'Seeding Results' : 'Confirm Database Seeding'}
            </DialogTitle>
            <DialogDescription>
              {!result && selectedSeed && selectedSeed.meta?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {!result && selectedSeed && selectedSeed.meta?.versions && (
              <div className="space-y-3 mb-4">
                <div className="text-sm font-medium">Version History:</div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedSeed.meta.versions.map((version, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardHeader className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="font-mono text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                                v{version.version}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {version.created_at}
                              </div>
                            </div>
                            <div className="text-sm">{version.description}</div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!result && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action will insert data into your database. Records with existing UUIDs will be skipped.
                </AlertDescription>
              </Alert>
            )}

            {seeding && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">
                  Seeding database...
                </span>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <>
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-900">Success</AlertTitle>
                      <AlertDescription className="text-green-800">
                        Database seeded successfully
                      </AlertDescription>
                    </Alert>

                    {result.results && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Summary:</div>
                        {Object.entries(result.results).map(([collection, stats]) => (
                          <div
                            key={collection}
                            className="rounded-lg border p-3 text-sm space-y-1"
                          >
                            <div className="font-medium capitalize">{collection}</div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                {stats.inserted} inserted
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-yellow-600" />
                                {stats.skipped} skipped
                              </div>
                              <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-600" />
                                {stats.errors} errors
                              </div>
                            </div>
                          </div>
                        ))}

                        {(() => {
                          const totals = getTotalStats(result.results)
                          return (
                            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3 text-sm font-medium">
                              <div>Total: {totals.inserted} inserted, {totals.skipped} skipped, {totals.errors} errors</div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {!result ? (
              <>
                <Button variant="outline" onClick={handleCloseDialog} disabled={seeding}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmSeed} disabled={seeding}>
                  {seeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    'Confirm Seed'
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleCloseDialog}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {rollbackResult ? 'Rollback Results' : 'Confirm Database Rollback'}
            </DialogTitle>
            <DialogDescription>
              {!rollbackResult && rollbackSeed && rollbackSeed.meta?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {!rollbackResult && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action will permanently delete data from your database. Records from the seed file will be removed. For taxonomy: deleted by entity and name. For other entities: deleted by UUID.
                </AlertDescription>
              </Alert>
            )}

            {rollingBack && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">
                  Rolling back database...
                </span>
              </div>
            )}

            {rollbackResult && (
              <div className="space-y-4">
                {rollbackResult.success ? (
                  <>
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-900">Success</AlertTitle>
                      <AlertDescription className="text-green-800">
                        Database rollback completed successfully
                      </AlertDescription>
                    </Alert>

                    {rollbackResult.results && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Summary:</div>
                        {Object.entries(rollbackResult.results).map(([collection, stats]) => (
                          <div
                            key={collection}
                            className="rounded-lg border p-3 text-sm space-y-1"
                          >
                            <div className="font-medium capitalize">{collection}</div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                {stats.deleted} deleted
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-yellow-600" />
                                {stats.notFound} not found
                              </div>
                              <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-600" />
                                {stats.errors} errors
                              </div>
                            </div>
                          </div>
                        ))}

                        {(() => {
                          const totals = getTotalRollbackStats(rollbackResult.results)
                          return (
                            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3 text-sm font-medium">
                              <div>Total: {totals.deleted} deleted, {totals.notFound} not found, {totals.errors} errors</div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{rollbackResult.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {!rollbackResult ? (
              <>
                <Button variant="outline" onClick={handleCloseRollbackDialog} disabled={rollingBack}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmRollback} disabled={rollingBack} variant="destructive">
                  {rollingBack ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rolling back...
                    </>
                  ) : (
                    'Confirm Rollback'
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleCloseRollbackDialog}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exploreDialogOpen} onOpenChange={setExploreDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Explore Seed Data</DialogTitle>
            <DialogDescription>
              {exploreSeed?.name} - Preview of data that will be inserted
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 w-full overflow-y-auto rounded-md border bg-muted/50">
            <pre className="p-4 text-xs font-mono">
              <code className="text-foreground">
                {exploreSeed && JSON.stringify(getSeedData(exploreSeed.id), null, 2)}
              </code>
            </pre>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button onClick={() => setExploreDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

