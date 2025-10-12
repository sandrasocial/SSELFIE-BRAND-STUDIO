import { useState, useEffect } from 'react';
import axios from 'axios';

// Define proper types for the hook
interface GrafanaDataState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Type guard to validate metric type parameter
function isValidMetricType(metricType: string): boolean {
  return typeof metricType === 'string' && metricType.trim().length > 0;
}

export const useGrafanaData = <T = unknown>(metricType: string): GrafanaDataState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Type guard for metric type validation
    if (!isValidMetricType(metricType)) {
      const validationError = new Error('Invalid metric type provided');
      setError(validationError);
      setLoading(false);
      return;
    }

    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get<T>(`/api/admin/metrics/${metricType}`);
        
        // Null safety check for response data
        if (response.data !== null && response.data !== undefined) {
          setData(response.data);
        } else {
          console.warn(`⚠️ Received null/undefined data for metric: ${metricType}`);
          setData(null);
        }
      } catch (err) {
        // Proper error handling with type safety
        const errorInstance = err instanceof Error ? err : new Error('Unknown error occurred');
        console.error(`❌ Error fetching Grafana data for ${metricType}:`, errorInstance);
        setError(errorInstance);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time updates with cleanup
    const interval = setInterval(() => {
      // Only fetch if metric type is still valid
      if (isValidMetricType(metricType)) {
        fetchData();
      }
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [metricType]);

  return { data, loading, error };
};