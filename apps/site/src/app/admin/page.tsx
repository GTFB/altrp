"use client"

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
import { AdminStateProvider } from "@/components/admin/AdminStateProvider"
import data from "./data.json"

export default function AdminPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AdminStateProvider>
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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
              <DataTable/>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AdminStateProvider>
    </div>
  )
}
