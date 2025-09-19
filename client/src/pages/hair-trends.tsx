import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';

interface TrendData {
  hairStyles: string[];
  colorTrends: string[];
  techniques: string[];
  socialMediaInsights: string[];
}

interface HairTrendResponse {
  id: number;
  weekRange: string;
  trends: TrendData;
  summary: string;
  confidence: number;
  lastUpdate: string;
}

interface TrendsApiResponse {
  success: boolean;
  trends: HairTrendResponse[];
  lastUpdate: string | null;
  totalWeeks: number;
}

export default function HairTrends() {
  const { isAuthenticated } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const { data: trendsData, isLoading, error } = useQuery<TrendsApiResponse>({
    queryKey: ['/api/hair-trends'],
    enabled: isAuthenticated,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 1 * 60 * 1000, // Consider stale after 1 minute
  });

  useEffect(() => {
    document.title = "Hair & Beauty Trends - SSELFIE Studio";
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Authentication Required
          </h1>
          <p className="text-gray-600">Please log in to access hair and beauty trends.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading latest hair & beauty trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Unable to Load Trends
          </h1>
          <p className="text-gray-600 mb-4">Sorry, we couldn't load the latest trends right now.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors font-light text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!trendsData?.trends || trendsData.trends.length === 0) {
    return (
      <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light text-black mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
            Hair & Beauty Trends
          </h1>
          <div className="bg-gray-50 rounded-lg p-12">
            <div className="text-6xl mb-6">🔄</div>
            <h2 className="text-2xl font-light text-black mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
              Trends Analysis in Progress
            </h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Our AI trend analyst Sophia is currently gathering the latest hair and beauty insights. 
              Check back soon for weekly trend reports tailored for professional hairstylists and beauty creators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentTrend = selectedWeek 
    ? trendsData.trends.find(t => t.weekRange === selectedWeek) 
    : trendsData.trends[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-light mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                HAIR & BEAUTY
              </h1>
              <h2 className="text-2xl md:text-3xl font-light opacity-90" style={{ fontFamily: 'Times New Roman, serif' }}>
                Weekly Trends
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.3em] font-light opacity-70 mb-2">
                Powered by Sophia AI
              </div>
              <div className="text-sm font-light">
                Last Updated: {trendsData.lastUpdate ? new Date(trendsData.lastUpdate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Week selector */}
          {trendsData.trends.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {trendsData.trends.map((trend) => (
                <button
                  key={trend.id}
                  onClick={() => setSelectedWeek(trend.weekRange)}
                  className={`px-4 py-2 text-sm font-light border transition-colors ${
                    (selectedWeek === trend.weekRange || (!selectedWeek && trend === trendsData.trends[0]))
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white border-white/30 hover:border-white/50'
                  }`}
                >
                  {trend.weekRange}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      {currentTrend && (
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Summary section */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl md:text-3xl font-light text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Week Overview
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Confidence: {currentTrend.confidence}%</span>
                  <span>•</span>
                  <span>Week: {currentTrend.weekRange}</span>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-gray-700 font-light">
                  {currentTrend.summary}
                </p>
              </div>
            </div>

            {/* Trends grid */}
            <div className="grid md:grid-cols-2 gap-12">
              {/* Hair Styles */}
              <div className="bg-gray-50 p-8 rounded-lg">
                <h4 className="text-xl font-light text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Hair Styles
                </h4>
                <ul className="space-y-3">
                  {currentTrend.trends.hairStyles?.map((style, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      {style}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Color Trends */}
              <div className="bg-gray-50 p-8 rounded-lg">
                <h4 className="text-xl font-light text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Color Trends
                </h4>
                <ul className="space-y-3">
                  {currentTrend.trends.colorTrends?.map((color, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      {color}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Techniques */}
              <div className="bg-gray-50 p-8 rounded-lg">
                <h4 className="text-xl font-light text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Techniques
                </h4>
                <ul className="space-y-3">
                  {currentTrend.trends.techniques?.map((technique, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      {technique}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Media Insights */}
              <div className="bg-gray-50 p-8 rounded-lg">
                <h4 className="text-xl font-light text-black mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Social Media Insights
                </h4>
                <ul className="space-y-3">
                  {currentTrend.trends.socialMediaInsights?.map((insight, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Call to action */}
            <div className="mt-16 text-center bg-black text-white rounded-lg p-12">
              <h3 className="text-2xl md:text-3xl font-light mb-6" style={{ fontFamily: 'Times New Roman, serif' }}>
                Apply These Trends to Your Photos
              </h3>
              <p className="text-lg font-light opacity-90 mb-8 max-w-2xl mx-auto">
                Use these insights to create on-trend professional photos with SSELFIE Studio. 
                Generate images that capture the latest hair and beauty styles.
              </p>
              <button
                onClick={() => window.location.href = '/app'}
                className="bg-white text-black px-8 py-3 hover:bg-gray-100 transition-colors font-light text-sm uppercase tracking-[0.2em]"
              >
                Create Photos Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}