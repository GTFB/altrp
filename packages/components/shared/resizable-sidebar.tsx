"use client"

import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

interface ResizableSidebarProps {
  children: ReactNode
  className?: string
}

export function ResizableSidebar({ children, className = "" }: ResizableSidebarProps) {
  return (
    <div className={`h-full bg-sidebar border-r ${className}`}>
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    </div>
  )
}
