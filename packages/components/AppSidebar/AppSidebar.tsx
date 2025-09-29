"use client"

import * as React from "react"
import {
  PanelLeftClose,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { useLeftSidebar } from "../providers/LeftSidebarProvider"

export interface NavigationItem {
  id: string
  title: string
  icon: any
  href: string
}

interface AppSidebarProps {
  items: NavigationItem[]
  onToggle?: () => void
}

export function AppSidebar({ items,  onToggle }: AppSidebarProps) {
  const{leftSidebarOpen, setLeftSidebarOpen} = useLeftSidebar()

  return (
    <Sidebar 
      className={`lg:block transition-transform ease-in-out theme-transition fixed left-0 top-0 z-50 h-full`}
      
    >
      <SidebarHeader className="border-b px-6 h-25 flex items-center justify-between sidebar-header-nowrap" style={{ height: 'calc(6.25rem + 1px)' }}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Link href={`/`} target="_blank">
            <img 
              src="/images/logo.svg" 
              alt="Jambo Logo" 
              className="w-8 h-8"
              width="32"
              height="32"
            />
            </Link>
          </div>
          <div>
            <Link href={`/`} target="_blank">
            <h2 className="text-lg font-semibold">Jambo</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
            </Link>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 flex-shrink-0" 
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        >
          <PanelLeftClose className="h-3 w-3" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-3 py-2">
        <SidebarMenu>
          {items.map((item) => {
            const pathname = usePathname()

            const isActive = pathname === item.href
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  className={isActive ? "bg-accent" : ""}
                >
                  <Link href={item.href as any} className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t px-6 py-2 h-16 flex items-center justify-center">
       
      </SidebarFooter>
    </Sidebar>
  )
}
