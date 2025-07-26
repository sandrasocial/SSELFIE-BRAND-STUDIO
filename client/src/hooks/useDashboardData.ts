import { useState, useEffect } from 'react';
import { DashboardMetrics, DashboardSection } from '../../shared/types/dashboard';

interface DashboardData {
  metrics: DashboardMetrics[];
  sections: DashboardSection[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (): DashboardData => {
  const [metrics, setMetrics] = useState<DashboardMetrics[]>([]);
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulated API calls - replace with actual endpoints
        const metricsResponse = await fetch('/api/dashboard/metrics');
        const sectionsResponse = await fetch('/api/dashboard/sections');

        if (!metricsResponse.ok || !sectionsResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const metricsData = await metricsResponse.json();
        const sectionsData = await sectionsResponse.json();

        setMetrics(metricsData);
        setSections(sectionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    metrics,
    sections,
    loading,
    error
  };
};

// Mock data for development
export const mockDashboardData = {
  metrics: [
    { label: 'Total Revenue', value: '$1.2M' },
    { label: 'Active Users', value: '8,547' },
    { label: 'Conversion Rate', value: '3.2%' }
  ],
  sections: [
    {
      title: 'Revenue Analysis',
      type: 'chart',
      content: 'Revenue chart component will render here'
    },
    {
      title: 'User Engagement',
      type: 'metrics',
      content: 'Engagement metrics will render here'
    }
  ]
};