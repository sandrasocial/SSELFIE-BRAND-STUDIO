/**
 * PresenterConsole Component Tests
 * Tests fullscreen functionality, Canva deck display, and controls
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PresenterConsole from '../PresenterConsole';

// Mock the hook
jest.mock('wouter', () => ({
  useParams: () => ({ sessionId: 'test-session-123' }),
}));

// Mock the auth hook
jest.mock('../../../hooks/use-auth', () => ({
  useAuth: () => ({
    user: { displayName: 'Test Presenter', email: 'presenter@test.com' },
  }),
}));

// Mock the live session hook
jest.mock('../hooks/useLiveSession', () => ({
  useLiveSession: () => ({
    data: {
      id: 'test-session-123',
      title: 'Test Hair Workshop',
      deckUrl: 'https://www.canva.com/design/ABCD1234/view?embed',
      mentiUrl: 'https://www.mentimeter.com/presentation/xyz123',
      ctaUrl: 'https://example.com/cta',
      createdBy: 'user-123',
      createdAt: '2025-01-19T10:00:00Z',
      updatedAt: '2025-01-19T10:00:00Z',
    },
    isLoading: false,
    error: null,
  }),
}));

// Mock the embed components
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

// Mock Fullscreen API
const mockRequestFullscreen = jest.fn();
const mockExitFullscreen = jest.fn();

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  writable: true,
  value: mockRequestFullscreen,
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: mockExitFullscreen,
});

describe('PresenterConsole', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    jest.clearAllMocks();
    
    // Reset fullscreen state
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders presenter console with session title and user info', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      expect(screen.getByText('Test Hair Workshop')).toBeInTheDocument();
      expect(screen.getByText(/Presenter Console • Host: Test Presenter/)).toBeInTheDocument();
      expect(screen.getByText(/Session: test-ses.../)).toBeInTheDocument();
    });
  });

  it('displays Canva embed when deck URL is provided', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      expect(screen.getByTestId('canva-embed')).toBeInTheDocument();
      expect(screen.getByText('Design ID: ABCD1234')).toBeInTheDocument();
      expect(screen.getByText(/Test Hair Workshop - Presentation Deck/)).toBeInTheDocument();
    });
  });

  it('displays Mentimeter embed when poll URL is provided', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      expect(screen.getByTestId('mentimeter-embed')).toBeInTheDocument();
      expect(screen.getByText('Presentation ID: xyz123')).toBeInTheDocument();
      expect(screen.getByText(/Test Hair Workshop - Interactive Poll/)).toBeInTheDocument();
    });
  });

  it('has fullscreen button that triggers fullscreen API', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      const fullscreenButton = screen.getByRole('button', { name: /Enter Fullscreen/ });
      expect(fullscreenButton).toBeInTheDocument();
    });

    const fullscreenButton = screen.getByRole('button', { name: /Enter Fullscreen/ });
    fireEvent.click(fullscreenButton);

    expect(mockRequestFullscreen).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts for fullscreen', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      expect(screen.getByText('Test Hair Workshop')).toBeInTheDocument();
    });

    // Test F key for fullscreen
    fireEvent.keyDown(document, { key: 'f' });
    expect(mockRequestFullscreen).toHaveBeenCalled();

    // Test Q key for QR toggle
    fireEvent.keyDown(document, { key: 'q' });
    
    await waitFor(() => {
      expect(screen.getByText(/Hide QR Code/)).toBeInTheDocument();
    });
  });

  it('shows stage controls with toggles', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      expect(screen.getByText('Stage Controls')).toBeInTheDocument();
      expect(screen.getByText('Interactive Poll')).toBeInTheDocument();
      expect(screen.getByText('Call to Action')).toBeInTheDocument();
    });
  });

  it('displays QR code when Show QR is activated', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      const qrButton = screen.getByRole('button', { name: /Show QR Code/ });
      fireEvent.click(qrButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Join Session')).toBeInTheDocument();
      expect(screen.getByAltText('Join Session QR Code')).toBeInTheDocument();
    });
  });

  it('displays keyboard hints', async () => {
    renderWithProviders(<PresenterConsole />);

    await waitFor(() => {
      expect(screen.getByText('F Key:')).toBeInTheDocument();
      expect(screen.getByText('Toggle Fullscreen')).toBeInTheDocument();
      expect(screen.getByText('Esc Key:')).toBeInTheDocument();
      expect(screen.getByText('Exit Fullscreen')).toBeInTheDocument();
      expect(screen.getByText('Q Key:')).toBeInTheDocument();
      expect(screen.getByText('Toggle QR Code')).toBeInTheDocument();
    });
  });

  it('handles fullscreen state changes', async () => {
    renderWithProviders(<PresenterConsole />);

    // Simulate entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.documentElement,
    });

    fireEvent(document, new Event('fullscreenchange'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Exit Fullscreen/ })).toBeInTheDocument();
    });

    // Simulate exiting fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
    });

    fireEvent(document, new Event('fullscreenchange'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Enter Fullscreen/ })).toBeInTheDocument();
    });
  });
});