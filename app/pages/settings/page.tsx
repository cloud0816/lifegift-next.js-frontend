"use client"

import { useMockUser } from "@/app/providers/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

export default function SettingsPage() {
  const mockAuth = useMockUser()
  const router = useRouter()

  useEffect(() => {
    if (!mockAuth.isLoading && !mockAuth.user) {
      router.push("/pages/signin")
    }
  }, [mockAuth.user, mockAuth.isLoading, router])

  if (mockAuth.isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!mockAuth.user) {
    return null
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>
              Use this API key when connecting clusters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="api-key">Your API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  value="lg_demo_1234567890abcdef"
                  readOnly
                  className="font-mono"
                />
                <Button variant="outline">Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this key secure. Regenerate if compromised.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={mockAuth.user?.email || ""}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={mockAuth.user?.name || ""}
                readOnly
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

