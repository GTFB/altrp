"use client"
import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Container } from '@/components/misc/layout/Container';
export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      // If user is already logged in, redirect to admin panel
      router.push('/admin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <Container className="py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </Container>
    )
  }

  if (status === 'authenticated' && session?.user) {
    return (
      <Container className="py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Welcome back!</h1>
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-muted-foreground mb-2">
                You are signed in as:
              </h1>
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/admin')}>
                Go to Admin Panel
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
        <div className="space-y-4">
          <h1 className="text-center text-muted-foreground">
            Sign in with your GitHub account to access the admin panel
          </h1>  
          <div className="flex justify-center">
            <Button className="w-full" onClick={() => signIn('github')}>
              Sign in with GitHub
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
