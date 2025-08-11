import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AgentMetrics, SystemMetrics } from '@/types/monitoring';
import { apiRequest } from '@/lib/queryClient';

export function useGrafanaData<T extends 'agent-metrics' | 'system-metrics'>(metric: T): UseQueryResult<T extends 'agent-metrics' ? AgentMetrics : SystemMetrics> {
  return useQuery<T extends 'agent-metrics' ? AgentMetrics : SystemMetrics>({
    queryKey: ['grafana', metric],
    queryFn: () => apiRequest(`/api/admin/metrics/${metric}`),
  });
}