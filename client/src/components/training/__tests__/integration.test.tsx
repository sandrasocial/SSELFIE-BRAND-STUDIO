// Integration test for enhanced training components
// Tests the interaction between different parts of the enhanced training system

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrainingProgress } from '../TrainingProgress.js';
import { TrainingErrorBoundary } from '../TrainingErrorBoundary.js';
import { TrainingStage } from '../../../types/training.js';

// Mock toast hook
jest.mock('../../../hooks/use-toast.js', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Create a test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Training Components Integration', () => {
  const mockStage: TrainingStage = {
    name: 'training',
    progress: 45,
    description: 'Training your personalized AI model',
    estimatedDuration: 20 * 60 * 1000 // 20 minutes
  };

  describe('TrainingProgress', () => {
    it('should render progress information correctly', () => {
      render(
        <TrainingProgress
          stage={mockStage}
          progress={45}
          timeRemaining={15 * 60 * 1000} // 15 minutes
        />
      );

      expect(screen.getByText(/training/i)).toBeInTheDocument();
      expect(screen.getByText(/training your personalized ai model/i)).toBeInTheDocument();
      expect(screen.getByText(/progress: 45%/i)).toBeInTheDocument();
      expect(screen.getByText(/time remaining: 15:00/i)).toBeInTheDocument();
    });

    it('should show stage indicators correctly', () => {
      render(
        <TrainingProgress
          stage={mockStage}
          progress={45}
        />
      );

      // Should show preprocessing as completed, training as active, finalizing as pending
      expect(screen.getByText('preprocessing')).toBeInTheDocument();
      expect(screen.getByText('training')).toBeInTheDocument();
      expect(screen.getByText('finalizing')).toBeInTheDocument();
    });

    it('should format time remaining correctly', () => {
      render(
        <TrainingProgress
          stage={mockStage}
          progress={45}
          timeRemaining={125000} // 2 minutes 5 seconds
        />
      );

      expect(screen.getByText(/time remaining: 2:05/i)).toBeInTheDocument();
    });

    it('should handle zero time remaining', () => {
      render(
        <TrainingProgress
          stage={mockStage}
          progress={100}
          timeRemaining={0}
        />
      );

      // Should not show time remaining when it's zero
      expect(screen.queryByText(/time remaining/i)).not.toBeInTheDocument();
    });
  });

  describe('TrainingErrorBoundary', () => {
    // Component that throws an error for testing
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error for boundary');
      }
      return <div>No error</div>;
    };

    it('should render children when no error occurs', () => {
      render(
        <TrainingErrorBoundary>
          <ThrowError shouldThrow={false} />
        </TrainingErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should catch and display errors', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <TrainingErrorBoundary>
          <ThrowError shouldThrow={true} />
        </TrainingErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/test error for boundary/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should show retry button for recoverable errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <TrainingErrorBoundary>
          <ThrowError shouldThrow={true} />
        </TrainingErrorBoundary>
      );

      expect(screen.getByText(/try again/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should show start over button', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <TrainingErrorBoundary>
          <ThrowError shouldThrow={true} />
        </TrainingErrorBoundary>
      );

      expect(screen.getByText(/start over/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Component Integration', () => {
    it('should work together with error boundary wrapping progress', () => {
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <TrainingErrorBoundary>
            <TrainingProgress
              stage={mockStage}
              progress={75}
              timeRemaining={5 * 60 * 1000}
            />
          </TrainingErrorBoundary>
        </Wrapper>
      );

      expect(screen.getByText(/progress: 75%/i)).toBeInTheDocument();
      expect(screen.getByText(/time remaining: 5:00/i)).toBeInTheDocument();
    });
  });
});

// Setup for DOM testing
beforeAll(() => {
  // Mock ResizeObserver if not available
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});