import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MemberNavigation } from '@/components/member-navigation';
import { GlobalFooter } from '@/components/global-footer';
import { SandraImages } from '@/lib/sandra-images';

// Moodboard style component with authentic Sandra images
const MoodboardSection = ({ title, images, className = '' }: {
  title: string;
  images: string[];
  className?: string;
}) => (
  <div className={`space-y-6 ${className}`}>
    <div className="text-center">
      <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-2">
        {title}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {images.slice(0, 3).map((img, idx) => (
        <div key={idx} className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={img} 
            alt={`${title} ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  </div>
);

export default function AdminBusinessOverview() {
  // Fetch real business metrics
  const { data: businessMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/business-metrics'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: subscriberStats, isLoading: subscriberLoading } = useQuery({
    queryKey: ['/api/admin/subscriber-stats']
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/recent-activity']
  });

  const isLoading = metricsLoading || subscriberLoading || activityLoading;

  // Hero image from authentic collection - using safe array access
  const heroImage = SandraImages.gallery[0]?.url || 'https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/images/42585527/tracker_376_img_1_1753351123712.png';

  // Business priority tasks
  const businessTasks = [
    'Review subscriber import performance from ManyChat (4,608 subscribers available)',
    'Analyze monthly revenue trends and identify growth opportunities',
    'Monitor AI image generation usage and optimize for cost efficiency',
    'Track user engagement across platform features',
    'Prepare quarterly business intelligence report'
  ];

  return (
    <div className="min-h-screen bg-white">
      <MemberNavigation />
      
      {/* Full Bleed Hero Image */}
      <section className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <img 
            src={heroImage}
            alt="Business Overview Command Center"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-8 flex flex-col justify-end min-h-screen pb-20">
          <div className="text-xs tracking-[0.4em] uppercase opacity-70 mb-8">
            Your Personal Brand Empire
          </div>
          
          <h1 className="font-serif text-[clamp(4rem,10vw,10rem)] leading-[0.8] font-light uppercase tracking-wide mb-8">
            Business Overview
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto opacity-80 font-light leading-relaxed">
            Complete revenue tracking, subscriber analytics, and business intelligence 
            for your luxury personal brand platform.
          </p>
        </div>
      </section>

      {/* Main Business Content */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          
          {/* Real Business Metrics - Tile/Tagline Style */}
          <div className="text-center mb-20">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
              Real Business Data
            </div>
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-light uppercase tracking-wide leading-tight mb-8">
              Revenue & Growth
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="text-gray-500">Loading business metrics...</div>
            </div>
          ) : (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    €{businessMetrics?.totalRevenue || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Total Revenue
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    €{businessMetrics?.monthlyRevenue || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Monthly Revenue
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.totalSubscribers || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Total Subscribers
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.activeUsers || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Active Users
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.totalAIImages || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    AI Images Generated
                  </div>
                </div>
                
                <div className="text-center p-8 border border-gray-200">
                  <div className="font-serif text-4xl font-light mb-2">
                    {businessMetrics?.trainedModels || 0}
                  </div>
                  <div className="text-xs tracking-[0.3em] uppercase text-gray-500">
                    Trained Models
                  </div>
                </div>
              </div>

              {/* Full Bleed Image Page Break */}
              <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-20">
                <div className="aspect-[21/9] overflow-hidden">
                  <img 
                    src={SandraImages.gallery[1]?.url || heroImage}
                    alt="Business Growth"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Business Tasks Todo List */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                    Priority Actions
                  </div>
                  <h3 className="font-serif text-2xl font-light tracking-wide">
                    Business Tasks
                  </h3>
                </div>
                
                <div className="max-w-4xl mx-auto space-y-4">
                  {businessTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-gray-200">
                      <div className="w-4 h-4 border border-gray-400 mt-1 flex-shrink-0"></div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {task}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Intelligence Moodboard */}
              <div className="mb-20">
                <div className="text-center mb-12">
                  <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-4">
                    Visual Analytics
                  </div>
                  <h3 className="font-serif text-2xl font-light tracking-wide">
                    Platform Insights
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <MoodboardSection 
                    title="User Journey"
                    images={SandraImages.gallery.slice(0, Math.min(3, SandraImages.gallery.length)).map(img => img.url)}
                  />
                  <MoodboardSection 
                    title="Revenue Growth"
                    images={SandraImages.gallery.slice(0, Math.min(3, SandraImages.gallery.length)).map(img => img.url)}
                  />
                  <MoodboardSection 
                    title="Platform Quality"
                    images={SandraImages.gallery.slice(0, Math.min(3, SandraImages.gallery.length)).map(img => img.url)}
                  />
                </div>
              </div>

              {/* Powerquote */}
              <div className="text-center py-20 max-w-4xl mx-auto">
                <blockquote className="font-serif text-2xl md:text-3xl font-light leading-relaxed text-gray-800 italic">
                  "Your personal brand is built through every single interaction, 
                  every piece of content, and every moment of authentic connection 
                  with your community."
                </blockquote>
                <div className="text-xs tracking-[0.3em] uppercase text-gray-500 mt-8">
                  Sandra Aamodt, Founder
                </div>
              </div>

              {/* Image Cards - Agent Card Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <Link href="/admin/subscriber-import" className="group">
                  <div className="relative overflow-hidden bg-black aspect-[4/5]">
                    <img 
                      src={SandraImages.gallery[2]?.url || heroImage}
                      alt="Subscriber Management"
                      className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-90 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-xl font-light tracking-[0.3em] uppercase">
                          Subscriber Import
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                          Data Management
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/consulting-agents" className="group">
                  <div className="relative overflow-hidden bg-black aspect-[4/5]">
                    <img 
                      src={SandraImages.gallery[3]?.url || heroImage}
                      alt="AI Agents"
                      className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-90 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-xl font-light tracking-[0.3em] uppercase">
                          AI Agents
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                          Strategic Consulting
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/workspace" className="group">
                  <div className="relative overflow-hidden bg-black aspect-[4/5]">
                    <img 
                      src={SandraImages.gallery[4]?.url || heroImage}
                      alt="Platform Studio"
                      className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-90 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="font-serif text-xl font-light tracking-[0.3em] uppercase">
                          Studio Platform
                        </div>
                        <div className="text-xs tracking-[0.2em] uppercase opacity-70 mt-2">
                          Member Experience
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}

          {/* Admin Navigation Style */}
          <div className="text-center">
            <div className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-8">
              Platform Navigation
            </div>
            <div className="flex justify-center gap-8">
              <Link 
                href="/admin-dashboard"
                className="text-sm tracking-[0.2em] uppercase border-b border-transparent hover:border-black transition-colors duration-300"
              >
                Admin Dashboard
              </Link>
              <Link 
                href="/workspace"
                className="text-sm tracking-[0.2em] uppercase border-b border-transparent hover:border-black transition-colors duration-300"
              >
                Back to Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}