/**
 * API Client for LifeGift Platform
 * Based on OpenAPI 3.0 specification
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lifegift.com';

// Types based on OpenAPI schema
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  oauth_provider: 'google' | 'github';
  plan_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
}

export interface Cluster {
  id: string;
  name: string;
  cloud_provider: 'aws' | 'azure' | 'vmware' | 'gcp';
  region: string;
  k8s_version?: string;
  mode: 'audit' | 'active';
  status: 'pending' | 'active' | 'inactive' | 'error';
  node_count?: number;
  last_heartbeat?: string;
  created_at: string;
}

export interface ClusterDetail extends Cluster {
  optimized_workloads?: number;
  monthly_savings?: {
    amount: number;
    currency: string;
  };
  recommendations?: {
    pending: number;
    applied: number;
    failed: number;
  };
}

export interface Recommendation {
  id: string;
  tenant_id: string;
  cluster_id: string;
  namespace: string;
  resource_kind: 'Deployment' | 'StatefulSet';
  resource_name: string;
  current_cpu: string;
  current_replicas: number;
  recommended_cpu: string;
  waste_cpu_cores: number;
  waste_percentage: number;
  savings_monthly_usd: number;
  status: 'pending' | 'approved' | 'applying' | 'applied' | 'failed';
  created_at: string;
  approved_at?: string | null;
  applied_at?: string | null;
  analysis_window_days: number;
  p95_cpu_usage: string;
  error_message?: string | null;
  failed_attempts: number;
}

export interface MetricsSummary {
  total_clusters: number;
  total_optimized_workloads: number;
  monthly_savings: {
    amount: number;
    currency: string;
  };
  recommendations: {
    pending: number;
    applied: number;
    failed: number;
  };
  last_updated: string;
}

export interface CreateClusterRequest {
  name: string;
  cloud_provider: 'aws' | 'azure' | 'vmware' | 'gcp';
  region: string;
  k8s_version?: string;
  mode?: 'audit' | 'active';
}

export interface CreateClusterResponse {
  cluster: Cluster;
  api_key: string;
  install_command: string;
}

export interface UpdateClusterRequest {
  name?: string;
  mode?: 'audit' | 'active';
}

export interface ListRecommendationsParams {
  cluster_id?: string;
  status?: 'pending' | 'approved' | 'applying' | 'applied' | 'failed';
  namespace?: string;
  limit?: number;
  offset?: number;
}

export interface ListRecommendationsResponse {
  recommendations: Recommendation[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkApplyRequest {
  recommendation_ids: string[];
}

export interface BulkApplyResponse {
  success: boolean;
  message: string;
  approved_count: number;
  recommendations: Recommendation[];
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}

/**
 * Get authentication token from cookies or storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    // Server-side: get from cookies
    return null; // Will be handled by server-side fetch
  }
  
  // Client-side: get from cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'session') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'Unknown Error',
      message: response.statusText,
      timestamp: new Date().toISOString(),
    }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Initiate OAuth login - redirects to provider
   */
  initiateLogin: (provider: 'google' | 'github'): void => {
    if (typeof window !== 'undefined') {
      window.location.href = `${API_BASE_URL}/auth/${provider}/login`;
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/v1/auth/me');
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiRequest('/v1/auth/logout', { method: 'POST' });
    // Clear client-side session
    if (typeof window !== 'undefined') {
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  },
};

/**
 * Clusters API
 */
export const clustersApi = {
  /**
   * List all clusters
   */
  listClusters: async (): Promise<{ clusters: Cluster[]; total: number }> => {
    return apiRequest<{ clusters: Cluster[]; total: number }>('/v1/clusters');
  },

  /**
   * Get cluster details
   */
  getCluster: async (clusterId: string): Promise<ClusterDetail> => {
    return apiRequest<ClusterDetail>(`/v1/clusters/${clusterId}`);
  },

  /**
   * Create new cluster
   */
  createCluster: async (data: CreateClusterRequest): Promise<CreateClusterResponse> => {
    return apiRequest<CreateClusterResponse>('/v1/clusters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update cluster
   */
  updateCluster: async (clusterId: string, data: UpdateClusterRequest): Promise<Cluster> => {
    return apiRequest<Cluster>(`/v1/clusters/${clusterId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete cluster
   */
  deleteCluster: async (clusterId: string): Promise<void> => {
    return apiRequest<void>(`/v1/clusters/${clusterId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Recommendations API
 */
export const recommendationsApi = {
  /**
   * List recommendations
   */
  listRecommendations: async (params?: ListRecommendationsParams): Promise<ListRecommendationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.cluster_id) queryParams.append('cluster_id', params.cluster_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.namespace) queryParams.append('namespace', params.namespace);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return apiRequest<ListRecommendationsResponse>(`/v1/recommendations${query ? `?${query}` : ''}`);
  },

  /**
   * Get recommendation details
   */
  getRecommendation: async (recommendationId: string): Promise<Recommendation> => {
    return apiRequest<Recommendation>(`/v1/recommendations/${recommendationId}`);
  },

  /**
   * Bulk apply recommendations
   */
  bulkApply: async (data: BulkApplyRequest): Promise<BulkApplyResponse> => {
    return apiRequest<BulkApplyResponse>('/v1/recommendations/bulk-apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get cluster recommendations
   */
  getClusterRecommendations: async (
    clusterId: string,
    status?: 'pending' | 'approved' | 'applying' | 'applied' | 'failed'
  ): Promise<{ cluster_id: string; recommendations: Recommendation[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    const query = queryParams.toString();
    return apiRequest<{ cluster_id: string; recommendations: Recommendation[]; total: number }>(
      `/v1/clusters/${clusterId}/recommendations${query ? `?${query}` : ''}`
    );
  },
};

/**
 * Metrics API
 */
export const metricsApi = {
  /**
   * Get metrics summary
   */
  getMetricsSummary: async (): Promise<MetricsSummary> => {
    return apiRequest<MetricsSummary>('/v1/metrics/summary');
  },
};

