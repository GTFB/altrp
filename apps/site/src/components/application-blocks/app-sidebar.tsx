"use client"

import * as React from "react"
import {
  Bot,
  BookOpen,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Database,
} from "lucide-react"

import { NavMain } from "@/components/application-blocks/nav-main"
import { NavUser } from "@/components/application-blocks/nav-user"
import { TeamSwitcher } from "@/components/application-blocks/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useResizableSidebar } from "@/packages/hooks/use-resizable-sidebar"
import { useAdminState } from "@/components/admin/AdminStateProvider"

type CollectionsResponse = {
  success: boolean
  total: number
  groups: { category: string; collections: string[] }[]
}

type MeResponse = {
  user?: { id: string; email: string; name: string; role: string }
  error?: string
}

const categoryIcon: Record<string, any> = {
  System: Settings2,
  Content: BookOpen,
  People: Map,
  Organization: Frame,
  Finance: PieChart,
  Products: SquareTerminal,
  Communication: Bot,
  Relations: Bot,
  Journal: BookOpen,
  Other: SquareTerminal,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { handleMouseDown } = useResizableSidebar()
  const { state, pushState } = useAdminState()

  const [groups, setGroups] = React.useState<CollectionsResponse["groups"]>([])
  const [user, setUser] = React.useState<MeResponse["user"] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [collectionsRes, meRes] = await Promise.all([
          fetch("/api/admin/collections", {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch("/api/auth/me", { credentials: "include", signal: controller.signal }),
        ])
        if (!collectionsRes.ok) throw new Error(`Collections failed: ${collectionsRes.status}`)
        const collectionsJson: CollectionsResponse = await collectionsRes.json()
        setGroups(collectionsJson.groups)

        if (meRes.ok) {
          const meJson: MeResponse = await meRes.json()
          if (meJson.user) setUser(meJson.user)
        }
      } catch (e) {
        if ((e as any).name !== "AbortError") setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const items = React.useMemo(() => {
    const databaseItems = [
      {
        title: "Database",
        url: "#",
        icon: Database,
        isActive: false,
        items: [
          {
            title: "Seed Data",
            url: "/admin/seed",
          },
        ],
      },
    ]

    const collectionItems = groups.map((group) => ({
      title: group.category,
      url: "#",
      icon: categoryIcon[group.category] || SquareTerminal,
      isActive: group.collections.includes(state.collection),
      items: group.collections.map((name) => {
        // Build proper URL for the collection
        const params = new URLSearchParams()
        params.set("c", name)
        params.set("p", "1")
        
        return {
          title: name,
          url: `/admin?${params.toString()}`,
        }
      }),
    }))

    return [...databaseItems, ...collectionItems]
  }, [groups, state.collection, pushState])

  // Dummy teams source for TeamSwitcher (kept UI parity). Could be enriched later.
  const teams = [{ name: "Admin", logo: Settings2, plan: "" }]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams as any} />
      </SidebarHeader>
      <SidebarContent>
        {loading && (
          <div className="px-3 py-2 text-xs text-muted-foreground">Loading...</div>
        )}
        {error && (
          <div className="px-3 py-2 text-xs text-destructive">{error}</div>
        )}
        {!loading && !error && <NavMain items={items} />}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={{ name: user.name, email: user.email, avatar: "/avatars/placeholder-user.jpg" }} />}
      </SidebarFooter>
      <SidebarRail onMouseDown={handleMouseDown} />
    </Sidebar>
  )
}
