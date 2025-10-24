"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AdminAuthGuardProps {
  children: ReactNode
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  // Redirect to login
  const redirectToLogin = () => {
    try {
      document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    } catch {}
    router.replace('/login')
  }

  // Check if current user is still admin
  const checkUserAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        redirectToLogin()
        return false
      }

      const data: { user: { role: string } } = await response.json()
      
      if (data.user.role !== 'admin') {
        redirectToLogin()
        return false
      }

      return true
    } catch (err) {
      console.error('Auth check failed:', err)
      redirectToLogin()
      return false
    }
  }

  // Initial check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If on create-new-user page, skip auth checks
        if (pathname === '/admin/create-new-user') {
          setChecking(false)
          return
        }

        // Check if users exist
        const checkResponse = await fetch('/api/auth/check-users')
        const checkData: { hasUsers: boolean } = await checkResponse.json()
        
        if (!checkData.hasUsers) {
          // No users exist, redirect to create first user
          router.replace('/admin/create-new-user')
          return
        }
        
        // Check if current user is admin
        const isAdmin = await checkUserAuth()
        if (!isAdmin) {
          return
        }
        
        setChecking(false)
      } catch (err) {
        console.error('Failed to check auth:', err)
        redirectToLogin()
      }
    }

    checkAuth()
  }, [router, pathname])

  // Periodic auth check (every minute) - skip for create-new-user page
  useEffect(() => {
    if (pathname === '/admin/create-new-user') {
      return
    }

    const interval = setInterval(() => {
      checkUserAuth()
    }, 60000) // 60 seconds = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [pathname])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}

