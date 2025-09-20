/**
 * WorkshopPane Component Tests
 * Tests for Sophia trends integration and workshop functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkshopPane from '../WorkshopPane';

// Mock the Canva embed component
jest.mock('../../../components/CanvaEmbed', () => {
  return function MockCanvaEmbed({ designId, title }: { designId?: string; title?: string }) {
    return (
      <div data-testid="canva-embed">
        <div>Design ID: {designId}</div>
        <div>Title: {title}</div>
      </div>
    );
  };
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Mock fetch for API calls
global.fetch = jest.fn();

const mockTrendsResponse = {
  success: true,
  trends: {
    styles: [
      'Curtain Bangs with Layers',
      'Wolf Cut Variations',
      'Face-Framing Highlights',
      'Textured Lob Style',
      'Modern Shag Cut'
    ],
    colors: [
      'Warm Honey Blonde',
      'Chocolate Cherry',
      'Dimensional Brunette',
      'Copper Red Accents'
    ],
    techniques: [
      'Balayage Contouring',
      'Money Piece Highlights',
      'Shadow Root Blending',
      'Color Melting Technique'
    ],
    social_insights: [
      '#HairTransformation trending',
      'Before/After content +45%',
      'Hair care routines viral'
    ]
  },
  summary: 'This week\'s trends focus on dimensional color, textured cuts, and face-framing techniques.',
  confidence: 0.85,
  weekRange: 'Jan 15-21, 2025',
  lastUpdate: '2025-01-19T10:00:00Z'
};

const mockConceptCardResponse = {
  success: true,
  data: {
    id: 'concept-123',
    title: 'Style: Curtain Bangs with Layers',
    content: 'Professional style trend for this week: Curtain Bangs with Layers'
  }
};

describe('WorkshopPane', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders Sophia trends successfully', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTrendsResponse),
    });

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Sophia\'s Trend Workshop')).toBeInTheDocument();
      expect(screen.getByText(/Week Jan 15-21, 2025.*85% confidence/)).toBeInTheDocument();
      expect(screen.getByText('5 Hot Ideas This Week')).toBeInTheDocument();
    });

    // Check that trends are displayed
    expect(screen.getByText('Curtain Bangs with Layers')).toBeInTheDocument();
    expect(screen.getByText('Warm Honey Blonde')).toBeInTheDocument();
    expect(screen.getByText('Balayage Contouring')).toBeInTheDocument();
  });

  it('displays top 5 ideas correctly', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTrendsResponse),
    });

    const { container } = renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      const ideaCards = container.querySelectorAll('[data-testid="idea-card"]');
      expect(ideaCards).toHaveLength(5); // Should show exactly 5 ideas
    });

    // Check idea types are displayed
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Technique')).toBeInTheDocument();
  });

  it('copies caption to clipboard when copy button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTrendsResponse),
    });

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Curtain Bangs with Layers')).toBeInTheDocument();
    });

    const copyButton = screen.getAllByText('📋 Copy Caption')[0];
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('✨ Trending now: Curtain Bangs with Layers')
      );
      expect(screen.getByText('✅ Curtain Bangs with Layers')).toBeInTheDocument();
    });
  });

  it('creates concept card when concept card button is clicked', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConceptCardResponse),
      });

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Curtain Bangs with Layers')).toBeInTheDocument();
    });

    const conceptButton = screen.getAllByText('💡 Concept Card')[0];
    fireEvent.click(conceptButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Curtain Bangs with Layers'),
      });

      expect(screen.getByText(/Concept card created: Curtain Bangs with Layers/)).toBeInTheDocument();
    });
  });

  it('opens Canva template when Canva button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTrendsResponse),
    });

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Curtain Bangs with Layers')).toBeInTheDocument();
    });

    const canvaButton = screen.getAllByText('🎨 Canva Template')[0];
    fireEvent.click(canvaButton);

    await waitFor(() => {
      expect(screen.getByText('Canva Template')).toBeInTheDocument();
      expect(screen.getByTestId('canva-embed')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load trends')).toBeInTheDocument();
      expect(screen.getByText('Sophia\'s trend analysis is temporarily unavailable')).toBeInTheDocument();
    });
  });

  it('displays fallback content when no trends available', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...mockTrendsResponse,
        trends: { styles: [], colors: [], techniques: [], social_insights: [] }
      }),
    });

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('No Trends Available')).toBeInTheDocument();
      expect(screen.getByText('Sophia is analyzing the latest trends. Check back soon!')).toBeInTheDocument();
    });
  });

  it('displays weekly insight section', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTrendsResponse),
    });

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Sophia\'s Weekly Insight')).toBeInTheDocument();
      expect(screen.getByText(mockTrendsResponse.summary)).toBeInTheDocument();
      expect(screen.getByText(/Last updated.*Confidence: 85%/)).toBeInTheDocument();
    });
  });

  it('closes Canva embed when close button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTrendsResponse),
    });

    renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Curtain Bangs with Layers')).toBeInTheDocument();
    });

    // Open Canva template
    const canvaButton = screen.getAllByText('🎨 Canva Template')[0];
    fireEvent.click(canvaButton);

    await waitFor(() => {
      expect(screen.getByTestId('canva-embed')).toBeInTheDocument();
    });

    // Close Canva template
    const closeButton = screen.getByRole('button', { name: /close|×/ });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('canva-embed')).not.toBeInTheDocument();
      expect(screen.getByText('5 Hot Ideas This Week')).toBeInTheDocument();
    });
  });

  describe('Idea List Snapshot', () => {
    it('matches snapshot for rendered ideas list', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTrendsResponse),
      });

      const { container } = renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

      await waitFor(() => {
        expect(screen.getByText('Curtain Bangs with Layers')).toBeInTheDocument();
      });

      const ideasContainer = container.querySelector('[data-testid="ideas-container"]');
      expect(ideasContainer).toMatchSnapshot('workshop-ideas-list');
    });

    it('matches snapshot for empty state', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          ...mockTrendsResponse,
          trends: { styles: [], colors: [], techniques: [], social_insights: [] }
        }),
      });

      const { container } = renderWithProviders(<WorkshopPane sessionId="test-session-123" />);

      await waitFor(() => {
        expect(screen.getByText('No Trends Available')).toBeInTheDocument();
      });

      const emptyState = container.querySelector('[data-testid="empty-state"]');
      expect(emptyState).toMatchSnapshot('workshop-empty-state');
    });
  });
});