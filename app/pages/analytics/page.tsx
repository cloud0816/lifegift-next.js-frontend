"use client"

import { useMockUser } from "@/app/providers/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import analyticsData from "@/demo/data/analytics.json"

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#ff8042']

export default function AnalyticsPage() {
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Advanced analytics and insights for cost optimization
        </p>
      </div>

      <Tabs defaultValue="cost-trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cost-trends">Cost Trends</TabsTrigger>
          <TabsTrigger value="waste-analysis">Waste Analysis</TabsTrigger>
          <TabsTrigger value="resource-utilization">Resource Utilization</TabsTrigger>
          <TabsTrigger value="cost-breakdown">Cost Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="cost-trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost & Waste Trends</CardTitle>
              <CardDescription>
                6-month historical view of total cost, waste, and savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.costTrends}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff7300" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="totalCost" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorCost)"
                    name="Total Cost"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="waste" 
                    stroke="#ff7300" 
                    fillOpacity={1} 
                    fill="url(#colorWaste)"
                    name="Waste"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#82ca9d" 
                    fillOpacity={1} 
                    fill="url(#colorSavings)"
                    name="Savings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Cost Overview</CardTitle>
              <CardDescription>
                Weekly view of daily costs and waste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.dailyCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="cost" fill="#8884d8" name="Total Cost" />
                  <Bar dataKey="waste" fill="#ff7300" name="Waste" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waste-analysis" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Waste by Cluster</CardTitle>
                <CardDescription>
                  Distribution of waste across clusters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analyticsData.wasteByCluster} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="cluster" type="category" width={120} />
                    <Tooltip 
                      formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Bar dataKey="waste" fill="#ff7300" name="Waste" />
                    <Bar dataKey="cost" fill="#8884d8" name="Total Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waste by Type</CardTitle>
                <CardDescription>
                  Breakdown of waste by inefficiency type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart className="pie-chart">
                    <Pie
                      data={analyticsData.wasteByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.type}: $${entry.waste.toLocaleString()}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="waste"
                    >
                      {analyticsData.wasteByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Waste by Type - Bar Chart</CardTitle>
              <CardDescription>
                Detailed view of waste amounts by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.wasteByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="waste" fill="#ff7300" name="Waste ($)" />
                  <Bar dataKey="count" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resource-utilization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization by Namespace</CardTitle>
              <CardDescription>
                CPU and Memory utilization across namespaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.resourceUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="namespace" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="cpu" fill="#8884d8" name="CPU (%)" />
                  <Bar dataKey="memory" fill="#82ca9d" name="Memory (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost vs Utilization</CardTitle>
              <CardDescription>
                Relationship between cost and resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analyticsData.resourceUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="namespace" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number | undefined, name: string | undefined) => {
                      if (value === undefined) return ''
                      if (name === 'cost') return `$${value.toLocaleString()}`
                      return `${value}%`
                    }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#8884d8" 
                    name="CPU (%)"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#82ca9d" 
                    name="Memory (%)"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#ff7300" 
                    name="Cost ($)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Category</CardTitle>
              <CardDescription>
                Distribution of costs across different resource categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart className="pie-chart">
                  <Pie
                    data={analyticsData.costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.category}: ${entry.percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="cost"
                  >
                    {analyticsData.costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost by Category - Bar Chart</CardTitle>
              <CardDescription>
                Detailed cost breakdown comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.costBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="cost" fill="#8884d8" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
