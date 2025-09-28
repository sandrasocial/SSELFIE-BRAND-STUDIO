import { renderHook, act } from '@testing-library/react';
import { useStorage } from '../hooks/use-storage.js';
import { useFeatureFlag } from '../hooks/use-feature-flag.js';
import { infrastructureFlags } from '../../shared/feature-flags.js';

// Mock the feature flag hook
jest.mock('../hooks/use-feature-flag', () => ({
  useFeatureFlag: jest.fn()
}));

const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<typeof useFeatureFlag>;

describe('useStorage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockUseFeatureFlag.mockReturnValue([true, jest.fn()]);

    // Mock storage implementation
    window.__ENHANCED_STORAGE__ = {
      upload: jest.fn().mockResolvedValue({ success: true, url: 'test-url' }),
      download: jest.fn().mockResolvedValue(new Blob(['test'])),
      delete: jest.fn().mockResolvedValue({ success: true }),
      list: jest.fn().mockResolvedValue([]),
      getPublicUrl: jest.fn().mockReturnValue('test-url')
    };
  });

  it('should handle file upload successfully', async () => {
    const onProgress = jest.fn();
    const { result } = renderHook(() => useStorage({ onProgress }));

    const file = new File(['test'], 'test.txt');
    let uploadResult;

    await act(async () => {
      uploadResult = await result.current.upload(file, 'test/path');
    });

    expect(uploadResult).toEqual({ success: true, url: 'test-url' });
    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(100);
    expect(result.current.error).toBeNull();
  });

  it('should handle upload errors', async () => {
    const error = 'Upload failed';
    window.__ENHANCED_STORAGE__!.upload = jest.fn().mockRejectedValue(new Error(error));
    
    const onError = jest.fn();
    const { result } = renderHook(() => useStorage({ onError }));

    const file = new File(['test'], 'test.txt');
    let uploadResult;

    await act(async () => {
      uploadResult = await result.current.upload(file, 'test/path');
    });

    expect(uploadResult).toEqual({ success: false, error });
    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should fall back to legacy storage when feature flag is off', async () => {
    mockUseFeatureFlag.mockReturnValue([false, jest.fn()]);

    window.__LEGACY_STORAGE__ = {
      upload: jest.fn().mockResolvedValue({ success: true, url: 'legacy-url' }),
      download: jest.fn().mockResolvedValue(new Blob(['legacy'])),
      delete: jest.fn().mockResolvedValue({ success: true }),
      list: jest.fn().mockResolvedValue([]),
      getPublicUrl: jest.fn().mockReturnValue('legacy-url')
    };

    const { result } = renderHook(() => useStorage());

    const file = new File(['test'], 'test.txt');
    let uploadResult;

    await act(async () => {
      uploadResult = await result.current.upload(file, 'test/path');
    });

    expect(uploadResult).toEqual({ success: true, url: 'legacy-url' });
    expect(window.__LEGACY_STORAGE__?.upload).toHaveBeenCalled();
  });
});