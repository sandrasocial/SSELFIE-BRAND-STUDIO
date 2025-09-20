/**
 * WorkshopPane Component
 * Workshop tab for PresenterConsole with Sophia trends and quick actions
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CanvaEmbed from '../../components/CanvaEmbed';

interface CurrentTrendsData {
  styles: string[];
  colors: string[];
  techniques: string[];
  social_insights: string[];
}

interface TrendsResponse {
  success: boolean;
  trends: CurrentTrendsData;
  summary: string;
  confidence: number;
  weekRange: string;
  lastUpdate: string;
}

interface WorkshopPaneProps {
  sessionId: string;
}

export default function WorkshopPane({ sessionId }: WorkshopPaneProps) {
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [showCanvaEmbed, setShowCanvaEmbed] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch Sophia trends data
  const { data: trendsData, isLoading, error } = useQuery<TrendsResponse>({
    queryKey: ['/api/trends/current'],
    queryFn: async () => {
      const response = await fetch('/api/trends/current');
      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Extract top 5 ideas from trends data
  const getTop5Ideas = () => {
    if (!trendsData?.trends) return [];

    const ideas: Array<{ type: string; idea: string; icon: string }> = [];
    
    // Styles
    if (trendsData.trends.styles) {
      trendsData.trends.styles.slice(0, 2).forEach(style => {
        ideas.push({ type: 'Style', idea: style, icon: '💇‍♀️' });
      });
    }
    
    // Colors
    if (trendsData.trends.colors) {
      trendsData.trends.colors.slice(0, 2).forEach(color => {
        ideas.push({ type: 'Color', idea: color, icon: '🎨' });
      });
    }
    
    // Techniques
    if (trendsData.trends.techniques) {
      trendsData.trends.techniques.slice(0, 1).forEach(technique => {
        ideas.push({ type: 'Technique', idea: technique, icon: '✨' });
      });
    }

    return ideas.slice(0, 5); // Ensure max 5 items
  };

  // Copy caption to clipboard
  const copyCaption = async (idea: { type: string; idea: string }) => {
    const caption = `✨ Trending now: ${idea.idea}

🔥 This ${idea.type.toLowerCase()} is everywhere this week! Perfect for clients who want to stay ahead of the curve.

#HairTrends #${idea.type} #ProfessionalHair #SalonLife`;

    try {
      await navigator.clipboard.writeText(caption);
      setCopiedText(idea.idea);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Create concept card via Maya API
  const createConceptCard = async (idea: { type: string; idea: string }) => {
    try {
      const conceptData = {
        title: `${idea.type}: ${idea.idea}`,
        content: `Professional ${idea.type.toLowerCase()} trend for this week: ${idea.idea}`,
        category: 'hair-trend',
        metadata: {
          trendType: idea.type.toLowerCase(),
          weekRange: trendsData?.weekRange,
          confidence: trendsData?.confidence,
          source: 'sophia-trends',
          sessionId,
        },
      };

      const response = await fetch('/api/concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conceptData),
      });

      if (!response.ok) {
        throw new Error('Failed to create concept card');
      }

      const result = await response.json();
      console.log('✅ Concept card created:', result);
      
      // Show success feedback
      setCopiedText(`Concept card created: ${idea.idea}`);
      setTimeout(() => setCopiedText(null), 3000);
    } catch (error) {
      console.error('Failed to create concept card:', error);
      setCopiedText('Failed to create concept card');
      setTimeout(() => setCopiedText(null), 3000);
    }
  };

  // Get Canva template URL based on trend type
  const getCanvaTemplateId = (type: string) => {
    const templates = {
      style: 'DAGTKvqGqY0', // Hair styling templates
      color: 'DAFMNwrHr8k', // Color showcase templates
      technique: 'DABCDerFg3h', // Technique tutorials
      default: 'DAXYZabCd4i', // General hair templates
    };
    return templates[type.toLowerCase() as keyof typeof templates] || templates.default;
  };

  const top5Ideas = getTop5Ideas();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load trends</h3>
          <p className="text-gray-600">Sophia's trend analysis is temporarily unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Sophia's Trend Workshop
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {trendsData ? `Week ${trendsData.weekRange}` : 'Latest'} • 
              {trendsData ? ` ${Math.round(trendsData.confidence * 100)}% confidence` : ' Loading...'}
            </p>
          </div>
          
          {copiedText && (
            <div className="bg-green-900 text-green-200 px-3 py-1 rounded-lg text-sm">
              ✅ {copiedText}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showCanvaEmbed ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-medium">Canva Template</h3>
              <button
                onClick={() => setShowCanvaEmbed(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <CanvaEmbed
                designId={selectedTrend ? getCanvaTemplateId(selectedTrend) : 'DAGTKvqGqY0'}
                height="100%"
                className="w-full h-full"
                title="Hair Trend Template"
              />
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-2">5 Hot Ideas This Week</h3>
              <p className="text-gray-400 text-sm">
                {trendsData?.summary || 'Professional hair trends curated by Sophia AI'}
              </p>
            </div>

            {top5Ideas.length > 0 ? (
              <div className="space-y-4" data-testid="ideas-container">
                {top5Ideas.map((idea, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4" data-testid="idea-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{idea.icon}</span>
                        <div>
                          <span className="inline-block bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded-full mr-2">
                            {idea.type}
                          </span>
                          <h4 className="text-white font-medium">{idea.idea}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyCaption(idea)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        📋 Copy Caption
                      </button>
                      
                      <button
                        onClick={() => createConceptCard(idea)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        💡 Concept Card
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedTrend(idea.type);
                          setShowCanvaEmbed(true);
                        }}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        🎨 Canva Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" data-testid="empty-state">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Trends Available</h3>
                <p className="text-gray-500">Sophia is analyzing the latest trends. Check back soon!</p>
              </div>
            )}

            {/* Weekly Summary */}
            {trendsData && (
              <div className="mt-8 bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Sophia's Weekly Insight
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {trendsData.summary}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Last updated: {new Date(trendsData.lastUpdate).toLocaleDateString()} • 
                  Confidence: {Math.round(trendsData.confidence * 100)}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}