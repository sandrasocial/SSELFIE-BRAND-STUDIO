import { debounce } from 'lodash';

export interface ViewportData {
  width: number;
  height: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface InteractionMetrics {
  targetElement: string;
  viewportSize: ViewportData;
  successRate: number;
  timestamp: number;
}

// Breakpoint definitions with editorial luxury precision
const breakpoints = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};

class ResponsiveAnalytics {
  private static instance: ResponsiveAnalytics;
  private interactionData: InteractionMetrics[] = [];
  
  private constructor() {
    this.initializeTracking();
  }

  public static getInstance(): ResponsiveAnalytics {
    if (!ResponsiveAnalytics.instance) {
      ResponsiveAnalytics.instance = new ResponsiveAnalytics();
    }
    return ResponsiveAnalytics.instance;
  }

  private initializeTracking(): void {
    // Initialize viewport tracking
    window.addEventListener('resize', debounce(this.trackViewport.bind(this), 250));
    this.trackViewport();

    // Initialize interaction tracking
    document.addEventListener('click', this.trackInteraction.bind(this));
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < breakpoints.sm) return 'mobile';
    if (width < breakpoints.lg) return 'tablet';
    return 'desktop';
  }

  private getBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
    const width = window.innerWidth;
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    return 'xl';
  }

  private trackViewport(): void {
    const viewportData: ViewportData = {
      width: window.innerWidth,
      height: window.innerHeight,
      deviceType: this.getDeviceType(),
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      breakpoint: this.getBreakpoint()
    };

    // Send to analytics endpoint
    this.logAnalytics('viewport_update', viewportData);
  }

  private trackInteraction(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const metrics: InteractionMetrics = {
      targetElement: target.tagName.toLowerCase(),
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
        deviceType: this.getDeviceType(),
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        breakpoint: this.getBreakpoint()
      },
      successRate: 1, // Initialize at 1, will be updated based on success/failure
      timestamp: Date.now()
    };

    this.interactionData.push(metrics);
    this.logAnalytics('interaction', metrics);
  }

  private logAnalytics(event: string, data: any): void {
    // TODO: Replace with actual analytics endpoint
    console.log(`Analytics Event: ${event}`, data);
    
    // Store in database or send to analytics service
    fetch('/api/analytics/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  }

  public generateReport(): any {
    const report = {
      viewportDistribution: this.calculateViewportDistribution(),
      breakpointPerformance: this.calculateBreakpointPerformance(),
      interactionSuccess: this.calculateInteractionSuccess()
    };

    return report;
  }

  private calculateViewportDistribution(): any {
    // Calculate viewport size distribution
    const distribution = this.interactionData.reduce((acc, curr) => {
      const key = curr.viewportSize.deviceType;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return distribution;
  }

  private calculateBreakpointPerformance(): any {
    // Calculate performance metrics per breakpoint
    return this.interactionData.reduce((acc, curr) => {
      const breakpoint = curr.viewportSize.breakpoint;
      if (!acc[breakpoint]) {
        acc[breakpoint] = {
          interactions: 0,
          avgSuccessRate: 0
        };
      }
      acc[breakpoint].interactions++;
      acc[breakpoint].avgSuccessRate += curr.successRate;
      return acc;
    }, {} as Record<string, {interactions: number, avgSuccessRate: number}>);
  }

  private calculateInteractionSuccess(): any {
    // Calculate overall interaction success metrics
    return this.interactionData.reduce((acc, curr) => {
      const element = curr.targetElement;
      if (!acc[element]) {
        acc[element] = {
          total: 0,
          successful: 0
        };
      }
      acc[element].total++;
      acc[element].successful += curr.successRate;
      return acc;
    }, {} as Record<string, {total: number, successful: number}>);
  }
}

export const responsiveAnalytics = ResponsiveAnalytics.getInstance();