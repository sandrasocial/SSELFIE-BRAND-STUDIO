import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useGrafanaData } from '@/hooks/useGrafanaData';
import type { AgentMetrics } from '@/types/monitoring';

export const AgentPerformance: React.FC = () => {
  const { data, isLoading: loading, isError: error } = useGrafanaData('agent-metrics');

  if (loading) return <div>Loading agent performance...</div>;
  if (error) return <div>Error loading agent performance</div>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Agent Performance
        </Typography>
        <Box>
          <Typography>Active Agents: {data?.activeAgents}</Typography>
          <Typography>Average Response Time: {data?.avgResponseTime}ms</Typography>
          <Typography>Success Rate: {data?.successRate}%</Typography>
          <Typography>Memory Usage: {data?.memoryUsage}MB</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};