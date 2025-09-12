"use client"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            Login page placeholder
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button className="w-full" onClick={() => signIn('google')}>
              Sign in with Google
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => signIn('github')}>
              Sign in with GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
