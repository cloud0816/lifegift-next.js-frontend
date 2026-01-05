"use client"

import { useMockUser } from "@/app/providers/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { TrendingDown, AlertTriangle, DollarSign } from "lucide-react"
import wasteReportData from "@/demo/data/waste-report.json"
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

const mockWasteData = wasteReportData

export default function WasteReportPage() {
  const mockAuth = useMockUser()
  const router = useRouter()

  // Animated Total Waste
  const animatedTotalWaste = useAnimatedNumber(mockWasteData.totalWaste, {
    duration: 1500,
    decimals: 2,
    formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  })

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
                  {mockWasteData.wastePercentage}% of total cost
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
                      <TableHead className="text-right min-w-[100px]">Waste</TableHead>
                      <TableHead className="min-w-[200px]">Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWasteData.inefficiencies.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.cluster}</TableCell>
                        <TableCell>{item.namespace}</TableCell>
                        <TableCell>{item.resource}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${item.waste.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.recommendation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost & Waste Trends</CardTitle>
              <CardDescription>
                6-month historical view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockWasteData.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff7300" stopOpacity={0}/>
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
                    dataKey="cost" 
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
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trend</CardTitle>
                <CardDescription>
                  Monthly cost overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockWasteData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Cost"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waste Trend</CardTitle>
                <CardDescription>
                  Monthly waste overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockWasteData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : ''}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="waste" fill="#ff7300" name="Waste" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

