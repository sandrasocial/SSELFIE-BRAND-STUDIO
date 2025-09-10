import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useToast } from '../../hooks/use-toast';
import { useBrandStudio } from '../../pages/BrandStudioPage';
import { DirectorPanel } from './DirectorPanel';
import { CanvasPanel, SceneCard } from './CanvasPanel';
import { ToolkitPanel, QuickActions, StatusDisplay } from './ToolkitPanel';
import { useMutation, useQuery } from '@tanstack/react-query';

interface StoryScene {
  id: string;
  scene: number;
  prompt: string;
  imageFile?: File;
  imageName?: string;
}

interface StoryProject {
  id: string;
  name: string;
  description: string;
  scenes: StoryScene[];
  format: '9:16' | '16:9';
  status: 'draft' | 'generating' | 'completed';
  videoUrl?: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: string;
  scenes?: StoryScene[];
}

interface StoryStudioProps {
  panelMode?: 'director' | 'canvas' | 'toolkit';
  isMobile?: boolean;
}

export const StoryStudio: React.FC<StoryStudioProps> = ({ panelMode, isMobile = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { handoffData, clearHandoffData, selectedItem, setSelectedItem } = useBrandStudio();
  
  // State management
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentProject, setCurrentProject] = useState<StoryProject | null>(null);
  const [selectedScene, setSelectedScene] = useState<StoryScene | null>(null);
  const [videoFormat, setVideoFormat] = useState<'9:16' | '16:9'>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if mobile (use prop if provided, otherwise detect)
  const [detectedMobile, setDetectedMobile] = useState(window.innerWidth < 768);
  const isMobileState = isMobile !== undefined ? isMobile : detectedMobile;
  
  useEffect(() => {
    const handleResize = () => setDetectedMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle handoff from Photo Studio
  useEffect(() => {
    if (handoffData?.fromPhoto && handoffData?.conceptCard) {
      const conceptCard = handoffData.conceptCard;
      console.log('🎬 Story Studio: Received handoff from Photo Studio:', conceptCard.title);
      
      // Create initial project from concept card
      const newProject: StoryProject = {
        id: `project_${Date.now()}`,
        name: `Video Story: ${conceptCard.title.replace(/[✨💫🔥🌟💎🌅🏢💼🌊👑💃📸🎬♦️🚖]/g, '').trim()}`,
        description: conceptCard.description,
        scenes: [
          {
            id: 'scene_1',
            scene: 1,
            prompt: `Opening scene based on: ${conceptCard.description}`
          },
          {
            id: 'scene_2', 
            scene: 2,
            prompt: 'Continuation of the story...'
          },
          {
            id: 'scene_3',
            scene: 3,
            prompt: 'Closing scene with impact...'
          }
        ],
        format: '9:16',
        status: 'draft',
        createdAt: new Date().toISOString()
      };

      setCurrentProject(newProject);
      
      // Add welcome message about handoff
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'maya',
        content: `Perfect! I've created a video story structure based on your photo concept "${conceptCard.title}". I've set up 3 scenes to tell your brand story effectively. You can edit the scene descriptions or add inspiration images to guide the video generation.`,
        timestamp: new Date().toISOString(),
        scenes: newProject.scenes
      };

      setMessages([welcomeMessage]);
      clearHandoffData();
      
      toast({
        title: "Project Created from Photo Concept",
        description: "Your story structure is ready for customization"
      });
    }
  }, [handoffData, clearHandoffData, toast]);

  // Initialize empty project for new users
  useEffect(() => {
    if (!handoffData && !currentProject && messages.length === 0) {
      const emptyProject: StoryProject = {
        id: `project_${Date.now()}`,
        name: 'New Story Project',
        description: '',
        scenes: [
          { id: 'scene_1', scene: 1, prompt: '' },
          { id: 'scene_2', scene: 2, prompt: '' },
          { id: 'scene_3', scene: 3, prompt: '' }
        ],
        format: '9:16',
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      setCurrentProject(emptyProject);
    }
  }, [handoffData, currentProject, messages.length]);

  // Panel-specific rendering for three-panel layout
  if (panelMode) {
    if (panelMode === 'director') {
      return (
        <div className="h-full flex flex-col">
          <div className="panel-header" style={{ 
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            color: 'white',
            padding: '20px',
            position: 'relative',
            zIndex: 10
          }}>
            <h3 className="text-lg font-light tracking-[0.3em] uppercase">The Director</h3>
            <p className="text-xs opacity-75 mt-1">Story Strategy</p>
          </div>
          <div className="flex-1">
            <DirectorPanel
              mode="story"
              messages={messages}
              isTyping={isTyping}
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              disabled={isGenerating}
              placeholder="Tell me about the story you want to create..."
              className="border-none rounded-none h-full"
            />
          </div>
        </div>
      );
    }
    
    if (panelMode === 'canvas') {
      return (
        <div className="h-full flex flex-col">
          <div className="panel-header" style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h3 className="text-lg font-light tracking-[0.3em] uppercase">The Canvas</h3>
            <p className="text-xs text-gray-500 mt-1">Story Storyboard</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {currentProject?.scenes && currentProject.scenes.length > 0 ? (
              <div className="p-6 space-y-6">
                {currentProject.scenes.map((scene) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    onUpdatePrompt={(prompt) => handleUpdateScene(scene.id, prompt)}
                    onAddImage={(file) => handleAddImage(scene.id, file)}
                    onSelect={() => {
                      setSelectedScene(scene);
                      setSelectedItem(scene);
                    }}
                    isSelected={selectedScene?.id === scene.id}
                    hasImage={!!scene.imageFile}
                    imageName={scene.imageName}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <div className="text-6xl mb-4">🎬</div>
                  <h4 className="text-xl font-light tracking-[0.2em] uppercase mb-4">Your Story Canvas</h4>
                  <p className="text-gray-600 max-w-md">Start a conversation with Maya to create compelling video stories for your brand</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (panelMode === 'toolkit') {
      return (
        <div className="h-full flex flex-col">
          <div className="panel-header" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            position: 'relative',
            zIndex: 10
          }}>
            <h3 className="text-lg font-light tracking-[0.3em] uppercase">The Toolkit</h3>
            <p className="text-xs opacity-75 mt-1">Video Actions</p>
          </div>
          <div className="flex-1">
            <ToolkitPanel
              mode="story"
              selectedItem={selectedScene || selectedItem}
              onItemAction={handleToolkitAction}
              className="border-none rounded-none h-full"
            >
              <QuickActions mode="story" onAction={handleToolkitAction} />
              <StatusDisplay mode="story" stats={{ scenes: currentProject?.scenes.length || 0, videos: 0 }} />
            </ToolkitPanel>
          </div>
        </div>
      );
    }
  }

  // Scene Director Chat - Generate scene ideas
  const generateScenes = useMutation({
    mutationFn: async (messageContent: string) => {
      const response = await fetch('/api/story/generate-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          message: messageContent,
          currentProject: currentProject
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenes');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.scenes) {
        const updatedProject = {
          ...currentProject!,
          scenes: data.scenes,
          name: data.projectName || currentProject!.name,
          description: data.description || currentProject!.description
        };
        setCurrentProject(updatedProject);
        
        addMessage({
          type: 'maya',
          content: data.response || 'I\'ve created your story scenes! Review and edit them as needed.',
          timestamp: new Date().toISOString(),
          scenes: data.scenes
        });
      }
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({ title: "Scene Generation Failed", description: "Please try again." });
    }
  });

  // Generate video from current project
  const generateVideo = useMutation({
    mutationFn: async () => {
      if (!currentProject) throw new Error('No project available');
      
      const response = await fetch('/api/story/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project: currentProject,
          format: videoFormat
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      return response.json();
    },
    onMutate: () => {
      setIsGenerating(true);
      if (currentProject) {
        setCurrentProject({
          ...currentProject,
          status: 'generating'
        });
      }
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      if (currentProject) {
        setCurrentProject({
          ...currentProject,
          status: 'completed',
          videoUrl: data.videoUrl
        });
      }
      
      toast({
        title: "Video Generated Successfully!",
        description: "Your brand story video is ready"
      });
    },
    onError: () => {
      setIsGenerating(false);
      if (currentProject) {
        setCurrentProject({
          ...currentProject,
          status: 'draft'
        });
      }
      toast({ title: "Video Generation Failed", description: "Please try again." });
    }
  });

  // Add message helper
  const addMessage = (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      ...message
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Send message to Scene Director
  const handleSendMessage = () => {
    if (!message.trim() || isTyping) return;

    addMessage({
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    });

    setIsTyping(true);
    generateScenes.mutate(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Update scene prompt
  const updateScenePrompt = (sceneId: string, prompt: string) => {
    if (!currentProject) return;
    
    const updatedScenes = currentProject.scenes.map(scene =>
      scene.id === sceneId ? { ...scene, prompt } : scene
    );
    
    setCurrentProject({
      ...currentProject,
      scenes: updatedScenes
    });
  };

  // Add inspiration image to scene
  const addSceneImage = (sceneId: string, file: File) => {
    if (!currentProject) return;
    
    const updatedScenes = currentProject.scenes.map(scene =>
      scene.id === sceneId 
        ? { ...scene, imageFile: file, imageName: file.name }
        : scene
    );
    
    setCurrentProject({
      ...currentProject,
      scenes: updatedScenes
    });

    toast({
      title: "Inspiration Image Added",
      description: `Added to Scene ${currentProject.scenes.find(s => s.id === sceneId)?.scene}`
    });
  };

  // Handle toolkit actions
  const handleToolkitAction = (action: string, data?: any) => {
    switch (action) {
      case 'format':
        setVideoFormat(data as '9:16' | '16:9');
        toast({
          title: "Format Updated",
          description: `Video format set to ${data === '9:16' ? 'Portrait (Social Media)' : 'Landscape (Website)'}`
        });
        break;
      case 'generate-story':
        if (currentProject && currentProject.scenes.some(s => s.prompt.trim())) {
          generateVideo.mutate();
        } else {
          toast({
            title: "Scenes Required",
            description: "Please add descriptions to at least one scene"
          });
        }
        break;
      case 'clear-scenes':
        if (currentProject) {
          const clearedProject = {
            ...currentProject,
            scenes: currentProject.scenes.map(scene => ({
              ...scene,
              prompt: '',
              imageFile: undefined,
              imageName: undefined
            }))
          };
          setCurrentProject(clearedProject);
          toast({ title: "Scenes Cleared", description: "Ready for new content" });
        }
        break;
      case 'save-project':
        // TODO: Implement project saving to database
        toast({ title: "Project Saved", description: "Story project saved to drafts" });
        break;
    }
  };

  // Calculate stats
  const stats = {
    scenes: currentProject?.scenes.length || 0,
    videos: currentProject?.status === 'completed' ? 1 : 0
  };


  return (
    <>
      {isMobileState ? (
        // Mobile Layout
        <CanvasPanel mode="story" onItemSelect={setSelectedScene} selectedItem={selectedScene}>
          {/* Welcome State */}
          {!currentProject && messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl mb-6" style={{ 
                fontFamily: 'Times New Roman, serif', 
                fontWeight: 200, 
                letterSpacing: '0.2em',
                lineHeight: 1.2
              }}>
                CREATE YOUR
                <br />
                BRAND STORY VIDEO
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                Tell me what story you want to create and I'll structure it into scenes for video generation.
              </p>

              <div className="space-y-3">
                {[
                  "Behind-the-scenes of my business journey",
                  "Professional day-in-the-life content",
                  "Brand introduction for social media"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion)}
                    className="w-full text-left px-4 py-3 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project Header */}
          {currentProject && (
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
              <h3 className="spaced-title text-sm mb-2">{currentProject.name}</h3>
              <p className="text-xs text-gray-600">{currentProject.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-gray-500">Format: {videoFormat === '9:16' ? 'Portrait' : 'Landscape'}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  currentProject.status === 'completed' ? 'bg-green-100 text-green-800' :
                  currentProject.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                </span>
              </div>
            </div>
          )}

          {/* Scene Cards */}
          {currentProject && (
            <div className="space-y-4">
              <h3 className="spaced-title text-sm">Story Scenes</h3>
              {currentProject.scenes.map((scene) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  onUpdatePrompt={(prompt) => updateScenePrompt(scene.id, prompt)}
                  onAddImage={(file) => addSceneImage(scene.id, file)}
                  onSelect={() => setSelectedScene(scene)}
                  isSelected={selectedScene?.id === scene.id}
                  hasImage={!!scene.imageFile}
                  imageName={scene.imageName}
                />
              ))}
            </div>
          )}

          {/* Generated Video */}
          {currentProject?.videoUrl && (
            <div className="mt-8 p-6 bg-gray-50 border border-gray-200">
              <h4 className="spaced-title text-sm mb-4">Your Brand Story Video</h4>
              <video 
                controls 
                className="w-full max-h-96 bg-black"
                src={currentProject.videoUrl}
              >
                Your browser does not support video playback.
              </video>
              <div className="mt-4 flex gap-3">
                <button className="luxury-btn secondary text-xs">
                  Download Video
                </button>
                <button className="luxury-btn secondary text-xs">
                  Share Link
                </button>
              </div>
            </div>
          )}

          {/* Director Panel for Mobile */}
          <DirectorPanel
            mode="story"
            messages={messages}
            isTyping={isTyping}
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            placeholder="Describe the story you want to create..."
          />

          {/* Toolkit Panel for Mobile */}
          <ToolkitPanel
            mode="story"
            selectedItem={selectedScene}
            onItemAction={handleToolkitAction}
          >
            <QuickActions mode="story" onAction={handleToolkitAction} />
            <StatusDisplay mode="story" stats={stats} />
          </ToolkitPanel>
        </CanvasPanel>
      ) : (
        // Desktop Layout: Three-panel design
        <>
          {/* Left Panel: Scene Director (Chat) */}
          <DirectorPanel
            mode="story"
            messages={messages}
            isTyping={isTyping}
            message={message}
            setMessage={setMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            placeholder="Describe the story you want to create..."
          />

          {/* Center Panel: Story Canvas */}
          <CanvasPanel mode="story" onItemSelect={setSelectedScene} selectedItem={selectedScene}>
            {/* Welcome State */}
            {!currentProject && messages.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-2xl mb-8" style={{ 
                  fontFamily: 'Times New Roman, serif', 
                  fontWeight: 200, 
                  letterSpacing: '0.2em',
                  lineHeight: 1.2
                }}>
                  CREATE YOUR
                  <br />
                  BRAND STORY VIDEO
                </h2>
                <p className="text-gray-600 mb-12 leading-relaxed max-w-xl mx-auto">
                  Tell me what story you want to create and I'll structure it into scenes for video generation.
                </p>

                <div className="space-y-3 max-w-md mx-auto">
                  {[
                    "Behind-the-scenes of my business journey",
                    "Professional day-in-the-life content",
                    "Brand introduction for social media"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(suggestion)}
                      className="w-full text-left px-6 py-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300"
                    >
                      <span className="text-sm text-gray-700">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Project Overview */}
            {currentProject && (
              <div className="mb-12 p-8 bg-gray-50 border border-gray-200">
                <h3 className="spaced-title mb-4">{currentProject.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{currentProject.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Format: {videoFormat === '9:16' ? 'Portrait (Social Media)' : 'Landscape (Website)'}</span>
                  <span className={`px-3 py-1 rounded text-sm ${
                    currentProject.status === 'completed' ? 'bg-green-100 text-green-800' :
                    currentProject.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                  </span>
                </div>
              </div>
            )}

            {/* Scene Cards */}
            {currentProject && (
              <div className="space-y-6">
                <h3 className="spaced-title">Story Scenes</h3>
                <div className="grid gap-6">
                  {currentProject.scenes.map((scene) => (
                    <SceneCard
                      key={scene.id}
                      scene={scene}
                      onUpdatePrompt={(prompt) => updateScenePrompt(scene.id, prompt)}
                      onAddImage={(file) => addSceneImage(scene.id, file)}
                      onSelect={() => setSelectedScene(scene)}
                      isSelected={selectedScene?.id === scene.id}
                      hasImage={!!scene.imageFile}
                      imageName={scene.imageName}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Generated Video */}
            {currentProject?.videoUrl && (
              <div className="mt-12 p-8 bg-gray-50 border border-gray-200">
                <h4 className="spaced-title mb-6">Your Brand Story Video</h4>
                <video 
                  controls 
                  className="w-full max-h-96 bg-black mb-6"
                  src={currentProject.videoUrl}
                >
                  Your browser does not support video playback.
                </video>
                <div className="flex gap-4">
                  <button className="luxury-btn secondary">
                    Download Video
                  </button>
                  <button className="luxury-btn secondary">
                    Share Link
                  </button>
                  <button className="luxury-btn secondary">
                    Create New Version
                  </button>
                </div>
              </div>
            )}

            {/* Generation Progress */}
            {isGenerating && (
              <div className="mt-8 p-8 bg-blue-50 border border-blue-200">
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-blue-700 font-medium">Generating your brand story video...</span>
                </div>
                <p className="text-blue-600 text-sm mt-2">This may take a few minutes. Please wait.</p>
              </div>
            )}
          </CanvasPanel>

          {/* Right Panel: Story Toolkit */}
          <ToolkitPanel
            mode="story"
            selectedItem={selectedScene}
            onItemAction={handleToolkitAction}
          >
            <QuickActions mode="story" onAction={handleToolkitAction} />
            <StatusDisplay mode="story" stats={stats} />
          </ToolkitPanel>
        </>
      )}
    </>
  );
};