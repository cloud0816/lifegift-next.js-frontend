"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import { useMockUser } from "@/app/providers/mock-auth-provider"
import { isAuth0Configured } from "@/lib/auth-config"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"

export default function SignOutPage() {
  // For UI development, use mock mode. Set to true when Auth0 is configured
  const useAuth0 = false
  const auth0User = useAuth0 ? useUser() : { user: undefined, isLoading: false }
  const mockAuth = !useAuth0 ? useMockUser() : { user: undefined, isLoading: false, logout: () => {}, login: () => {} }
  
  const user = useAuth0 ? auth0User.user : mockAuth.user
  const isLoading = useAuth0 ? auth0User.isLoading : mockAuth.isLoading
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/pages/signin")
    }
  }, [user, isLoading, router])

  const handleSignOut = () => {
    if (useAuth0) {
      // Auth0 will handle logout via the link
      return
    } else {
      // Mock mode: manually logout and redirect
      mockAuth.logout()
      router.push("/pages/signin")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Sign Out</CardTitle>
            <CardDescription>
              Are you sure you want to sign out?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Signed in as <span className="font-medium">{user.email}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/pages/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              {useAuth0 ? (
                <Link href="/api/auth/logout" className="flex-1">
                  <Button className="w-full">
                    Sign Out
                  </Button>
                </Link>
              ) : (
                <Button className="w-full flex-1" onClick={handleSignOut}>
                  Sign Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

