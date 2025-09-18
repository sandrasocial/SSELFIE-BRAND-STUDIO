import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VideoGenerateDialog } from '../features/video';
import { apiRequest } from '../lib/queryClient';

// Mock the API request
jest.mock('../lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProvider = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('VideoGenerateDialog Integration', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    imageId: '123',
    imageUrl: 'https://example.com/test-image.jpg',
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the dialog when open', () => {
    renderWithProvider(<VideoGenerateDialog {...defaultProps} />);
    
    expect(screen.getByText('Generate Video with VEO 3')).toBeInTheDocument();
    expect(screen.getByText('Source Image')).toBeInTheDocument();
    expect(screen.getByText('Motion Prompt')).toBeInTheDocument();
  });

  it('should display the source image', () => {
    renderWithProvider(<VideoGenerateDialog {...defaultProps} />);
    
    const sourceImage = screen.getByAltText('Source image');
    expect(sourceImage).toBeInTheDocument();
    expect(sourceImage).toHaveAttribute('src', defaultProps.imageUrl);
  });

  it('should handle video generation flow', async () => {
    // Mock successful API responses
    mockApiRequest
      .mockResolvedValueOnce({ // presets call
        presets: {
          preview: { maxDurationSeconds: 5, resolution: '720p', steps: 25, description: 'Fast preview' },
          production: { maxDurationSeconds: 30, resolution: '1080p', steps: 50, description: 'High quality' }
        }
      })
      .mockResolvedValueOnce({ // generate call
        jobId: 'test-job-123',
        videoId: 'test-video-123',
        provider: 'veo-3',
        estimatedTime: '2-5 minutes',
        mode: 'preview',
        qualityPreset: { maxDurationSeconds: 5, resolution: '720p', steps: 25, description: 'Fast preview' }
      })
      .mockResolvedValue({ // status polling
        status: 'completed',
        progress: 100,
        videoUrl: 'https://example.com/generated-video.mp4'
      });

    renderWithProvider(<VideoGenerateDialog {...defaultProps} />);

    // Wait for presets to load
    await waitFor(() => {
      expect(screen.getByText('Fast preview (5s, 720p)')).toBeInTheDocument();
    });

    // Fill in motion prompt
    const motionPromptTextarea = screen.getByPlaceholderText('Describe the motion and action you want in your video...');
    fireEvent.change(motionPromptTextarea, { target: { value: 'A gentle smile and head turn to the camera' } });

    // Start generation
    const generateButton = screen.getByText('Generate Video');
    expect(generateButton).not.toBeDisabled();
    fireEvent.click(generateButton);

    // Check API call was made with correct data
    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/api/video/generate', 'POST', {
        imageId: '123',
        motionPrompt: 'A gentle smile and head turn to the camera',
        mode: 'preview',
        aspectRatio: '9:16'
      });
    });

    // Wait for completion
    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('should handle generation errors', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ presets: {} }) // presets
      .mockRejectedValueOnce(new Error('Generation failed'));

    renderWithProvider(<VideoGenerateDialog {...defaultProps} />);

    const motionPromptTextarea = screen.getByPlaceholderText('Describe the motion and action you want in your video...');
    fireEvent.change(motionPromptTextarea, { target: { value: 'Test motion prompt' } });

    const generateButton = screen.getByText('Generate Video');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });
  });

  it('should validate motion prompt length', () => {
    renderWithProvider(<VideoGenerateDialog {...defaultProps} />);

    const motionPromptTextarea = screen.getByPlaceholderText('Describe the motion and action you want in your video...');
    fireEvent.change(motionPromptTextarea, { target: { value: 'short' } });

    const generateButton = screen.getByText('Generate Video');
    expect(generateButton).toBeDisabled();

    fireEvent.change(motionPromptTextarea, { target: { value: 'A longer motion prompt that meets the minimum requirements' } });
    expect(generateButton).not.toBeDisabled();
  });

  it('should close when onClose is called', () => {
    renderWithProvider(<VideoGenerateDialog {...defaultProps} />);
    
    // Dialog should be open
    expect(screen.getByText('Generate Video with VEO 3')).toBeInTheDocument();
    
    // Close the dialog
    renderWithProvider(<VideoGenerateDialog {...defaultProps} isOpen={false} />);
    
    // Dialog should be closed
    expect(screen.queryByText('Generate Video with VEO 3')).not.toBeInTheDocument();
  });
});
