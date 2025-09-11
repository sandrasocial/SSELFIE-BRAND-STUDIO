import React, { useState, useEffect, useRef } from 'react';
import { Video, Upload, Sparkles, Download, Play, Pause } from 'lucide-react';

// Luxury flatlay images for Maya's Story Studio
const FLATLAY_IMAGES = [
  'https://i.postimg.cc/VLCFmXVr/1.png',
  'https://i.postimg.cc/WpDyqFyj/10.png',
  'https://i.postimg.cc/SRz1B39j/100.png',
  'https://i.postimg.cc/bJ5FFpsK/101.png',
  'https://i.postimg.cc/F15CNpbp/102.png',
  'https://i.postimg.cc/pVh2VdY5/103.png',
  'https://i.postimg.cc/tRK9sH2S/104.png',
  'https://i.postimg.cc/2Smmx7pn/105.png',
  'https://i.postimg.cc/YqQMgyPp/106.png',
  'https://i.postimg.cc/Bng37Psk/107.png',
  'https://i.postimg.cc/zf2r8myk/108.png',
  'https://i.postimg.cc/4dKT38tR/109.png',
  'https://i.postimg.cc/dQzx2QMC/11.png',
  'https://i.postimg.cc/4drRHzb7/110.png',
  'https://i.postimg.cc/ryrkXPMS/111.png',
  'https://i.postimg.cc/PrnktQ50/112.png',
  'https://i.postimg.cc/3JjQW0yN/113.png',
  'https://i.postimg.cc/wj68NxJV/114.png'
];

// Get random background image
let imageIndex = 0;
const getNextImage = () => {
  const imageUrl = FLATLAY_IMAGES[imageIndex];
  imageIndex = (imageIndex + 1) % FLATLAY_IMAGES.length;
  return imageUrl;
};

// Types
interface Scene {
  id: string;
  scene: number;
  prompt: string;
}

interface Result {
  status: 'generating' | 'done' | 'error' | 'queued';
  sceneNum: number;
  progress: number;
  message: string;
  videoUrl?: string;
}

interface Job {
  jobId: string;
  sceneId: string;
  sceneNum: number;
}

