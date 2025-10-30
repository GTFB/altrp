"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface RoleAuthGuardProps {
  children: ReactNode
  allowedRoles?: string[]
  allowedRaids?: string[]
  redirectTo?: string
}

export default function RoleAuthGuard({
  children,
  allowedRoles = [],
  allowedRaids = [],
  redirectTo = "/login",
}: RoleAuthGuardProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  const redirect = () => {
    try {
      document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    } catch {}
    router.replace(redirectTo)
  }

  const checkAccess = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" })
      if (!response.ok) {
        redirect()
        return false
      }

      const data: { 
        user: { 
          roles?: Array<{ raid: string | null; [key: string]: any }>; 
          isAdmin?: boolean 
        } 
      } = await response.json()
      const isSystemAdmin = Boolean(data.user.isAdmin)

      // Extract raid values from roles array
      const userRaids = (data.user.roles || [])
        .map((r) => r.raid)
        .filter((v): v is string => Boolean(v))

      const roleAllowed = allowedRoles.length
        ? allowedRoles.some((r) => userRaids.includes(r))
        : false
      const raidAllowed = allowedRaids.length
        ? allowedRaids.some((r) => userRaids.includes(r))
        : false

      if (!(roleAllowed || raidAllowed || isSystemAdmin)) {
        redirect()
        return false
      }

      return true
    } catch (err) {
      console.error("Role auth check failed:", err)
      redirect()
      return false
    }
  }

  useEffect(() => {
    const run = async () => {
      const ok = await checkAccess()
      if (ok) setChecking(false)
    }
    run()
    // Periodic re-check each minute
    const interval = setInterval(() => {
      checkAccess()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}


