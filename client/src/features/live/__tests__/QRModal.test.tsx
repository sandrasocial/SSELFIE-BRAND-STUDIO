/**
 * QR Modal Snapshot Tests
 * Tests for QR code modal component rendering
 */

import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PresenterConsole from '../PresenterConsole';

// Mock the hooks
jest.mock('wouter', () => ({
  useParams: () => ({ sessionId: 'test-session-123' }),
}));

jest.mock('../../../hooks/use-auth', () => ({
  useAuth: () => ({
    user: { displayName: 'Test User', email: 'test@example.com' },
  }),
}));

// Mock the live session hook with QR showing
jest.mock('../hooks/useLiveSession', () => ({
  useLiveSession: () => ({
    data: {
      id: 'test-session-123',
      title: 'QR Test Session',
      deckUrl: 'https://www.canva.com/design/ABC123/view?embed',
      mentiUrl: 'https://www.mentimeter.com/presentation/xyz789',
      ctaUrl: 'https://example.com/join',
      createdBy: 'user-123',
      createdAt: '2025-01-19T15:00:00Z',
      updatedAt: '2025-01-19T15:00:00Z',
    },
    isLoading: false,
    error: null,
  }),
}));

// Mock the embed components to avoid external dependencies
jest.mock('../../../components/CanvaEmbed', () => {
  return function MockCanvaEmbed() {
    return <div data-testid="canva-embed">Mock Canva Embed</div>;
  };
});

jest.mock('../../../components/MentimeterEmbed', () => {
  return function MockMentimeterEmbed() {
    return <div data-testid="mentimeter-embed">Mock Mentimeter Embed</div>;
  };
});

// Mock window.location for QR URL generation
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://sselfie.com',
  },
  writable: true,
});

describe('QR Modal Snapshots', () => {
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

  it('matches snapshot when QR code is displayed', async () => {
    const { container, getByText, getByRole } = renderWithProviders(<PresenterConsole />);

    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Activate QR display
    const qrButton = getByRole('button', { name: /Show QR Code/ });
    qrButton.click();

    // Wait for QR to appear
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find the QR section
    const qrSection = container.querySelector('[class*="bg-gray-900"]');
    expect(qrSection).toMatchSnapshot('qr-modal-displayed');
  });

  it('matches snapshot of stage controls with QR active', async () => {
    const { container, getByRole } = renderWithProviders(<PresenterConsole />);

    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Activate QR display
    const qrButton = getByRole('button', { name: /Show QR Code/ });
    qrButton.click();

    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find the stage controls section
    const stageControls = container.querySelector('[class*="Stage Controls"]')?.parentElement;
    expect(stageControls).toMatchSnapshot('stage-controls-with-qr');
  });

  it('matches snapshot of QR URL structure', () => {
    const sessionId = 'test-session-123';
    const baseUrl = 'https://sselfie.com';
    const guestUrl = `${baseUrl}/hair/guest/${sessionId}?utm_source=stage&utm_campaign=hair_experience`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guestUrl)}`;

    const qrData = {
      sessionId,
      guestUrl,
      qrCodeUrl,
      utmParams: {
        utm_source: 'stage',
        utm_campaign: 'hair_experience'
      }
    };

    expect(qrData).toMatchSnapshot('qr-url-structure');
  });

  it('matches snapshot of keyboard hints section', async () => {
    const { container } = renderWithProviders(<PresenterConsole />);

    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find keyboard hints
    const keyboardHints = container.querySelector('[class*="text-xs text-gray-500"]');
    expect(keyboardHints).toMatchSnapshot('keyboard-hints-section');
  });
});