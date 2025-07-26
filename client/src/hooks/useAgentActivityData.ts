import { useQuery } from '@tanstack/react-query';

interface CoordinationMetrics {
  agentCoordination: {
    totalAgents: number;
    availableAgents: number;
    activeAgents: number;
    averageLoad: number;
    averageSuccessRate: number;
  };
  deploymentMetrics: {
    activeDeployments: number;
    totalDeployments: number;
    completionRate: number;
  };
  knowledgeSharing: {
    totalInsights: number;
    totalStrategies: number;
    avgEffectiveness: number;
    knowledgeConnections: number;
  };
  systemHealth: {
    orchestratorStatus: string;
    taskDistributorStatus: string;
    knowledgeSharingStatus: string;
    lastHealthCheck: string;
  };
}

interface ActivityData {
  coordinationMetrics: CoordinationMetrics;
  activeDeployments: any[];
  timestamp: string;
}

/**
 * Hook for Agent Activity Dashboard to fetch coordination metrics
 */
export function useAgentActivityData() {
  const {
    data: coordinationData,
    isLoading: coordinationLoading,
    error: coordinationError,
    refetch: refetchCoordination
  } = useQuery<{ metrics: CoordinationMetrics; timestamp: string }>({
    queryKey: ['/api/autonomous-orchestrator/coordination-metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000, // Data is stale after 20 seconds
  });

  const {
    data: deploymentsData,
    isLoading: deploymentsLoading,
    error: deploymentsError,
    refetch: refetchDeployments
  } = useQuery<{ activeDeployments: any[]; count: number; timestamp: string }>({
    queryKey: ['/api/autonomous-orchestrator/active-deployments'],
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000, // Data is stale after 10 seconds
  });

  // Combined activity data
  const activityData: ActivityData | undefined = coordinationData && deploymentsData ? {
    coordinationMetrics: coordinationData.metrics,
    activeDeployments: deploymentsData.activeDeployments || [],
    timestamp: coordinationData.timestamp
  } : undefined;

  const isLoading = coordinationLoading || deploymentsLoading;
  const error = coordinationError || deploymentsError;

  // Manual refresh function for all data
  const refreshAll = () => {
    refetchCoordination();
    refetchDeployments();
  };

  return {
    activityData,
    isLoading,
    error,
    refreshAll,
    coordinationMetrics: coordinationData?.metrics,
    activeDeployments: deploymentsData?.activeDeployments || [],
    lastUpdated: coordinationData?.timestamp
  };
}

/**
 * Hook for getting specific deployment status
 */
export function useDeploymentStatus(deploymentId: string | null) {
  return useQuery<{ deployment: any; timestamp: string }>({
    queryKey: ['/api/autonomous-orchestrator/deployment-status', deploymentId],
    enabled: !!deploymentId,
    refetchInterval: 10000, // Refresh every 10 seconds when active
    staleTime: 5000, // Data is stale after 5 seconds
  });
}