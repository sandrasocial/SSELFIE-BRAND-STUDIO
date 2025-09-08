/**
 * PHASE 3D: Frontend Canvas Preview Component
 * Real-time text overlay preview with brand color integration and luxury typography
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasPreviewProps {
  imageUrl: string;
  userId: string;
  userBrandContext: {
    profession?: string;
    brandStyle?: string;
    photoGoals?: string;
    industry?: string;
  };
  onBrandedPostCreate?: (brandedPostUrl: string) => void;
  className?: string;
}

interface TextOption {
  text: string;
  messageType: 'motivational' | 'business' | 'lifestyle';
  confidence: number;
}

interface OverlaySettings {
  position: 'upper-third' | 'lower-third' | 'center' | 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right';
  overlayType: 'dark' | 'light' | 'brand-color' | 'none';
  overlayOpacity: number;
  fontSize: number;
  textColor: string;
}

export function CanvasPreview({ 
  imageUrl, 
  userId, 
  userBrandContext, 
  onBrandedPostCreate,
  className 
}: CanvasPreviewProps) {
  // State management
  const [textOptions, setTextOptions] = useState<TextOption[]>([]);
  const [selectedText, setSelectedText] = useState<string>('');
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>({
    position: 'lower-third',
    overlayType: 'dark',
    overlayOpacity: 0.4,
    fontSize: 48,
    textColor: '#FFFFFF'
  });
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  
  // Loading states
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(true);
  
  // Canvas ref for preview
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize: Analyze image and generate initial text
  useEffect(() => {
    if (imageUrl) {
      analyzeImageAndGenerateText();
    }
  }, [imageUrl]);

  // Re-render canvas when settings change
  useEffect(() => {
    if (selectedText && imageRef.current) {
      renderCanvasPreview();
    }
  }, [selectedText, overlaySettings]);

  /**
   * Analyze image and generate initial text options
   */
  const analyzeImageAndGenerateText = async () => {
    try {
      setIsAnalyzingImage(true);
      
      // Analyze image for optimal placement
      const analysisResponse = await fetch('/api/maya/analyze-image-placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      
      if (analysisResponse.ok) {
        const analysis = await analysisResponse.json();
        setImageAnalysis(analysis);
        
        // Update overlay settings based on analysis
        setOverlaySettings(prev => ({
          ...prev,
          position: analysis.recommendations?.textPosition || 'lower-third',
          overlayType: analysis.recommendations?.overlayType || 'dark',
          overlayOpacity: analysis.recommendations?.overlayOpacity || 0.4,
          fontSize: analysis.recommendations?.fontSize || 48,
          textColor: analysis.recommendations?.textColor || '#FFFFFF'
        }));
      }
      
      // Generate initial text options
      await generateTextOptions('motivational');
      
    } catch (error) {
      console.error('Image analysis error:', error);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  /**
   * Generate text options using Maya's brand voice system
   */
  const generateTextOptions = async (messageType: string = 'motivational') => {
    try {
      setIsGeneratingText(true);
      
      const response = await fetch('/api/maya/generate-text-overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          messageType,
          regenerate: textOptions.length > 0 // Flag for regeneration
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.textOptions && data.textOptions.length > 0) {
          setTextOptions(data.textOptions);
          setSelectedText(data.textOptions[0].text); // Auto-select first option
        }
      }
      
    } catch (error) {
      console.error('Text generation error:', error);
    } finally {
      setIsGeneratingText(false);
    }
  };

  /**
   * Real-time canvas preview rendering
   */
  const renderCanvasPreview = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !selectedText) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Scale for display
    const scale = Math.min(400 / image.naturalWidth, 300 / image.naturalHeight);
    canvas.style.width = `${image.naturalWidth * scale}px`;
    canvas.style.height = `${image.naturalHeight * scale}px`;
    
    // Clear and draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    
    // Apply overlay
    applyOverlayToCanvas(ctx, canvas.width, canvas.height);
    
    // Draw text
    drawTextToCanvas(ctx, canvas.width, canvas.height);
  };

  /**
   * Apply overlay to canvas for readability
   */
  const applyOverlayToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (overlaySettings.overlayType === 'none') return;
    
    const overlayHeight = Math.floor(height * 0.3);
    let overlayY: number;
    
    switch (overlaySettings.position) {
      case 'upper-third':
        overlayY = 0;
        break;
      case 'lower-third':
        overlayY = height - overlayHeight;
        break;
      case 'center':
        overlayY = (height - overlayHeight) / 2;
        break;
      default:
        overlayY = height - overlayHeight;
    }
    
    // Create gradient overlay
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    const baseColor = overlaySettings.overlayType === 'dark' ? '0, 0, 0' : '255, 255, 255';
    
    gradient.addColorStop(0, `rgba(${baseColor}, 0)`);
    gradient.addColorStop(0.3, `rgba(${baseColor}, ${overlaySettings.overlayOpacity})`);
    gradient.addColorStop(0.7, `rgba(${baseColor}, ${overlaySettings.overlayOpacity})`);
    gradient.addColorStop(1, `rgba(${baseColor}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, width, overlayHeight);
  };

  /**
   * Draw text to canvas with luxury typography
   */
  const drawTextToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Configure luxury typography
    ctx.font = `bold ${overlaySettings.fontSize}px "Times New Roman", serif`;
    ctx.fillStyle = overlaySettings.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for readability
    ctx.shadowColor = overlaySettings.textColor === '#FFFFFF' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Calculate text position
    let x = width / 2;
    let y: number;
    
    switch (overlaySettings.position) {
      case 'upper-third':
        y = height * 0.15;
        break;
      case 'lower-third':
        y = height * 0.85;
        break;
      case 'center':
        y = height / 2;
        break;
      default:
        y = height * 0.85;
    }
    
    // Draw text with word wrapping
    const words = selectedText.split(' ');
    const maxWidth = width * 0.8;
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Draw each line
    const lineHeight = overlaySettings.fontSize * 1.2;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  };

  /**
   * Create final branded post
   */
  const createBrandedPost = async () => {
    if (!selectedText) return;
    
    try {
      setIsCreatingPost(true);
      
      const response = await fetch('/api/maya/create-branded-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          imageUrl,
          text: selectedText,
          messageType: textOptions.find(opt => opt.text === selectedText)?.messageType || 'motivational',
          platform: 'instagram',
          overlayOptions: overlaySettings
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        onBrandedPostCreate?.(data.brandedPostUrl);
      }
      
    } catch (error) {
      console.error('Branded post creation error:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  if (isAnalyzingImage) {
    return (
      <Card className={cn("p-6 flex items-center justify-center min-h-[400px]", className)}>
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing image for optimal text placement...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      {/* Image Preview with Canvas Overlay */}
      <div className="relative">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Base image"
          className="hidden"
          onLoad={() => renderCanvasPreview()}
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          className="w-full max-w-sm mx-auto rounded-lg shadow-lg bg-gray-50"
        />
        
        {/* Analysis Badge */}
        {imageAnalysis && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            <Eye className="h-3 w-3 mr-1" />
            {imageAnalysis.imageAnalysis?.brightness > 128 ? 'Bright Image' : 'Dark Image'}
          </Badge>
        )}
      </div>

      {/* Text Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Choose Your Text</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTextOptions()}
            disabled={isGeneratingText}
          >
            {isGeneratingText ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Try Different Text
          </Button>
        </div>
        
        <div className="grid gap-2">
          {textOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedText(option.text)}
              className={cn(
                "p-3 text-left rounded-lg border transition-colors",
                selectedText === option.text
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="font-medium">{option.text}</div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">
                {option.messageType} • {Math.round(option.confidence * 100)}% match
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay Controls */}
      <div className="space-y-4">
        <h3 className="font-semibold">Customize Overlay</h3>
        
        {/* Position */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Position</label>
          <div className="grid grid-cols-3 gap-2">
            {['upper-third', 'center', 'lower-third'].map((pos) => (
              <Button
                key={pos}
                variant={overlaySettings.position === pos ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOverlaySettings(prev => ({ ...prev, position: pos as any }))}
              >
                {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Overlay Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Overlay Style</label>
          <div className="grid grid-cols-3 gap-2">
            {['dark', 'light', 'none'].map((type) => (
              <Button
                key={type}
                variant={overlaySettings.overlayType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOverlaySettings(prev => ({ 
                  ...prev, 
                  overlayType: type as any,
                  textColor: type === 'dark' ? '#FFFFFF' : type === 'light' ? '#000000' : prev.textColor
                }))}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Opacity Control */}
        {overlaySettings.overlayType !== 'none' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Overlay Opacity: {Math.round(overlaySettings.overlayOpacity * 100)}%
            </label>
            <Slider
              value={[overlaySettings.overlayOpacity]}
              onValueChange={([value]) => setOverlaySettings(prev => ({ ...prev, overlayOpacity: value }))}
              min={0.1}
              max={0.8}
              step={0.1}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Create Final Post */}
      <Button
        onClick={createBrandedPost}
        disabled={!selectedText || isCreatingPost}
        className="w-full"
        size="lg"
      >
        {isCreatingPost ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Create Branded Post
      </Button>
    </Card>
  );
}