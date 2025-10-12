import React, { useState, useEffect } from 'react';
import { cn } from "../../lib/utils.js";
import { Typography } from "./typography.js";
import { LuxuryLoading } from "./luxury-loading.js";

interface LuxuryMetrics {
  luxuryPerceptionScore: number; // Target > 7/10
  technicalExcellenceScore: number; // Target > 8/10
  imageGenerationQuality: number; // Target > 8/10
  premiumTierExperienceScore: number; // Target > 8/10
  performanceMetrics: {
    averageLoadTime: number;
    imageGenerationTime: number;
    firstContentfulPaint: number;
    userSatisfactionScore: number;
  };
  qualityBenchmarks: {
    fontHierarchyCompliance: boolean;
    spacingStandardsCompliance: boolean;
    animationQuality: boolean;
    premiumFeelRating: number;
  };
}

interface MetricCardProps {
  title: string;
  value: number;
  target: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  target, 
  unit = '', 
  trend = 'stable',
  className 
}) => {
  const percentage = Math.min((value / target) * 100, 100);
  const isOnTarget = value >= target;
  const isExcellent = value >= target * 1.1;
  
  return (
    <div className={cn(
      "bg-white dark:bg-neutral-900 rounded-editorial-lg p-luxury-md shadow-luxury",
      "hover:shadow-luxury-lg transition-all duration-300 hover:scale-[1.02]",
      "animate-luxury-fade-up",
      className
    )}>
      <div className="flex items-center justify-between mb-luxury-xs">
        <Typography variant="small" className="text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
          {title}
        </Typography>
        
        {trend !== 'stable' && (
          <div className={cn(
            "flex items-center text-sm",
            trend === 'up' ? "text-green-600" : "text-red-600"
          )}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d={trend === 'up' 
                  ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z"
                  : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z"
                }
                clipRule="evenodd"
              />
            </svg>
            {trend === 'up' ? 'Rising' : 'Declining'}
          </div>
        )}
      </div>
      
      <div className="mb-luxury-sm">
        <span className={cn(
          "text-3xl font-light font-serif",
          isExcellent ? "text-emerald-600" : isOnTarget ? "text-green-600" : "text-amber-600"
        )}>
          {value.toFixed(1)}
        </span>
        <span className="text-neutral-500 ml-1">{unit}</span>
        <span className="text-sm text-neutral-400 ml-2">/ {target}{unit}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-luxury-xs">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            isExcellent ? "bg-emerald-500" : isOnTarget ? "bg-green-500" : "bg-amber-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <Typography variant="caption" className={cn(
        isExcellent ? "text-emerald-600" : isOnTarget ? "text-green-600" : "text-amber-600"
      )}>
        {isExcellent ? "Exceeding luxury standards" : isOnTarget ? "Meeting luxury standards" : "Below luxury target"}
      </Typography>
    </div>
  );
};

