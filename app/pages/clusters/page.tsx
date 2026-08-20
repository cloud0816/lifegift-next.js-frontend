"use client"

import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Copy, Check, AlertCircle, Server, Loader2, Trash2 } from "lucide-react"
import { clustersApi, Cluster, CreateClusterRequest } from "@/lib/api-client"

export default function ClustersPage() {
  const auth = useAuth()
  const router = useRouter()
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [copied, setCopied] = useState(false)
  const [newClusterApiKey, setNewClusterApiKey] = useState<string | null>(null)
  const [newClusterInstallCommand, setNewClusterInstallCommand] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [clusterName, setClusterName] = useState("")
  const [cloudProvider, setCloudProvider] = useState<"aws" | "azure" | "vmware" | "gcp">("aws")
  const [region, setRegion] = useState("")
  const [k8sVersion, setK8sVersion] = useState("")
  const [mode, setMode] = useState<"audit" | "active">("audit")

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push("/pages/signin")
    }
  }, [auth.user, auth.isLoading, router])

  useEffect(() => {
    if (auth.user) {
      loadClusters()
    }
  }, [auth.user])

  const loadClusters = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await clustersApi.listClusters()
      setClusters(data.clusters)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load clusters'))
      console.error('Failed to load clusters:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clusterName || !region) return

    try {
      setIsCreating(true)
      const request: CreateClusterRequest = {
        name: clusterName,
        cloud_provider: cloudProvider,
        region: region,
        k8s_version: k8sVersion || undefined,
        mode: mode,
      }
      const response = await clustersApi.createCluster(request)
      setNewClusterApiKey(response.api_key)
      setNewClusterInstallCommand(response.install_command)
      await loadClusters()
      // Reset form
      setClusterName("")
      setRegion("")
      setK8sVersion("")
      setMode("audit")
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create cluster'))
      console.error('Failed to create cluster:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCluster = async (clusterId: string) => {
    if (!confirm('Are you sure you want to remove this cluster?')) return
    
    try {
      await clustersApi.deleteCluster(clusterId)
      await loadClusters()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete cluster'))
      console.error('Failed to delete cluster:', err)
    }
  }

  const getInstallCommand = (apiKey: string, clusterName: string) => {
    return `helm repo add opsmax opsmax/opsmax
helm repo update
helm install opsmax opsmax/opsmax \\
  --namespace opsmax-system \\
  --create-namespace \\
  --set apiKey=${apiKey} \\
  --set cluster.name="${clusterName}"`
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  if (error && clusters.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error Loading Clusters</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadClusters}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              <CardTitle>Add New Cluster</CardTitle>
              <CardDescription>
                Register a new Kubernetes cluster to monitor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCluster} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clusterName">Cluster Name *</Label>
                  <Input
                    id="clusterName"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    placeholder="prod-us-east-1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cloudProvider">Cloud Provider *</Label>
                    <Select value={cloudProvider} onValueChange={(v: any) => setCloudProvider(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">AWS</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                        <SelectItem value="gcp">GCP</SelectItem>
                        <SelectItem value="vmware">VMware</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="us-east-1"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="k8sVersion">Kubernetes Version</Label>
                    <Input
                      id="k8sVersion"
                      value={k8sVersion}
                      onChange={(e) => setK8sVersion(e.target.value)}
                      placeholder="1.28"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mode">Mode</Label>
                    <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audit">Audit (Free)</SelectItem>
                        <SelectItem value="active">Active (Paid)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Cluster"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {newClusterApiKey && newClusterInstallCommand && (
            <Card>
              <CardHeader>
                <CardTitle>Install OpsMax Agent</CardTitle>
                <CardDescription>
                  Run this Helm command in your Kubernetes cluster to connect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="p-3 md:p-4 bg-muted rounded-lg text-xs md:text-sm overflow-x-auto">
                    <code>{newClusterInstallCommand}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(newClusterInstallCommand)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Important:</strong> Save your API key now. It will only be shown once.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    API Key: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{newClusterApiKey}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                      <TableHead className="min-w-[120px]">Last Heartbeat</TableHead>
                      <TableHead className="min-w-[100px]">Mode</TableHead>
                      <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No clusters connected. Add a cluster to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      clusters.map((cluster) => (
                        <TableRow key={cluster.id}>
                          <TableCell className="font-medium">{cluster.name}</TableCell>
                          <TableCell>
                            {cluster.status === "active" ? (
                              <Badge variant="default" className="bg-green-500">
                                Active
                              </Badge>
                            ) : cluster.status === "pending" ? (
                              <Badge variant="outline">Pending</Badge>
                            ) : cluster.status === "inactive" ? (
                              <Badge variant="secondary">Inactive</Badge>
                            ) : (
                              <Badge variant="destructive">Error</Badge>
                            )}
                          </TableCell>
                          <TableCell>{cluster.node_count || "-"}</TableCell>
                          <TableCell>
                            {cluster.last_heartbeat
                              ? new Date(cluster.last_heartbeat).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cluster.mode === "active" ? "default" : "outline"}>
                              {cluster.mode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCluster(cluster.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
      </Tabs>
    </div>
  )
}

