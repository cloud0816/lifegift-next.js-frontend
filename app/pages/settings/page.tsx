"use client"

import { useMockUser } from "@/app/providers/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Switch } from "@/app/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { RotateCcw, TrendingUp, AlertCircle, DollarSign, Server } from "lucide-react"
import spotConfigData from "@/demo/data/spot-config.json"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ClusterConfig {
  clusterId: number
  clusterName: string
  spotEnabled: boolean
  strategy: string
  maxPrice: number
  interruptionRate: number
  estimatedSavings: number
  spotUsage: number
}

export default function SettingsPage() {
  const mockAuth = useMockUser()
  const router = useRouter()
  const [apiKey, setApiKey] = useState("lg_demo_1234567890abcdef")
  const [copied, setCopied] = useState(false)
  const [spotEnabled, setSpotEnabled] = useState(spotConfigData.enabled)
  const [defaultStrategy, setDefaultStrategy] = useState(spotConfigData.defaultStrategy)
  const [clusterConfigs, setClusterConfigs] = useState<ClusterConfig[]>(spotConfigData.clusterConfigs as ClusterConfig[])

  useEffect(() => {
    if (!mockAuth.isLoading && !mockAuth.user) {
      router.push("/pages/signin")
    }
  }, [mockAuth.user, mockAuth.isLoading, router])

  const handleClusterToggle = (clusterId: number, enabled: boolean) => {
    setClusterConfigs(prev =>
      prev.map(config =>
        config.clusterId === clusterId
          ? { ...config, spotEnabled: enabled }
          : config
      )
    )
  }

  const handleClusterStrategyChange = (clusterId: number, strategy: string) => {
    setClusterConfigs(prev =>
      prev.map(config =>
        config.clusterId === clusterId
          ? { ...config, strategy }
          : config
      )
    )
  }

  const handleMaxPriceChange = (clusterId: number, maxPrice: number) => {
    setClusterConfigs(prev =>
      prev.map(config =>
        config.clusterId === clusterId
          ? { ...config, maxPrice }
          : config
      )
    )
  }

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

  const totalSavings = clusterConfigs.reduce((sum, config) => sum + (config.spotEnabled ? config.estimatedSavings : 0), 0)
  const activeClusters = clusterConfigs.filter(config => config.spotEnabled).length

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="spot-config">Spot Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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
                    value={apiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Generate a new API key (in real implementation, this would call the backend)
                      const newKey = `lg_demo_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
                      setApiKey(newKey)
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
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
        </TabsContent>

        <TabsContent value="spot-config" className="space-y-6">
          {/* Statistics Overview */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSavings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clusters</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeClusters}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  With spot instances
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Availability</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{spotConfigData.statistics.availability}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uptime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interruptions</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{spotConfigData.statistics.totalInterruptions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Global Spot Instance Settings</CardTitle>
              <CardDescription>
                Configure default spot instance behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="spot-enabled">Enable Spot Instances</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow clusters to use spot instances for cost optimization
                  </p>
                </div>
                <Switch
                  id="spot-enabled"
                  checked={spotEnabled}
                  onCheckedChange={setSpotEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-strategy">Default Strategy</Label>
                <Select value={defaultStrategy} onValueChange={setDefaultStrategy}>
                  <SelectTrigger id="default-strategy">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {spotConfigData.strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name} - {strategy.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This strategy will be applied to new clusters by default
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cluster Configurations */}
          <Card>
            <CardHeader>
              <CardTitle>Cluster Configurations</CardTitle>
              <CardDescription>
                Configure spot instance settings per cluster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Max Price ($)</TableHead>
                      <TableHead>Interruption Rate (%)</TableHead>
                      <TableHead>Spot Usage (%)</TableHead>
                      <TableHead className="text-right">Estimated Savings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusterConfigs.map((config) => (
                      <TableRow key={config.clusterId}>
                        <TableCell className="font-medium">{config.clusterName}</TableCell>
                        <TableCell>
                          <Switch
                            checked={config.spotEnabled}
                            onCheckedChange={(checked) => handleClusterToggle(config.clusterId, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={config.strategy}
                            onValueChange={(value) => handleClusterStrategyChange(config.clusterId, value)}
                            disabled={!config.spotEnabled}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {spotConfigData.strategies.map((strategy) => (
                                <SelectItem key={strategy.id} value={strategy.id}>
                                  {strategy.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={config.maxPrice}
                            onChange={(e) => handleMaxPriceChange(config.clusterId, parseFloat(e.target.value) || 0)}
                            disabled={!config.spotEnabled}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.interruptionRate < 5 ? "default" : config.interruptionRate < 10 ? "secondary" : "destructive"}>
                            {config.interruptionRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {config.spotUsage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${config.estimatedSavings.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pricing History Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spot Pricing History</CardTitle>
              <CardDescription>
                7-day average spot pricing and availability trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spotConfigData.pricingHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number | undefined, name: string | undefined) => {
                      if (value === undefined) return ''
                      if (name === 'averagePrice') return `$${value.toFixed(2)}`
                      return `${value}%`
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="averagePrice" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Avg Price ($)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="availability" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Availability (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
