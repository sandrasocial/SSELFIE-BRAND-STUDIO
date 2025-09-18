/**
 * Image Inpainting Editor
 * Canvas-based mask editor with brush/erase tools for inpainting
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';

interface ImageInpaintProps {
  imageUrl: string;
  imageId: number;
  onClose: () => void;
  onInpaintComplete?: (resultUrl: string) => void;
}

interface InpaintProgress {
  predictionId: string;
  variantId: number;
  status: 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

export default function ImageInpaint({ 
  imageUrl, 
  imageId, 
  onClose, 
  onInpaintComplete 
}: ImageInpaintProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // Image dimensions
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // Inpainting progress
  const [inpaintProgress, setInpaintProgress] = useState<InpaintProgress | null>(null);
  
  // History for undo functionality
  const [maskHistory, setMaskHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas and load image
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !maskCanvas || !image) return;

    // Load the image
    const loadImage = () => {
      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      
      if (!ctx || !maskCtx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Set canvas dimensions
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Scale down if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        maskCanvas.width = width;
        maskCanvas.height = height;
        
        setImageDimensions({ width, height });
        
        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Initialize mask canvas with transparent background
        maskCtx.fillStyle = 'rgba(0,0,0,0)';
        maskCtx.fillRect(0, 0, width, height);
        
        // Save initial state
        saveToHistory();
      };
      
      img.src = imageUrl;
    };

    loadImage();
  }, [imageUrl]);

  // Save current mask state to history
  const saveToHistory = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const dataUrl = maskCanvas.toDataURL();
    const newHistory = maskHistory.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    
    setMaskHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [maskHistory, historyIndex]);

  // Get mouse/touch position relative to canvas
  const getEventPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || 0;
      clientY = e.touches[0]?.clientY || 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const pos = getEventPos(e);
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = isErasing ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
    ctx.fill();
  }, [isErasing, brushSize, getEventPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const pos = getEventPos(e);
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [isDrawing, isErasing, brushSize, getEventPos]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    
    const prevIndex = historyIndex - 1;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(prevIndex);
    };
    img.src = maskHistory[prevIndex];
  }, [historyIndex, maskHistory]);

  // Reset mask
  const resetMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    saveToHistory();
  }, [saveToHistory]);

  // Download mask
  const downloadMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    // Create a link and download
    const link = document.createElement('a');
    link.download = 'inpaint-mask.png';
    link.href = maskCanvas.toDataURL();
    link.click();
  }, []);

  // Start inpainting mutation
  const inpaintMutation = useMutation({
    mutationFn: async (data: { maskPng: string; prompt: string }) => {
      return await apiFetch('/inpaint', {
        method: 'POST',
        body: JSON.stringify({
          imageId,
          maskPng: data.maskPng,
          prompt: data.prompt
        })
      });
    },
    onSuccess: (data) => {
      setInpaintProgress({
        predictionId: data.predictionId,
        variantId: data.variantId,
        status: 'processing'
      });
    },
    onError: (error) => {
      console.error('Error starting inpainting:', error);
    }
  });

  // Poll for inpainting status
  const { data: statusData } = useQuery({
    queryKey: ['/api/inpaint/status', inpaintProgress?.predictionId],
    queryFn: async () => {
      if (!inpaintProgress) return null;
      return await apiFetch(`/inpaint/${inpaintProgress.predictionId}/status?variantId=${inpaintProgress.variantId}`);
    },
    enabled: !!inpaintProgress && inpaintProgress.status === 'processing',
    refetchInterval: 2000,
  });

  // Update inpaint progress based on status
  useEffect(() => {
    if (statusData && inpaintProgress) {
      if (statusData.status === 'completed' && statusData.imageUrl) {
        setInpaintProgress({
          ...inpaintProgress,
          status: 'completed',
          imageUrl: statusData.imageUrl
        });
        onInpaintComplete?.(statusData.imageUrl);
        queryClient.invalidateQueries({ queryKey: ['/api/gallery-images'] });
      } else if (statusData.status === 'failed') {
        setInpaintProgress({
          ...inpaintProgress,
          status: 'failed',
          error: statusData.error
        });
      }
    }
  }, [statusData, inpaintProgress, onInpaintComplete, queryClient]);

  // Start inpainting process
  const handleInpaint = useCallback(async () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !prompt.trim()) return;
    
    // Convert mask to base64 PNG
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    const base64Data = maskDataUrl.split(',')[1];
    
    inpaintMutation.mutate({
      maskPng: base64Data,
      prompt: prompt.trim()
    });
  }, [prompt, inpaintMutation]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-6xl max-h-[95vh] w-full flex flex-col rounded-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Inpaint Editor (Beta)</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-600 hover:text-gray-800"
            aria-label="Close editor"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Canvas Area */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center bg-gray-50">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 border border-gray-300 rounded"
                style={{ maxWidth: '100%', maxHeight: '60vh' }}
              />
              <canvas
                ref={maskCanvasRef}
                className="relative border border-gray-300 rounded cursor-crosshair opacity-75"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '60vh',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            
            {/* Instructions */}
            <div className="mt-4 text-sm text-gray-600 text-center max-w-lg">
              <p>Paint over the areas you want to modify in white. Use the eraser to remove mask areas.</p>
              <p className="mt-1">The AI will replace the masked regions based on your prompt.</p>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-80 p-4 border-l bg-white flex flex-col">
            
            {/* Brush Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brush Size: {brushSize}px</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsErasing(false)}
                  className={`flex-1 py-2 px-4 rounded ${
                    !isErasing 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🎨 Brush
                </button>
                <button
                  onClick={() => setIsErasing(true)}
                  className={`flex-1 py-2 px-4 rounded ${
                    isErasing 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🧹 Erase
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={resetMask}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded"
                >
                  🗑️ Reset
                </button>
              </div>

              <button
                onClick={downloadMask}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded"
              >
                ⬇️ Download Mask
              </button>
            </div>

            {/* Prompt Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Inpainting Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to replace the masked area with..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                disabled={inpaintProgress?.status === 'processing'}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {inpaintProgress?.status === 'processing' && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">Processing inpainting...</span>
                  </div>
                </div>
              )}

              {inpaintProgress?.status === 'failed' && (
                <div className="text-red-600 text-sm text-center">
                  Error: {inpaintProgress.error}
                </div>
              )}

              {inpaintProgress?.status === 'completed' && inpaintProgress.imageUrl && (
                <div className="text-green-600 text-sm text-center">
                  ✅ Inpainting completed! Check your gallery.
                </div>
              )}

              <button
                onClick={handleInpaint}
                disabled={
                  !prompt.trim() || 
                  inpaintMutation.isPending || 
                  inpaintProgress?.status === 'processing'
                }
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                {inpaintMutation.isPending ? 'Starting...' : '✨ Start Inpainting'}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden image element for loading */}
      <img ref={imageRef} className="hidden" alt="" />
    </div>
  );
}