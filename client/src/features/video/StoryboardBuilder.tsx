import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Trash2, Play, Plus, Camera, Clock, Sparkles } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

interface StoryboardScene {
  id: string;
  motionPrompt: string;
  duration: number;
  style?: string;
}

interface StoryboardBuilderProps {
  imageId?: number;
  onGenerate?: (storyboardId: string) => void;
  className?: string;
}

export function StoryboardBuilder({ imageId, onGenerate, className }: StoryboardBuilderProps) {
  const { toast } = useToast();
  const [scenes, setScenes] = useState<StoryboardScene[]>([
    { id: '1', motionPrompt: '', duration: 5 },
    { id: '2', motionPrompt: '', duration: 5 }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'sequential' | 'parallel'>('sequential');

  // Pre-defined motion presets for quick selection
  const motionPresets = [
    { label: 'Slow zoom in', prompt: 'Slow cinematic zoom in, maintaining focus' },
    { label: 'Gentle pan left', prompt: 'Smooth horizontal pan from right to left' },
    { label: 'Gentle pan right', prompt: 'Smooth horizontal pan from left to right' },
    { label: 'Subtle tilt up', prompt: 'Elegant upward tilt revealing more of the scene' },
    { label: 'Soft focus shift', prompt: 'Gradual shift in focus from foreground to background' },
    { label: 'Gentle rotation', prompt: 'Subtle clockwise rotation creating dynamic movement' },
    { label: 'Depth reveal', prompt: 'Camera movement revealing depth and layers in the scene' },
    { label: 'Portrait focus', prompt: 'Cinematic focus on subject with subtle background blur' }
  ];

  const addScene = useCallback(() => {
    if (scenes.length >= 3) {
      toast({
        title: 'Maximum scenes reached',
        description: 'Storyboards can have a maximum of 3 scenes',
        variant: 'destructive'
      });
      return;
    }

    const newScene: StoryboardScene = {
      id: Date.now().toString(),
      motionPrompt: '',
      duration: 5
    };
    setScenes(prev => [...prev, newScene]);
  }, [scenes.length, toast]);

  const removeScene = useCallback((sceneId: string) => {
    if (scenes.length <= 2) {
      toast({
        title: 'Minimum scenes required',
        description: 'Storyboards must have at least 2 scenes',
        variant: 'destructive'
      });
      return;
    }
    setScenes(prev => prev.filter(scene => scene.id !== sceneId));
  }, [scenes.length, toast]);

  const updateScene = useCallback((sceneId: string, updates: Partial<StoryboardScene>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ));
  }, []);

  const applyMotionPreset = useCallback((sceneId: string, preset: typeof motionPresets[0]) => {
    updateScene(sceneId, { motionPrompt: preset.prompt });
  }, [updateScene]);

  const validateScenes = useCallback((): string | null => {
    if (scenes.length < 2) return 'At least 2 scenes are required';
    if (scenes.length > 3) return 'Maximum 3 scenes allowed';
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.motionPrompt.trim()) {
        return `Scene ${i + 1} needs a motion description`;
      }
      if (scene.motionPrompt.length < 8) {
        return `Scene ${i + 1} motion description is too short (min 8 characters)`;
      }
      if (scene.duration < 1 || scene.duration > 12) {
        return `Scene ${i + 1} duration must be between 1-12 seconds`;
      }
    }
    return null;
  }, [scenes]);

  const generateStoryboard = useCallback(async () => {
    const validationError = validateScenes();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const payload = {
        scenes: scenes.map(scene => ({
          motionPrompt: scene.motionPrompt.trim(),
          duration: scene.duration,
          style: scene.style
        })),
        mode,
        ...(imageId && { imageId })
      };

      console.log('🎬 STORYBOARD UI: Generating storyboard', payload);

      const response = await fetch('/api/video/storyboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate storyboard');
      }

      const result = await response.json();
      
      toast({
        title: 'Storyboard Started! 🎬',
        description: `${result.sceneCount} scenes are being generated. Estimated time: ${result.estimatedTime}`,
      });

      if (onGenerate) {
        onGenerate(result.storyboardId);
      }

    } catch (error) {
      console.error('Storyboard generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [scenes, mode, imageId, validateScenes, onGenerate, toast]);

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-black/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera className="h-6 w-6 text-black" />
              <CardTitle className="text-xl font-bold text-black">Multi-Scene Storyboard</CardTitle>
              <Badge variant="secondary" className="bg-black/5 text-black/70 border-black/10">
                {scenes.length} scene{scenes.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm text-black/60">
              <Clock className="h-4 w-4" />
              <span>{totalDuration}s total</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scenes */}
      <div className="space-y-4">
        {scenes.map((scene, index) => (
          <Card key={scene.id} className="border-black/10 hover:border-black/20 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-black/20 text-black/70">
                    Scene {index + 1}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-black/50" />
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={scene.duration}
                      onChange={(e) => updateScene(scene.id, { duration: parseInt(e.target.value) || 5 })}
                      className="w-16 h-7 text-xs border-black/10"
                    />
                    <span className="text-xs text-black/50">seconds</span>
                  </div>
                </div>
                {scenes.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScene(scene.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Motion Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80">Motion Description</label>
                <Textarea
                  placeholder="Describe the camera movement or action for this scene..."
                  value={scene.motionPrompt}
                  onChange={(e) => updateScene(scene.id, { motionPrompt: e.target.value })}
                  className="min-h-[80px] border-black/10 focus:border-black/30 resize-none"
                />
                <div className="text-xs text-black/50">
                  {scene.motionPrompt.length}/200 characters
                </div>
              </div>

              {/* Motion Presets */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {motionPresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => applyMotionPreset(scene.id, preset)}
                      className="text-xs border-black/20 hover:bg-black/5 hover:border-black/30"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Scene Button */}
      {scenes.length < 3 && (
        <Card className="border-dashed border-black/20 hover:border-black/30 transition-colors">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              onClick={addScene}
              className="w-full border-dashed border-black/20 hover:bg-black/5 hover:border-black/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Scene {scenes.length + 1}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card className="border-black/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-black/80">Composition Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black/80">Mode</label>
              <div className="flex space-x-3">
                <Button
                  variant={mode === 'sequential' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('sequential')}
                  className={mode === 'sequential' ? 'bg-black text-white' : 'border-black/20'}
                >
                  Sequential
                </Button>
                <Button
                  variant={mode === 'parallel' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('parallel')}
                  className={mode === 'parallel' ? 'bg-black text-white' : 'border-black/20'}
                >
                  Parallel
                </Button>
              </div>
              <div className="text-xs text-black/50">
                {mode === 'sequential' 
                  ? 'Scenes play one after another with smooth transitions'
                  : 'All scenes generated in parallel, then composed'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={generateStoryboard}
          disabled={isGenerating || !scenes.every(s => s.motionPrompt.trim().length >= 8)}
          className="bg-black text-white hover:bg-black/90 px-8 py-3 text-base font-medium"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Generating Storyboard...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generate {scenes.length}-Scene Video
            </>
          )}
        </Button>
      </div>

      {/* Feature Info */}
      <Card className="border-black/5 bg-black/2">
        <CardContent className="p-4">
          <div className="text-xs text-black/60 space-y-1">
            <p>• Chain 2-3 short motion sequences into one coherent video clip</p>
            <p>• Each scene can be 1-12 seconds with custom camera movements</p>
            <p>• Uses your trained AI model for personalized generation</p>
            <p>• Automatic composition with smooth transitions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
