export interface DashboardMetrics {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export interface DashboardSection {
  title: string;
  type: 'chart' | 'metrics' | 'table' | 'custom';
  content: any; // Type will be refined based on section type
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