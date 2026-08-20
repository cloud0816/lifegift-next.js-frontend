"use client"

import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Server, Leaf, BarChart3 } from "lucide-react"
import Link from "next/link"
import { metricsApi, MetricsSummary } from "@/lib/api-client"
import { useAnimatedNumber } from "@/app/hooks/use-animated-number"

export default function DashboardPage() {
  const auth = useAuth()
  const router = useRouter()
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const user = auth.user
  const isLoading = auth.isLoading

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/pages/signin")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadMetrics()
    }
  }, [user])

  const loadMetrics = async () => {
    try {
      setIsLoadingMetrics(true)
      setError(null)
      const data = await metricsApi.getMetricsSummary()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load metrics'))
      console.error('Failed to load metrics:', err)
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  // Calculate derived metrics
  const totalCost = metrics ? metrics.monthly_savings.amount * 10 : 0 // Estimate total cost (10x savings for demo)
  const totalWaste = metrics ? totalCost * 0.3 : 0 // Estimate 30% waste
  const wastePercentage = totalCost > 0 ? (totalWaste / totalCost) * 100 : 0

  // Animated numbers
  const animatedTotalCost = useAnimatedNumber(totalCost, {
    duration: 1500,
    decimals: 2,
    formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })
  const animatedTotalWaste = useAnimatedNumber(totalWaste, {
    duration: 1500,
    decimals: 2,
    formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })
  const animatedWastePercentage = useAnimatedNumber(wastePercentage, {
    duration: 1500,
    decimals: 1,
    formatter: (value) => `${value.toFixed(1)}%`,
  })
  const animatedClusters = useAnimatedNumber(metrics?.total_clusters || 0, {
    duration: 1000,
    decimals: 0,
  })
  const animatedSavings = useAnimatedNumber(metrics?.monthly_savings.amount || 0, {
    duration: 1500,
    decimals: 2,
    formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })

  if (isLoading || isLoadingMetrics) {
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

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Metrics</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadMetrics}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!metrics) {
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

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-5 mb-6 md:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animatedTotalCost}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly overview
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
            <p className="text-xs text-muted-foreground mt-1">
              Potential savings
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{animatedSavings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.monthly_savings.currency}
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
                <BarChart3 className="mr-2 h-4 w-4" />
                View Waste Report
              </Button>
            </Link>
            <Link href="/pages/clusters">
              <Button variant="outline" className="w-full justify-start mt-2">
                <Server className="mr-2 h-4 w-4" />
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Total Clusters</p>
                    <p className="text-xs text-muted-foreground/60">{metrics.total_clusters} active</p>
                  </div>
                  <Badge variant="secondary">{metrics.total_clusters}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Optimized Workloads</p>
                    <p className="text-xs text-muted-foreground/60">{metrics.total_optimized_workloads} total</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Recommendations</p>
                    <p className="text-xs text-muted-foreground/60">
                      {metrics.recommendations.pending} pending, {metrics.recommendations.applied} applied
                    </p>
                  </div>
                  <Badge variant="outline">
                    {metrics.recommendations.applied} applied
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