// Scene Card Component
interface SceneCardProps {
  scene: Scene;
  onPromptChange: (id: string, prompt: string) => void;
  onImageAdd: (id: string, file: File) => void;
  isDisabled: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({ 
  scene, 
  onPromptChange, 
  onImageAdd, 
  isDisabled 
}) => {
  const [fileName, setFileName] = useState('');
  const [backgroundImage] = useState(getNextImage());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onImageAdd(scene.id, file);
    }
  };

  return (
    <div 
      className="floating-scene-card rounded-lg overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="p-6 text-white">
        <h4 
          className="text-lg mb-4"
          style={{ 
            fontFamily: 'Times New Roman, serif',
            fontWeight: 300,
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}
        >
          Scene {scene.scene}
        </h4>

        <div className="space-y-4">
          <div>
            <label 
              className="block text-xs text-white/80 mb-2"
              style={{ 
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              What happens in this scene?
            </label>
            <textarea
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 focus:border-white/50 focus:outline-none px-4 py-3 rounded-lg text-white placeholder-white/60 resize-none"
              rows={3}
              value={scene.prompt}
              onChange={(e) => onPromptChange(scene.id, e.target.value)}
              placeholder="Describe this scene in detail... What do you see? What's the mood? What message are you sharing?"
              disabled={isDisabled}
              style={{ 
                fontWeight: 300,
                lineHeight: 1.6
              }}
            />
          </div>

          <div>
            <input
              id={`file-input-${scene.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isDisabled}
            />
            <label 
              htmlFor={`file-input-${scene.id}`} 
              className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors px-4 py-3 rounded-lg text-center cursor-pointer border border-white/20 hover:border-white/50 flex items-center justify-center space-x-2"
              style={{ 
                fontWeight: 300,
                fontSize: '14px',
                letterSpacing: '0.05em'
              }}
            >
              <Upload className="w-4 h-4" />
              <span>
                {fileName || 'Add Inspiration Image (Optional)'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Result Card Component
interface ResultCardProps {
  result: Result;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [backgroundImage] = useState(getNextImage());
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div 
      className="floating-scene-card rounded-lg overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="p-6 text-white">
        <h4 
          className="text-lg mb-4"
          style={{ 
            fontFamily: 'Times New Roman, serif',
            fontWeight: 300,
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}
        >
          Scene {result.sceneNum} Video
        </h4>

        {/* Progress Bar */}
        {result.status === 'generating' && (
          <div className="mb-4">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300 ease-out"
                style={{ width: `${result.progress || 0}%` }}
              />
            </div>
            <p 
              className="text-xs text-white/80 mt-2"
              style={{ 
                letterSpacing: '0.1em',
                fontWeight: 300
              }}
            >
              {result.progress || 0}% complete
            </p>
          </div>
        )}

        {/* Video Player */}
        {result.videoUrl && (
          <div className="mb-4 relative">
            <video 
              src={result.videoUrl}
              className="w-full rounded-lg"
              controls
              style={{ maxHeight: '200px' }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        <p 
          className="text-white/90 mb-4"
          style={{ 
            fontWeight: 300,
            fontSize: '14px'
          }}
        >
          {result.message}
        </p>

        {result.videoUrl && (
          <a 
            href={result.videoUrl} 
            download={`maya-scene-${result.sceneNum}.mp4`}
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-white border border-white/20 hover:border-white/50"
            style={{ 
              fontWeight: 300,
              fontSize: '14px',
              letterSpacing: '0.05em'
            }}
          >
            <Download className="w-4 h-4" />
            <span>Download Scene</span>
          </a>
        )}
      </div>
    </div>
  );
};

// Main StoryStudio Component
export const StoryStudio: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [format, setFormat] = useState('9:16');
  const [conditioningImages, setConditioningImages] = useState<Record<string, File>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [isDrafting, setIsDrafting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backgroundImage] = useState(FLATLAY_IMAGES[Math.floor(Math.random() * FLATLAY_IMAGES.length)]);

  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      Object.values(pollingIntervals.current).forEach(clearInterval);
    };
  }, []);

  // API function to draft storyboard
  const draftStoryboard = async (concept: string) => {
    const response = await fetch('/api/video/draft-storyboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept }),
    });
    if (!response.ok) {
      throw new Error(`Failed to draft storyboard: ${response.statusText}`);
    }
    const data = await response.json();
    return data.scenes;
  };

  // API function to generate story
  const generateStory = async (scenes: Scene[], conditioningImages: Record<string, File>, format: string) => {
    const formData = new FormData();
    formData.append('scenes', JSON.stringify(scenes));
    formData.append('format', format);
    for (const sceneId in conditioningImages) {
      if (conditioningImages[sceneId]) {
        formData.append(sceneId, conditioningImages[sceneId]);
      }
    }
    const response = await fetch('/api/video/generate-story', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to start story generation: ${response.statusText}`);
    }
    const data = await response.json();
    return data.jobs;
  };

  // API function to get job status
  const getJobStatus = async (jobId: string) => {
    const response = await fetch(`/api/video/status/${jobId}`);
    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }
    return response.json();
  };

  const handleDraftScenes = async () => {
    if (!concept || isDrafting) return;
    setIsDrafting(true);
    setScenes([]);
    setResults({});

    try {
      const draftedScenes = await draftStoryboard(concept);
      setScenes(draftedScenes.map((s: Omit<Scene, 'id'>) => ({ 
        ...s, 
        id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      })));
    } catch (error) {
      console.error("Failed to draft storyboard", error);
      // Add sample scenes for demo
      const sampleScenes: Scene[] = [
        {
          id: 'scene_1',
          scene: 1,
          prompt: 'Opening scene introducing the main subject or brand'
        },
        {
          id: 'scene_2',
          scene: 2,
          prompt: 'Key message or value proposition demonstration'
        },
        {
          id: 'scene_3',
          scene: 3,
          prompt: 'Call to action or conclusion with strong visual impact'
        }
      ];
      setScenes(sampleScenes);
    } finally {
      setIsDrafting(false);
    }
  };

  const pollJobStatus = (jobId: string, sceneId: string, sceneNum: number) => {
    pollingIntervals.current[jobId] = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setResults(prev => ({
          ...prev,
          [sceneId]: {
            ...prev[sceneId],
            progress: status.progressPercent || prev[sceneId]?.progress || 0,
            message: `Creating your scene... (${status.state || 'processing'})`,
          } as Result
        }));

        if (status.done) {
          clearInterval(pollingIntervals.current[jobId]);
          delete pollingIntervals.current[jobId];

          if (status.videoUrl) {
            setResults(prev => ({
              ...prev,
              [sceneId]: { 
                status: 'done', 
                sceneNum, 
                progress: 100, 
                videoUrl: status.videoUrl, 
                message: 'Your scene is ready!' 
              },
            }));
          } else {
            throw new Error(status.error || 'Video generation failed.');
          }
        }
      } catch (error) {
        console.error(`Polling failed for job ${jobId}:`, error);
        clearInterval(pollingIntervals.current[jobId]);
        delete pollingIntervals.current[jobId];
        setResults(prev => ({
          ...prev,
          [sceneId]: { 
            status: 'error', 
            sceneNum, 
            progress: 0, 
            message: 'Something went wrong. Please try again.' 
          },
        }));
      }
    }, 5000);
  };

  const handleGenerateStory = async () => {
    if (scenes.length === 0 || isGenerating) return;
    setIsGenerating(true);

    const initialResults = scenes.reduce((acc, scene) => {
      acc[scene.id] = { 
        status: 'generating', 
        sceneNum: scene.scene, 
        progress: 0, 
        message: 'Starting to create your scene...' 
      };
      return acc;
    }, {} as Record<string, Result>);
    setResults(initialResults);

    try {
      const jobs = await generateStory(scenes, conditioningImages, format);
      jobs.forEach((job: Job) => pollJobStatus(job.jobId, job.sceneId, job.sceneNum));
    } catch (error) {
      console.error("Failed to start story generation", error);
      setIsGenerating(false);

      // Demo fallback with sample video URLs
      setTimeout(() => {
        const demoResults = scenes.reduce((acc, scene) => {
          acc[scene.id] = {
            status: 'done',
            sceneNum: scene.scene,
            progress: 100,
            message: 'Demo scene ready!',
            videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
          };
          return acc;
        }, {} as Record<string, Result>);
        setResults(demoResults);
        setIsGenerating(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (!isGenerating) return;
    const allDone = scenes.length > 0 && scenes.every(scene => 
      results[scene.id]?.status === 'done' || results[scene.id]?.status === 'error'
    );
    if (allDone) {
      setIsGenerating(false);
    }
  }, [results, scenes, isGenerating]);

  return (
    <>
      {/* Global Styles */}
      <style jsx global>{`
        .floating-scene-card {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .floating-scene-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-6xl mx-auto p-4 lg:p-8">

          {/* Header */}
          <div className="text-center py-12 mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 
              className="text-4xl text-white mb-4"
              style={{ 
                fontFamily: 'Times New Roman, serif',
                fontWeight: 300,
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}
            >
              Maya's Story Studio
            </h1>
            <p 
              className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ fontWeight: 300 }}
            >
              Let's bring your story to life. Just give me a concept, and I'll help you create the scenes for your next great video.
            </p>
          </div>

          {/* Main Generator Card */}
          <div className="bg-white/95 backdrop-blur-lg rounded-xl p-8 mb-8 shadow-2xl">

            {/* Step 1: Story Concept */}
            <div className="mb-8">
              <h2 
                className="text-xl mb-4"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  fontWeight: 300,
                  letterSpacing: '0.1em'
                }}
              >
                1. What's Your Story?
              </h2>
              <div className="space-y-4">
                <textarea 
                  className="w-full border border-gray-200 focus:border-black focus:outline-none px-4 py-4 rounded-lg resize-none"
                  placeholder="Try something like: 'A quick video for social media about my brand's mission and what makes us different from competitors.'"
                  value={concept} 
                  onChange={e => setConcept(e.target.value)} 
                  disabled={isDrafting || isGenerating} 
                  rows={3}
                  style={{ 
                    fontWeight: 300,
                    lineHeight: 1.6
                  }}
                />
                <button 
                  className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                  onClick={handleDraftScenes} 
                  disabled={isDrafting || isGenerating || !concept.trim()}
                  style={{ 
                    fontWeight: 300,
                    letterSpacing: '0.1em'
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {isDrafting ? 'Maya is drafting your story...' : "2. Let's Draft the Scenes"}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Scene Director */}
            <div className="mb-8">
              {scenes.length === 0 ? (
                <div 
                  className="text-center py-16 rounded-lg"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('${getNextImage()}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="text-white">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
                    <h3 
                      className="text-xl mb-4"
                      style={{ 
                        fontFamily: 'Times New Roman, serif',
                        fontWeight: 300,
                        letterSpacing: '0.1em'
                      }}
                    >
                      This is where your story will take shape
                    </h3>
                    <p 
                      className="text-white/80"
                      style={{ fontWeight: 300 }}
                    >
                      Let's get started! Share your concept above and I'll create beautiful scenes for you.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 
                    className="text-lg"
                    style={{ 
                      fontFamily: 'Times New Roman, serif',
                      fontWeight: 300,
                      letterSpacing: '0.1em'
                    }}
                  >
                    Your Story Scenes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenes.map(scene => (
                      <SceneCard 
                        key={scene.id} 
                        scene={scene}
                        onPromptChange={(id, prompt) => setScenes(scenes.map(s => s.id === id ? { ...s, prompt } : s))}
                        onImageAdd={(id, file) => setConditioningImages({ ...conditioningImages, [id]: file })}
                        isDisabled={isGenerating} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Format Selection */}
            <div className="mb-8">
              <h3 
                className="text-lg mb-4"
                style={{ 
                  fontFamily: 'Times New Roman, serif',
                  fontWeight: 300,
                  letterSpacing: '0.1em'
                }}
              >
                3. Where Will This Be Seen?
              </h3>
              <div className="flex gap-4">
                <button 
                  className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                    format === '9:16' 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setFormat('9:16')} 
                  disabled={isGenerating}
                  style={{ fontWeight: 300 }}
                >
                  <div className="text-center">
                    <div className="font-medium mb-1">Social Media (Portrait)</div>
                    <div className="text-sm opacity-75">Perfect for Instagram, TikTok, Stories</div>
                  </div>
                </button>
                <button 
                  className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                    format === '16:9' 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setFormat('16:9')} 
                  disabled={isGenerating}
                  style={{ fontWeight: 300 }}
                >
                  <div className="text-center">
                    <div className="font-medium mb-1">Website (Landscape)</div>
                    <div className="text-sm opacity-75">Great for YouTube, websites, presentations</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button 
                className="bg-black text-white px-12 py-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
                onClick={handleGenerateStory} 
                disabled={isGenerating || scenes.length === 0}
                style={{ 
                  fontWeight: 300,
                  letterSpacing: '0.1em',
                  fontSize: '16px'
                }}
              >
                <Video className="w-5 h-5" />
                <span>
                  {isGenerating ? 'Maya is creating your story...' : 'Bring My Story to Life'}
                </span>
              </button>
            </div>
          </div>

          {/* Results Container */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 
                  className="text-2xl text-white mb-4"
                  style={{ 
                    fontFamily: 'Times New Roman, serif',
                    fontWeight: 300,
                    letterSpacing: '0.1em'
                  }}
                >
                  Your Story Comes to Life
                </h2>
                <p 
                  className="text-white/80"
                  style={{ fontWeight: 300 }}
                >
                  Watch as Maya creates each scene of your story
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenes.map(scene => results[scene.id] && (
                  <ResultCard key={scene.id} result={results[scene.id]} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};