"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import { useMockUser } from "@/app/providers/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Server } from "lucide-react"
import Link from "next/link"
import dashboardData from "@/demo/data/dashboard.json"
import { useAnimatedNumber } from "@/app/hooks/use-animated-number"

const mockMetrics = dashboardData

export default function DashboardPage() {
  const useAuth0 = false
  const auth0User = useAuth0 ? useUser() : { user: undefined, isLoading: false }
  const mockAuth = !useAuth0 ? useMockUser() : { user: undefined, isLoading: false, logout: () => {} }
  
  const user = useAuth0 ? auth0User.user : mockAuth.user
  const isLoading = useAuth0 ? auth0User.isLoading : mockAuth.isLoading
  const router = useRouter()

  // Animated numbers
  const animatedTotalCost = useAnimatedNumber(mockMetrics.totalCost, {
    duration: 1500,
    decimals: 2,
    formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })
  const animatedTotalWaste = useAnimatedNumber(mockMetrics.totalWaste, {
    duration: 1500,
    decimals: 2,
    formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })
  const animatedWastePercentage = useAnimatedNumber(mockMetrics.wastePercentage, {
    duration: 1500,
    decimals: 1,
    formatter: (value) => `${value.toFixed(1)}%`,
  })
  const animatedClusters = useAnimatedNumber(mockMetrics.clusters, {
    duration: 1000,
    decimals: 0,
  })
  const animatedCostChange = useAnimatedNumber(Math.abs(mockMetrics.costChange), {
    duration: 1500,
    decimals: 1,
    formatter: (value) => `${value.toFixed(1)}%`,
  })
  const animatedWasteChange = useAnimatedNumber(Math.abs(mockMetrics.wasteChange), {
    duration: 1500,
    decimals: 1,
    formatter: (value) => `${value.toFixed(1)}%`,
  })

  useEffect(() => {
    if (useAuth0 && !isLoading && !user) {
      router.push("/api/auth/login")
    } else if (!useAuth0 && !isLoading && !user) {
      router.push("/pages/signin")
    }
  }, [user, isLoading, router, useAuth0])

  if (isLoading) {
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

  if (!user) {
    return null
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Overview</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Monitor your Kubernetes cluster costs and waste
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animatedTotalCost}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{animatedCostChange}</span>
              <span className="ml-1">vs last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animatedTotalWaste}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{animatedWasteChange}</span>
              <span className="ml-1">vs last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animatedWastePercentage}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of total cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clusters</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animatedClusters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              connected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/pages/waste-report">
              <Button variant="outline" className="w-full justify-start">
                View Waste Report
              </Button>
            </Link>
            <Link href="/pages/clusters">
              <Button variant="outline" className="w-full justify-start mt-2">
                Manage Clusters
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Cluster connected</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Waste report generated</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Cost optimization applied</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
                <Badge variant="outline">Optimized</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
