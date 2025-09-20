/**
 * AudienceClient Component Tests
 * Tests poll display, CTA functionality, and UTM parameter handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AudienceClient from '../AudienceClient';

// Mock the hooks
jest.mock('wouter', () => ({
  useParams: () => ({ sessionId: 'test-session-123' }),
  useLocation: () => ['/hair/guest/test-session-123?utm_source=stage&utm_campaign=hair_experience', jest.fn()],
}));

// Mock the live session hook
jest.mock('../hooks/useLiveSession', () => ({
  useLiveSession: () => ({
    data: {
      id: 'test-session-123',
      title: 'Advanced Hair Styling Workshop',
      deckUrl: 'https://www.canva.com/design/ABCD1234/view?embed',
      mentiUrl: 'https://www.mentimeter.com/presentation/xyz123',
      ctaUrl: 'https://example.com/signup',
      createdBy: 'user-123',
      createdAt: '2025-01-19T14:00:00Z',
      updatedAt: '2025-01-19T14:00:00Z',
    },
    isLoading: false,
    error: null,
  }),
}));

// Mock the Mentimeter embed component
jest.mock('../../../components/MentimeterEmbed', () => {
  return function MockMentimeterEmbed({ presentationId, title }: { presentationId?: string; title?: string }) {
    return (
      <div data-testid="mentimeter-embed">
        <div>Presentation ID: {presentationId}</div>
        <div>Title: {title}</div>
      </div>
    );
  };
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://sselfie.com',
    href: 'https://sselfie.com/hair/guest/test-session-123?utm_source=stage&utm_campaign=hair_experience',
    search: '?utm_source=stage&utm_campaign=hair_experience',
  },
  writable: true,
});

describe('AudienceClient', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders audience client with session info', async () => {
    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Advanced Hair Styling Workshop')).toBeInTheDocument();
      expect(screen.getByText('Interactive Session • Join the conversation')).toBeInTheDocument();
      expect(screen.getByText(/test-ses.../)).toBeInTheDocument();
    });
  });

  it('displays live session badge when UTM source is stage', async () => {
    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Live Session')).toBeInTheDocument();
    });
  });

  it('displays interactive poll section', async () => {
    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Interactive Poll')).toBeInTheDocument();
      expect(screen.getByTestId('mentimeter-embed')).toBeInTheDocument();
      expect(screen.getByText('Presentation ID: xyz123')).toBeInTheDocument();
    });
  });

  it('displays call to action when CTA URL is provided', async () => {
    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Take Action')).toBeInTheDocument();
      expect(screen.getByText('Ready to learn more? Join the experience:')).toBeInTheDocument();
      
      const ctaButton = screen.getByRole('link', { name: 'Get Started Now' });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', expect.stringContaining('utm_source=stage'));
      expect(ctaButton).toHaveAttribute('href', expect.stringContaining('utm_campaign=hair_experience'));
    });
  });

  it('displays session information sidebar', async () => {
    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Session Info')).toBeInTheDocument();
      expect(screen.getByText('Advanced Hair Styling Workshop')).toBeInTheDocument();
      expect(screen.getByText('test-session-123')).toBeInTheDocument();
      expect(screen.getByText('Stage • hair_experience')).toBeInTheDocument();
    });
  });

  it('displays coming soon features', async () => {
    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
      expect(screen.getByText('Real-time Q&A')).toBeInTheDocument();
      expect(screen.getByText('Live reactions & feedback')).toBeInTheDocument();
      expect(screen.getByText('Resource downloads')).toBeInTheDocument();
      expect(screen.getByText('Session recordings')).toBeInTheDocument();
    });
  });

  it('handles session without poll URL', async () => {
    // Mock session without mentiUrl
    jest.doMock('../hooks/useLiveSession', () => ({
      useLiveSession: () => ({
        data: {
          id: 'test-session-123',
          title: 'Hair Styling Workshop',
          ctaUrl: 'https://example.com/signup',
          createdBy: 'user-123',
          createdAt: '2025-01-19T14:00:00Z',
          updatedAt: '2025-01-19T14:00:00Z',
        },
        isLoading: false,
        error: null,
      }),
    }));

    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Get Ready to Participate')).toBeInTheDocument();
      expect(screen.getByText(/The host will launch interactive elements/)).toBeInTheDocument();
    });
  });

  it('handles session without CTA URL', async () => {
    // Mock session without ctaUrl
    jest.doMock('../hooks/useLiveSession', () => ({
      useLiveSession: () => ({
        data: {
          id: 'test-session-123',
          title: 'Hair Styling Workshop',
          mentiUrl: 'https://www.mentimeter.com/presentation/xyz123',
          createdBy: 'user-123',
          createdAt: '2025-01-19T14:00:00Z',
          updatedAt: '2025-01-19T14:00:00Z',
        },
        isLoading: false,
        error: null,
      }),
    }));

    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      // Should not display Take Action section
      expect(screen.queryByText('Take Action')).not.toBeInTheDocument();
    });
  });

  it('extracts and uses UTM parameters correctly', async () => {
    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      const ctaLink = screen.getByRole('link', { name: 'Get Started Now' });
      const href = ctaLink.getAttribute('href');
      
      expect(href).toContain('utm_source=stage');
      expect(href).toContain('utm_campaign=hair_experience');
    });
  });

  it('displays QR code when qr=1 parameter is present', async () => {
    // Mock location with QR parameter
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '?utm_source=stage&utm_campaign=hair_experience&qr=1',
      },
    });

    renderWithProviders(<AudienceClient />);

    await waitFor(() => {
      expect(screen.getByText('Join This Session')).toBeInTheDocument();
      expect(screen.getByAltText('Join Session QR Code')).toBeInTheDocument();
      expect(screen.getByText('Scan to join this session')).toBeInTheDocument();
    });
  });
});
