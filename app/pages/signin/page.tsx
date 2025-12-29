"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import { useMockUser } from "@/app/providers/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Separator } from "@/app/components/ui/separator"
import { Shield, Lock, TrendingDown } from "lucide-react"

export default function SignInPage() {
  const mockAuth = useMockUser()
  const router = useRouter()
  
  const user = mockAuth.user
  const isLoading = mockAuth.isLoading

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/pages/dashboard")
    }
  }, [user, isLoading, router])

  const handleDemoSignIn = () => {
    // Both Auth0 and Clerk buttons go to demo mode
    mockAuth.login()
    router.push("/pages/dashboard")
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

  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center px-4 pt-6 md:px-6 md:pt-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <TrendingDown className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">Welcome to LifeGift</CardTitle>
          <CardDescription className="text-sm">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-6 md:px-6 md:pb-6">
          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleDemoSignIn}
            >
              <Shield className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Sign In with Auth0</span>
            </Button>
            <Button 
              className="w-full" 
              size="lg" 
              variant="outline"
              onClick={handleDemoSignIn}
            >
              <Lock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Sign In with Clerk</span>
            </Button>
          </div>
          <Separator />
          <p className="text-xs text-center text-muted-foreground px-2">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

