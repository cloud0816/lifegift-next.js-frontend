"use client"

import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Button } from "@/app/components/ui/button"
import { TrendingDown, AlertTriangle, DollarSign, Loader2 } from "lucide-react"
import { recommendationsApi, Recommendation } from "@/lib/api-client"
import { useAnimatedNumber } from "@/app/hooks/use-animated-number"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function WasteReportPage() {
  const auth = useAuth()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push("/pages/signin")
    }
  }, [auth.user, auth.isLoading, router])

  useEffect(() => {
    if (auth.user) {
      loadRecommendations()
    }
  }, [auth.user])

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await recommendationsApi.listRecommendations({ limit: 100 })
      setRecommendations(data.recommendations)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load recommendations'))
      console.error('Failed to load recommendations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate total waste from recommendations
  const totalWaste = recommendations.reduce((sum, rec) => sum + rec.savings_monthly_usd, 0)
  const totalCost = totalWaste * 3.33 // Estimate total cost (30% waste)
  const wastePercentage = totalCost > 0 ? (totalWaste / totalCost) * 100 : 0

  // Animated Total Waste
  const animatedTotalWaste = useAnimatedNumber(totalWaste, {
    duration: 1500,
    decimals: 2,
    formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })

  if (auth.isLoading || isLoading) {
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

  if (!auth.user) {
    return null
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Recommendations</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadRecommendations}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Waste Report</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Identify and optimize cloud cost inefficiencies
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Waste</CardTitle>
            <CardDescription>
              Current month waste analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-baseline gap-4">
                <div className="text-4xl font-bold">{animatedTotalWaste}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-sm">
                    {wastePercentage.toFixed(1)}% of total cost
                  </Badge>
                </div>
              </div>
            <p className="text-sm text-muted-foreground mt-4">
              Potential savings if all inefficiencies are addressed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inefficiencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inefficiencies">Inefficiencies</TabsTrigger>
          <TabsTrigger value="trends">Cost Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="inefficiencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Inefficiencies</CardTitle>
              <CardDescription>
                Detailed breakdown of wasted resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Cluster</TableHead>
                      <TableHead className="min-w-[120px]">Namespace</TableHead>
                      <TableHead className="min-w-[150px]">Resource</TableHead>
                      <TableHead className="min-w-[140px]">Type</TableHead>
                      <TableHead className="text-right min-w-[100px]">Monthly Savings</TableHead>
                      <TableHead className="min-w-[200px]">Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No recommendations found. Connect clusters to see waste analysis.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recommendations.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell className="font-medium">{rec.cluster_id}</TableCell>
                          <TableCell>{rec.namespace}</TableCell>
                          <TableCell>{rec.resource_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{rec.resource_kind}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${rec.savings_monthly_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Reduce CPU from {rec.current_cpu} to {rec.recommended_cpu} ({rec.waste_percentage}% waste)
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations Summary</CardTitle>
              <CardDescription>
                Overview of CPU rightsizing recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Recommendations</p>
                  <p className="text-2xl font-bold">{recommendations.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {recommendations.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied</p>
                  <p className="text-2xl font-bold text-green-600">
                    {recommendations.filter(r => r.status === 'applied').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {recommendations.filter(r => r.status === 'failed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