export const LuxuryMetricsDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const [metrics, setMetrics] = useState<LuxuryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading luxury metrics
    const loadMetrics = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      setMetrics({
        luxuryPerceptionScore: 8.2,
        technicalExcellenceScore: 8.7,
        imageGenerationQuality: 8.4,
        premiumTierExperienceScore: 8.9,
        performanceMetrics: {
          averageLoadTime: 1850, // ms
          imageGenerationTime: 2100, // ms
          firstContentfulPaint: 1200, // ms
          userSatisfactionScore: 9.1
        },
        qualityBenchmarks: {
          fontHierarchyCompliance: true,
          spacingStandardsCompliance: true,
          animationQuality: true,
          premiumFeelRating: 8.6
        }
      });
      
      setLoading(false);
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className={cn("p-luxury-lg", className)}>
        <div className="text-center mb-luxury-lg">
          <LuxuryLoading variant="spinner" size="lg" className="mx-auto mb-luxury-sm" />
          <Typography variant="luxury-subtitle">
            Analyzing luxury quality metrics...
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-luxury-md">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-neutral-200 dark:bg-neutral-700 rounded-editorial-lg h-40 animate-premium-skeleton"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const overallScore = (
    metrics.luxuryPerceptionScore +
    metrics.technicalExcellenceScore +
    metrics.imageGenerationQuality +
    metrics.premiumTierExperienceScore
  ) / 4;

  return (
    <div className={cn("p-luxury-lg", className)}>
      {/* Header */}
      <div className="text-center mb-luxury-lg animate-luxury-fade-up">
        <Typography variant="luxury-eyebrow" className="text-neutral-500 mb-luxury-xs">
          Quality Assurance Dashboard
        </Typography>
        <Typography variant="luxury-title" className="mb-luxury-sm">
          Luxury Standards Monitor
        </Typography>
        <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Real-time monitoring of SSELFIE's luxury quality standards and performance metrics
        </Typography>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-editorial-xl p-luxury-lg mb-luxury-lg animate-luxury-fade-up">
        <div className="text-center">
          <Typography variant="luxury-eyebrow" className="text-neutral-300 mb-luxury-xs">
            Overall Luxury Score
          </Typography>
          <div className="flex items-center justify-center mb-luxury-sm">
            <span className="text-6xl font-light font-serif">{overallScore.toFixed(1)}</span>
            <span className="text-2xl text-neutral-300 ml-2">/10</span>
          </div>
          <Typography variant="luxury-body" className={cn(
            overallScore >= 8 ? "text-emerald-400" : overallScore >= 7 ? "text-green-400" : "text-amber-400"
          )}>
            {overallScore >= 8 ? "Exceeding Chanel Digital Standards" : 
             overallScore >= 7 ? "Meeting Luxury Expectations" : 
             "Requires Premium Enhancement"}
          </Typography>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-luxury-md mb-luxury-lg">
        <MetricCard
          title="Luxury Perception"
          value={metrics.luxuryPerceptionScore}
          target={7}
          unit="/10"
          trend="up"
        />
        
        <MetricCard
          title="Technical Excellence"
          value={metrics.technicalExcellenceScore}
          target={8}
          unit="/10"
          trend="up"
        />
        
        <MetricCard
          title="Image Quality"
          value={metrics.imageGenerationQuality}
          target={8}
          unit="/10"
          trend="stable"
        />
        
        <MetricCard
          title="Premium Experience"
          value={metrics.premiumTierExperienceScore}
          target={8}
          unit="/10"
          trend="up"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-luxury-md mb-luxury-lg">
        <MetricCard
          title="Average Load Time"
          value={metrics.performanceMetrics.averageLoadTime}
          target={2000}
          unit="ms"
          trend="down"
        />
        
        <MetricCard
          title="Image Generation"
          value={metrics.performanceMetrics.imageGenerationTime}
          target={3000}
          unit="ms"
          trend="stable"
        />
        
        <MetricCard
          title="First Contentful Paint"
          value={metrics.performanceMetrics.firstContentfulPaint}
          target={1500}
          unit="ms"
          trend="up"
        />
        
        <MetricCard
          title="User Satisfaction"
          value={metrics.performanceMetrics.userSatisfactionScore}
          target={8}
          unit="/10"
          trend="up"
        />
      </div>

      {/* Quality Benchmarks */}
      <div className="bg-white dark:bg-neutral-900 rounded-editorial-lg p-luxury-lg shadow-luxury animate-luxury-fade-up">
        <Typography variant="h4" className="mb-luxury-md">
          Luxury Quality Benchmarks
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-luxury-md">
          <div className="space-y-luxury-xs">
            <div className="flex items-center justify-between">
              <Typography variant="luxury-body">Times New Roman Typography</Typography>
              <div className={cn(
                "flex items-center",
                metrics.qualityBenchmarks.fontHierarchyCompliance ? "text-green-600" : "text-red-600"
              )}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d={metrics.qualityBenchmarks.fontHierarchyCompliance
                      ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    }
                    clipRule="evenodd"
                  />
                </svg>
                {metrics.qualityBenchmarks.fontHierarchyCompliance ? 'Compliant' : 'Non-compliant'}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Typography variant="luxury-body">24px+ Luxury Spacing</Typography>
              <div className={cn(
                "flex items-center",
                metrics.qualityBenchmarks.spacingStandardsCompliance ? "text-green-600" : "text-red-600"
              )}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Compliant
              </div>
            </div>
          </div>
          
          <div className="space-y-luxury-xs">
            <div className="flex items-center justify-between">
              <Typography variant="luxury-body">Premium Animation Quality</Typography>
              <div className={cn(
                "flex items-center",
                metrics.qualityBenchmarks.animationQuality ? "text-green-600" : "text-red-600"
              )}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Excellent
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Typography variant="luxury-body">Premium Feel Rating</Typography>
              <div className="flex items-center text-green-600">
                <span className="font-semibold mr-2">{metrics.qualityBenchmarks.premiumFeelRating}/10</span>
                <Typography variant="caption" className="text-green-600">
                  Luxury Standard
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};