import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedErrorBoundary } from '../components/EnhancedErrorBoundary.js';
import { infrastructureFlags } from '../../shared/feature-flags.js';
import { useFeatureFlag } from '../hooks/use-feature-flag.js';

// Mock the feature flag hook
jest.mock('../hooks/use-feature-flag', () => ({
  useFeatureFlag: jest.fn()
}));

const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<typeof useFeatureFlag>;

describe('EnhancedErrorBoundary', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockUseFeatureFlag.mockReturnValue([true, jest.fn()]);
  });

  it('renders children when there is no error', () => {
    render(
      <EnhancedErrorBoundary>
        <div>Test Content</div>
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders fallback UI when there is an error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
      return null;
    };

    render(
      <EnhancedErrorBoundary>
        <ThrowError />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onError with metadata when an error occurs', () => {
    const onError = jest.fn();
    const error = new Error('Test error');

    const ThrowError = () => {
      throw error;
      return null;
    };

    render(
      <EnhancedErrorBoundary onError={onError}>
        <ThrowError />
      </EnhancedErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      error,
      expect.any(Object),
      expect.objectContaining({
        timestamp: expect.any(Number),
        component: expect.any(String),
        errorCode: expect.any(String),
        severity: 'medium',
        recoverable: true
      })
    );
  });

  it('falls back to legacy ErrorBoundary when feature flag is off', () => {
    mockUseFeatureFlag.mockReturnValue([false, jest.fn()]);

    render(
      <EnhancedErrorBoundary>
        <div>Test Content</div>
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});