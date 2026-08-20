"use client"

import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Check, X, Loader2, AlertCircle, DollarSign, Cpu } from "lucide-react"
import { recommendationsApi, Recommendation } from "@/lib/api-client"
import { clustersApi, Cluster } from "@/lib/api-client"

export default function RecommendationsPage() {
  const auth = useAuth()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isApplying, setIsApplying] = useState(false)
  
  // Filters
  const [selectedCluster, setSelectedCluster] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedNamespace, setSelectedNamespace] = useState("")

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push("/pages/signin")
    }
  }, [auth.user, auth.isLoading, router])

  useEffect(() => {
    if (auth.user) {
      loadData()
    }
  }, [auth.user])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load clusters
      const clustersData = await clustersApi.listClusters()
      setClusters(clustersData.clusters)
      
      // Load recommendations
      await loadRecommendations()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'))
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const params: any = { limit: 100 }
      if (selectedCluster !== "all") params.cluster_id = selectedCluster
      if (selectedStatus !== "all") params.status = selectedStatus
      if (selectedNamespace) params.namespace = selectedNamespace
      
      const data = await recommendationsApi.listRecommendations(params)
      setRecommendations(data.recommendations)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load recommendations'))
      console.error('Failed to load recommendations:', err)
    }
  }

  useEffect(() => {
    if (auth.user) {
      loadRecommendations()
    }
  }, [selectedCluster, selectedStatus, selectedNamespace, auth.user])

  const handleSelectAll = () => {
    const pendingRecs = recommendations.filter(r => r.status === 'pending')
    if (selectedIds.size === pendingRecs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(pendingRecs.map(r => r.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkApply = async () => {
    if (selectedIds.size === 0) return

    try {
      setIsApplying(true)
      await recommendationsApi.bulkApply({
        recommendation_ids: Array.from(selectedIds),
      })
      setSelectedIds(new Set())
      await loadRecommendations()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to apply recommendations'))
      console.error('Failed to apply recommendations:', err)
    } finally {
      setIsApplying(false)
    }
  }

  const getStatusBadge = (status: Recommendation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'approved':
        return <Badge variant="secondary">Approved</Badge>
      case 'applying':
        return <Badge variant="default">Applying</Badge>
      case 'applied':
        return <Badge variant="default" className="bg-green-500">Applied</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingRecommendations = recommendations.filter(r => r.status === 'pending')
  const totalSavings = recommendations.reduce((sum, r) => sum + r.savings_monthly_usd, 0)
  const selectedSavings = recommendations
    .filter(r => selectedIds.has(r.id))
    .reduce((sum, r) => sum + r.savings_monthly_usd, 0)

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

  if (error && recommendations.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Recommendations</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadData}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Recommendations</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          CPU rightsizing recommendations for your workloads
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRecommendations.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold text-green-600">
                  {recommendations.filter(r => r.status === 'applied').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-green-500">
                  ${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Select recommendations to apply in bulk
              </CardDescription>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} selected ({selectedSavings.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}/mo savings)
                </span>
                <Button onClick={handleBulkApply} disabled={isApplying}>
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Apply Selected
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cluster</Label>
                <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clusters</SelectItem>
                    {clusters.map((cluster) => (
                      <SelectItem key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="applying">Applying</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Namespace</Label>
                <Input
                  placeholder="Filter by namespace"
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={pendingRecommendations.length > 0 && selectedIds.size === pendingRecommendations.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Current CPU</TableHead>
                  <TableHead>Recommended CPU</TableHead>
                  <TableHead>Waste %</TableHead>
                  <TableHead className="text-right">Monthly Savings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No recommendations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recommendations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>
                        {rec.status === 'pending' && (
                          <Checkbox
                            checked={selectedIds.has(rec.id)}
                            onCheckedChange={() => handleSelectOne(rec.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{rec.cluster_id}</TableCell>
                      <TableCell>{rec.namespace}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rec.resource_name}</div>
                          <div className="text-xs text-muted-foreground">{rec.resource_kind}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          {rec.current_cpu}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <Cpu className="h-3 w-3" />
                          {rec.recommended_cpu}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={rec.waste_percentage > 50 ? "text-red-600" : ""}>
                          {rec.waste_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 text-green-600">
                          <DollarSign className="h-3 w-3" />
                          {rec.savings_monthly_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(rec.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

