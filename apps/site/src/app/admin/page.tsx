"use client"

import * as React from "react"
import { AppSidebar } from "@/components/application-blocks/app-sidebar"
import { DataTable } from "@/components/application-blocks/data-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AdminStateProvider, useAdminState } from "@/components/admin/AdminStateProvider"
import { getCollection } from "@/shared/collections/getCollection"
import data from "./data.json"

function AdminContent() {
  const { state } = useAdminState()
  const [displayTitle, setDisplayTitle] = React.useState<string>('')

  React.useEffect(() => {
    // Get collection config to check for __title
    const collection = getCollection(state.collection)
    const titleConfig = (collection as any).__title
    
    // Use __title if available, otherwise use collection name
    const collectionName = state.collection.charAt(0).toUpperCase() + state.collection.slice(1)
    let title = collectionName
    
    // Check if __title is a string or BaseColumn
    if (typeof titleConfig === 'string') {
      title = titleConfig
    } else if (titleConfig?.options?.defaultValue) {
      title = titleConfig.options.defaultValue
    }
    
    setDisplayTitle(title)
    
    // Update document title
    const newTitle = `${title} - Admin Panel`
    document.title = newTitle
    
    // Set again after a short delay to override Next.js metadata
    const timeouts = [
      setTimeout(() => { document.title = newTitle }, 0),
      setTimeout(() => { document.title = newTitle }, 10),
      setTimeout(() => { document.title = newTitle }, 100),
    ]
    
    return () => {
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [state.collection])

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
                  <BreadcrumbLink href="#">
                    Admin Panel
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayTitle || state.collection}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-y-auto p-4">
            <DataTable/>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminStateProvider>
      <AdminContent />
    </AdminStateProvider>
  )
}
