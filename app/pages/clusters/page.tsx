"use client"

import { useMockUser } from "@/app/providers/mock-auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Copy, Check, AlertCircle, Server, Loader2 } from "lucide-react"
import clustersData from "@/demo/data/clusters.json"

const helmCommand = `helm repo add lifegift https://charts.lifegift.io
helm repo update
helm install lifegift-agent lifegift/lifegift-agent \\
  --set apiKey=YOUR_API_KEY \\
  --set clusterName=YOUR_CLUSTER_NAME \\
  --namespace lifegift \\
  --create-namespace`

const mockClusters = clustersData

export default function ClustersPage() {
  const mockAuth = useMockUser()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "listening" | "connected">("idle")

  useEffect(() => {
    if (!mockAuth.isLoading && !mockAuth.user) {
      router.push("/pages/signin")
    }
  }, [mockAuth.user, mockAuth.isLoading, router])

  // Auto-poll for cluster connections
  useEffect(() => {
    // Start listening automatically when component mounts
    setConnectionStatus("listening")
    
    // Poll for connection status every 2 seconds
    const pollInterval = setInterval(() => {
      // Simulate checking backend for connection
      // In real implementation, this would be an API call
      const shouldConnect = Math.random() > 0.7 // 30% chance to simulate connection
      
      if (shouldConnect && connectionStatus === "listening") {
        setConnectionStatus("connected")
        setTimeout(() => {
          setConnectionStatus("idle")
        }, 2000)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [connectionStatus])

  const handleCopy = () => {
    navigator.clipboard.writeText(helmCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Clusters</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Connect and manage your Kubernetes clusters
        </p>
      </div>

      <Tabs defaultValue="connect" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connect">Connect Cluster</TabsTrigger>
          <TabsTrigger value="list">Connected Clusters</TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Install LifeGift Agent</CardTitle>
              <CardDescription>
                Run this Helm command in your Kubernetes cluster to connect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="p-3 md:p-4 bg-muted rounded-lg text-xs md:text-sm overflow-x-auto">
                  <code>{helmCommand}</code>
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {connectionStatus === "listening" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Auto-detecting cluster connection...
                  </p>
                </div>
              )}
              {connectionStatus === "connected" && (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-500 font-medium">
                    Cluster connected successfully!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Copy the Helm install command above</li>
                <li>Replace <code className="bg-muted px-1 rounded">YOUR_API_KEY</code> with your API key (found in Settings)</li>
                <li>Replace <code className="bg-muted px-1 rounded">YOUR_CLUSTER_NAME</code> with a descriptive name</li>
                <li>Run the command in your cluster with kubectl access</li>
                <li>The system will automatically detect when your cluster connects</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Clusters</CardTitle>
              <CardDescription>
                Manage your connected Kubernetes clusters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Cluster Name</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[80px]">Nodes</TableHead>
                      <TableHead className="min-w-[120px]">Last Seen</TableHead>
                      <TableHead className="text-right min-w-[120px]">Total Cost</TableHead>
                      <TableHead className="text-right min-w-[100px]">Waste</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockClusters.map((cluster) => (
                      <TableRow key={cluster.id}>
                        <TableCell className="font-medium">{cluster.name}</TableCell>
                        <TableCell>
                          {cluster.status === "connected" ? (
                            <Badge variant="default" className="bg-green-500">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{cluster.nodes}</TableCell>
                        <TableCell>{cluster.lastSeen}</TableCell>
                        <TableCell className="text-right">
                          ${cluster.totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          ${cluster.waste.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

