import React from 'react';
// import { Card, CardContent, Typography, Box } from '@mui/material';
import { SystemStats } from './monitoring/SystemStats';
import { AgentPerformance } from './monitoring/AgentPerformance';
import { ResourceUsage } from './monitoring/ResourceUsage';
import { AlertsPanel } from './monitoring/AlertsPanel';

export const MonitoringDashboard: React.FC = () => {
  return (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h2">
              System Performance Dashboard
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* Real-time System Stats */}
      <Box>
        <SystemStats />
      </Box>

      {/* AI Agent Performance Metrics */}
      <Box>
        <AgentPerformance />
      </Box>

      {/* Resource Usage Graphs */}
      <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
        <ResourceUsage />
      </Box>

      {/* Alerts and Notifications */}
      <Box>
        <AlertsPanel />
      </Box>
    </Box>
  );
};