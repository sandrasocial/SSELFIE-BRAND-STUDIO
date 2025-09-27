import React, { useState, useEffect } from 'react';
import { Typography } from "../components/ui/typography";
import { LuxuryButton } from "../components/ui/luxury-button";
import { LuxuryLoading, LuxuryImageSkeleton, LuxuryCardSkeleton } from "../components/ui/luxury-loading";
import { PremiumUpgradeFlow } from "../components/ui/premium-upgrade-flow";
import { LuxuryMetricsDashboard } from "../components/ui/luxury-metrics-dashboard";
import { ComprehensiveQualitySuite } from "../utils/comprehensiveQualitySuite";
import { EditorialAnimations } from "../utils/editorialAnimations";

export const LuxuryShowcase: React.FC = () => {
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qualityReport, setQualityReport] = useState<any>(null);

  useEffect(() => {
    // Initialize luxury animations
    const observer = EditorialAnimations.observeScrollAnimations('.animate-on-scroll');
    
    return () => observer.disconnect();
  }, []);

  const runQualityAudit = async () => {
    setLoading(true);
    const suite = new ComprehensiveQualitySuite();
    const report = await suite.runCompleteQualityAudit();
    setQualityReport(report);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section - Luxury spacing and typography */}
      <section className="luxury-hero-section bg-gradient-to-b from-neutral-900 to-neutral-800 text-white">
        <div className="luxury-container text-center animate-luxury-fade-up">
          <Typography variant="luxury-eyebrow" className="text-neutral-300 mb-luxury-sm">
            SSELFIE Studio
          </Typography>
          
          <Typography variant="luxury-display" className="text-white mb-luxury-md">
            Luxury Enhanced
          </Typography>
          
          <Typography variant="luxury-subtitle" className="text-neutral-200 max-w-3xl mx-auto mb-luxury-lg">
            Experience the new standard in digital luxury with enhanced typography, 
            premium spacing, and sophisticated micro-interactions that elevate every moment.
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-luxury-sm justify-center animate-luxury-fade-up luxury-stagger-1">
            <LuxuryButton
              variant="luxury"
              size="lg"
              onClick={() => setShowUpgradeFlow(true)}
              shimmer
            >
              Experience Premium Access
            </LuxuryButton>
            
            <LuxuryButton
              variant="secondary"
              size="lg"
              onClick={() => setShowMetrics(true)}
            >
              View Quality Metrics
            </LuxuryButton>
          </div>
        </div>
      </section>

      {/* Typography Showcase */}
      <section className="luxury-section">
        <div className="luxury-container">
          <div className="text-center mb-luxury-xl animate-on-scroll">
            <Typography variant="luxury-eyebrow" className="text-neutral-500 mb-luxury-sm">
              Typography Excellence
            </Typography>
            <Typography variant="luxury-title" className="mb-luxury-md">
              Times New Roman Hierarchy
            </Typography>
            <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Our enhanced typography system uses Times New Roman throughout, 
              with refined weights and luxury spacing for magazine-quality presentation.
            </Typography>
          </div>

          <div className="grid md:grid-cols-2 gap-luxury-lg">
            <div className="editorial-card animate-on-scroll">
              <Typography variant="h1" className="mb-luxury-sm">
                Editorial Headline
              </Typography>
              <Typography variant="luxury-body" className="mb-luxury-md">
                This demonstrates our enhanced typography with Times New Roman font family, 
                refined weights (extralight/light), and luxury line heights for optimal readability.
              </Typography>
              <Typography variant="luxury-eyebrow">
                Enhanced for luxury perception
              </Typography>
            </div>

            <div className="editorial-card animate-on-scroll">
              <Typography variant="quote" className="mb-luxury-sm">
                "The typography feels unmistakably premium, 
                like reading Vogue or Harper's Bazaar."
              </Typography>
              <Typography variant="caption" className="text-neutral-500">
                — Luxury brand consultant
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing Showcase */}
      <section className="luxury-section bg-white dark:bg-neutral-800">
        <div className="luxury-container">
          <div className="text-center mb-luxury-xl animate-on-scroll">
            <Typography variant="luxury-eyebrow" className="text-neutral-500 mb-luxury-sm">
              Premium Spacing
            </Typography>
            <Typography variant="luxury-title" className="mb-luxury-md">
              24px+ Luxury Margins
            </Typography>
            <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Every element breathes with generous white space. Our luxury spacing system 
              starts at 24px and scales to create the premium feel of high-end publications.
            </Typography>
          </div>

          <div className="space-y-luxury-lg">
            <div className="luxury-card p-luxury-xl animate-on-scroll">
              <Typography variant="h3" className="mb-luxury-md">
                Generous White Space
              </Typography>
              <Typography variant="luxury-body" className="mb-luxury-lg">
                Notice how each element has room to breathe. This isn't just padding—
                it's carefully calculated luxury spacing that creates visual hierarchy 
                and premium perception.
              </Typography>
              <div className="grid grid-cols-3 gap-luxury-md">
                <div className="text-center">
                  <div className="text-2xl font-light mb-luxury-xs">24px</div>
                  <Typography variant="caption">Minimum luxury</Typography>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light mb-luxury-xs">48px</div>
                  <Typography variant="caption">Standard premium</Typography>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light mb-luxury-xs">96px</div>
                  <Typography variant="caption">Ultra luxury</Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animation Showcase */}
      <section className="luxury-section">
        <div className="luxury-container">
          <div className="text-center mb-luxury-xl animate-on-scroll">
            <Typography variant="luxury-eyebrow" className="text-neutral-500 mb-luxury-sm">
              Micro-Interactions
            </Typography>
            <Typography variant="luxury-title" className="mb-luxury-md">
              Sophisticated Animations
            </Typography>
            <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Every interaction is crafted with luxury-grade animations using premium easing curves 
              and carefully timed sequences that feel responsive and delightful.
            </Typography>
          </div>

          <div className="grid md:grid-cols-3 gap-luxury-md">
            <div className="editorial-card hover:scale-105 luxury-transition animate-on-scroll">
              <Typography variant="h4" className="mb-luxury-sm">
                Hover Effects
              </Typography>
              <Typography variant="luxury-body">
                Subtle scale transforms with luxury easing curves create premium feedback.
              </Typography>
            </div>

            <div className="editorial-card animate-on-scroll luxury-stagger-1">
              <Typography variant="h4" className="mb-luxury-sm">
                Staggered Reveals
              </Typography>
              <Typography variant="luxury-body">
                Elements appear in sequence with sophisticated timing for editorial elegance.
              </Typography>
            </div>

            <div className="editorial-card animate-on-scroll luxury-stagger-2">
              <Typography variant="h4" className="mb-luxury-sm">
                Performance First
              </Typography>
              <Typography variant="luxury-body">
                All animations are optimized for 60fps performance across all devices.
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* Loading States Showcase */}
      <section className="luxury-section bg-white dark:bg-neutral-800">
        <div className="luxury-container">
          <div className="text-center mb-luxury-xl animate-on-scroll">
            <Typography variant="luxury-eyebrow" className="text-neutral-500 mb-luxury-sm">
              Loading Experience
            </Typography>
            <Typography variant="luxury-title" className="mb-luxury-md">
              Premium Loading States
            </Typography>
            <Typography variant="luxury-body" className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Even loading states maintain the luxury experience with sophisticated skeleton screens 
              and elegant spinners that feel intentional and premium.
            </Typography>
          </div>

          <div className="grid md:grid-cols-3 gap-luxury-md">
            <div className="editorial-card text-center animate-on-scroll">
              <Typography variant="h4" className="mb-luxury-md">
                Luxury Spinner
              </Typography>
              <LuxuryLoading variant="spinner" size="lg" className="mx-auto mb-luxury-sm" />
              <Typography variant="luxury-body">
                Sophisticated loading animation with premium timing
              </Typography>
            </div>

            <div className="editorial-card animate-on-scroll">
              <Typography variant="h4" className="mb-luxury-md">
                Image Skeleton
              </Typography>
              <LuxuryImageSkeleton aspectRatio="landscape" className="mb-luxury-sm" />
              <Typography variant="luxury-body">
                Elegant placeholders maintain visual hierarchy
              </Typography>
            </div>

            <div className="editorial-card animate-on-scroll">
              <Typography variant="h4" className="mb-luxury-md">
                Card Skeleton
              </Typography>
              <LuxuryCardSkeleton />
            </div>
          </div>
        </div>
      </section>

      {/* Quality Testing */}
      <section className="luxury-section bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
        <div className="luxury-container text-center">
          <div className="animate-on-scroll">
            <Typography variant="luxury-eyebrow" className="text-neutral-300 mb-luxury-sm">
              Quality Assurance
            </Typography>
            <Typography variant="luxury-title" className="text-white mb-luxury-md">
              Comprehensive Quality Suite
            </Typography>
            <Typography variant="luxury-body" className="text-neutral-200 max-w-2xl mx-auto mb-luxury-lg">
              Run our comprehensive quality audit to validate that all implementations 
              meet luxury standards with scores above 7/10 for luxury perception and 8/10 for technical excellence.
            </Typography>
            
            <LuxuryButton
              variant="premium"
              size="lg"
              onClick={runQualityAudit}
              loading={loading}
              loadingText="Running Quality Audit..."
              className="mb-luxury-lg"
            >
              Run Quality Audit
            </LuxuryButton>

            {qualityReport && (
              <div className="bg-white/10 backdrop-blur rounded-editorial-lg p-luxury-lg text-left max-w-2xl mx-auto animate-luxury-fade-up">
                <Typography variant="h4" className="text-white mb-luxury-sm">
                  Quality Report Summary
                </Typography>
                <div className="space-y-luxury-xs">
                  <div className="flex justify-between">
                    <span>Overall Luxury Score:</span>
                    <span className="font-semibold">{qualityReport.overallLuxuryScore.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brand Consistency:</span>
                    <span className="font-semibold">{qualityReport.brandConsistencyRating.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UX Excellence:</span>
                    <span className="font-semibold">{qualityReport.userExperienceExcellence.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Performance:</span>
                    <span className="font-semibold">{qualityReport.technicalPerformance.toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="mt-luxury-sm pt-luxury-sm border-t border-white/20">
                  <span className="text-green-400">
                    ✅ {qualityReport.luxuryRecommendations.length} enhancements implemented
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premium Upgrade Flow Modal */}
      {showUpgradeFlow && (
        <PremiumUpgradeFlow
          onClose={() => setShowUpgradeFlow(false)}
          onUpgrade={async (tierId) => {
            console.log(`Upgrading to ${tierId}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            setShowUpgradeFlow(false);
          }}
        />
      )}

      {/* Metrics Dashboard Modal */}
      {showMetrics && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-editorial flex items-center justify-center z-50 p-luxury-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-editorial-xl shadow-luxury-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-900 p-luxury-sm border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <Typography variant="h3">
                Luxury Quality Metrics
              </Typography>
              <button
                onClick={() => setShowMetrics(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <LuxuryMetricsDashboard />
          </div>
        </div>
      )}
    </div>
  );
};