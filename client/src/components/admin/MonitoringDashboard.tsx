import React from 'react';
import { Card, Grid } from '@mui/material';
import { SystemStats } from './monitoring/SystemStats';
import { AgentPerformance } from './monitoring/AgentPerformance';
import { ResourceUsage } from './monitoring/ResourceUsage';
import { AlertsPanel } from './monitoring/AlertsPanel';

export const MonitoringDashboard: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <h2>System Performance Dashboard</h2>
        </Card>
      </Grid>
      
      {/* Real-time System Stats */}
      <Grid item xs={12} md={6}>
        <SystemStats />
      </Grid>

      {/* AI Agent Performance Metrics */}
      <Grid item xs={12} md={6}>
        <AgentPerformance />
      </Grid>

      {/* Resource Usage Graphs */}
      <Grid item xs={12} md={8}>
        <ResourceUsage />
      </Grid>

      {/* Alerts and Notifications */}
      <Grid item xs={12} md={4}>
        <AlertsPanel />
      </Grid>
    </Grid>
  );
};