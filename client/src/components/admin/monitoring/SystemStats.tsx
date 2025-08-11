import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useGrafanaData } from '../../../hooks/useGrafanaData';

export const SystemStats: React.FC = () => {
  const { data, loading, error } = useGrafanaData('system-metrics');

  if (loading) return <div>Loading system stats...</div>;
  if (error) return <div>Error loading system stats</div>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          System Statistics
        </Typography>
        <Box>
          <Typography>CPU Usage: {data?.cpuUsage}%</Typography>
          <Typography>Memory Usage: {data?.memoryUsage}%</Typography>
          <Typography>Active Users: {data?.activeUsers}</Typography>
          <Typography>Response Time: {data?.responseTime}ms</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};