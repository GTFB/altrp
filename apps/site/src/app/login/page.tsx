"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data: { 
        error?: string
        success?: boolean
        user?: {
          roles?: Array<{
            dataIn?: string | null
            [key: string]: any
          }>
        }
      } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Check if user has Administrator role
      const hasAdministratorRole = data.user?.roles?.some(
        (role) => role.name === 'Administrator' || role.raid === 'Administrator'
      )

      // Check if user has any role with auth_redirect_url
      let redirectUrl = '/admin' // Default for admin
      
      if (data.user?.roles) {
        let foundRedirect = false
        
        for (const role of data.user.roles) {
          if (role.dataIn) {
            try {
              const dataIn = typeof role.dataIn === 'string' 
                ? JSON.parse(role.dataIn) 
                : role.dataIn
              
              if (dataIn?.auth_redirect_url && typeof dataIn.auth_redirect_url === 'string') {
                redirectUrl = dataIn.auth_redirect_url
                foundRedirect = true
                break // Use first match
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }

        // If no custom redirect and user doesn't have Administrator role, redirect to home
        if (!foundRedirect && !hasAdministratorRole) {
          redirectUrl = '/'
        }
      } else if (!hasAdministratorRole) {
        // No roles and no Administrator, redirect to home
        redirectUrl = '/'
      }

      // Redirect to determined URL
      router.push(redirectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <LogIn className="h-6 w-6" />
            <CardTitle className="text-2xl">Login</CardTitle>
          </div>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


