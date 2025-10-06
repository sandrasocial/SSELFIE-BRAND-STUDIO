export interface DashboardMetrics {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export interface TableData {
  headers: string[];
  rows: Array<Record<string, string | number | boolean>>;
}

export interface CustomContent {
  component: string;
  props: Record<string, unknown>;
}

export type DashboardContent =
  | { type: 'chart'; data: ChartData }
  | { type: 'metrics'; data: DashboardMetrics[] }
  | { type: 'table'; data: TableData }
  | { type: 'custom'; data: CustomContent };

export interface DashboardSection {
  title: string;
  content: DashboardContent;
  config?: {
    refreshInterval?: number;
    displayOptions?: {
      layout?: 'grid' | 'list';
      showHeader?: boolean;
      maxItems?: number;
    };
  };
}

export interface DashboardFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  status?: 'active' | 'inactive' | 'all';
}

export interface DashboardPermissions {
  canView: boolean;
  canEdit: boolean;
  canExport: boolean;
  role: 'admin' | 'editor' | 'viewer';
}