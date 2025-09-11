// SSELFIE Studio: Story Studio - Main Component
// This component orchestrates the entire video creation process, from concept to final render.
// It uses the client-side Gemini API for all AI-powered features.

import React, { useState, useEffect, useRef } from 'react';
import '../../styles/StoryStudio.css';
import { draftStoryboard, generateStory, getJobStatus } from '../../services/api.js';

// A curated list of background images to rotate through.
const backgroundImages = [
    'https://i.postimg.cc/VLCFmXVr/1.png', 'https://i.postimg.cc/WpDyqFyj/10.png',
    'https://i.postimg.cc/SRz1B39j/100.png', 'https://i.postimg.cc/bJ5FFpsK/101.png',
    'https://i.postimg.cc/F15CNpbp/102.png', 'https://i.postimg.cc/pVh2VdY5/103.png',
    'https://i.postimg.cc/tRK9sH2S/104.png', 'https://i.postimg.cc/2Smmx7pn/105.png',
    'https://i.postimg.cc/YqQMgyPp/106.png', 'https://i.postimg.cc/Bng37Psk/107.png',
    'https://i.postimg.cc/zf2r8myk/108.png', 'https://i.postimg.cc/4dKT38tR/109.png',
    'https://i.postimg.cc/dQzx2QMC/11.png', 'https://i.postimg.cc/4drRHzb7/110.png',
    'https://i.postimg.cc/ryrkXPMS/111.png', 'https://i.postimg.cc/PrnktQ50/112.png',
    'https://i.postimg.cc/3JjQW0yN/113.png', 'https://i.postimg.cc/wj68NxJV/114.png',
];

let imageIndex = 0;
const getNextImage = () => {
    const imageUrl = backgroundImages[imageIndex];
    imageIndex = (imageIndex + 1) % backgroundImages.length;
    return imageUrl;
};

// --- Type Definitions ---
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


// --- React Components ---

const SceneCard = ({ scene, onPromptChange, onImageAdd, isDisabled }: { scene: Scene; onPromptChange: (id: string, prompt: string) => void; onImageAdd: (id: string, file: File) => void; isDisabled: boolean; }) => {
    const [fileName, setFileName] = useState('');
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onImageAdd(scene.id, file);
        }
    };

    return (
        <div className="card-with-bg" style={{ backgroundImage: `url('${getNextImage()}')` }}>
            <h4 className="spaced-title">SCENE {scene.scene}</h4>
            <div className="card-section">
                <textarea
                    className="form-input scene-prompt"
                    rows={3}
                    value={scene.prompt}
                    onChange={(e) => onPromptChange(scene.id, e.target.value)}
                    placeholder="A creative prompt for this scene..."
                    disabled={isDisabled}
                />
            </div>
            <div className="card-section">
                <input
                    id={`file-input-${scene.id}`}
                    type="file"
                    accept="image/*"
                    className="file-input-hidden"
                    onChange={handleFileChange}
                    disabled={isDisabled}
                />
                <label htmlFor={`file-input-${scene.id}`} className="file-input-label">
                    {fileName || 'Add Inspiration Image'}
                </label>
            </div>
        </div>
    );
};

const ResultCard = ({ result }: { result: Result }) => {
    return (
        <div className="card-with-bg" style={{ backgroundImage: `url('${getNextImage()}')` }}>
            <h4 className="spaced-title">SCENE {result.sceneNum} VIDEO</h4>
            {result.status === 'generating' && (
                <div className="progress-container" style={{ display: 'block' }}>
                    <div className="progress-bar" style={{ width: `${result.progress || 0}%` }}></div>
                </div>
            )}
            {result.videoUrl && (
                <video src={result.videoUrl} autoPlay loop controls style={{ display: 'block' }}></video>
            )}
            <p className="status">{result.message}</p>
            {result.videoUrl && (
                <a href={result.videoUrl} download={`scene-${result.sceneNum}.mp4`} className="luxury-btn secondary download-button" style={{ display: 'inline-block', marginTop: '16px' }}>
                    Download Scene
                </a>
            )}
        </div>
    );
};


export const StoryStudio = () => {
    const [concept, setConcept] = useState('');
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [format, setFormat] = useState('9:16');
    const [conditioningImages, setConditioningImages] = useState<Record<string, File>>({});
    const [results, setResults] = useState<Record<string, Result>>({});
    const [isDrafting, setIsDrafting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});

    useEffect(() => {
        // Cleanup polling intervals on component unmount
        return () => {
            Object.values(pollingIntervals.current).forEach(clearInterval);
        };
    }, []);

    const handleDraftScenes = async () => {
        if (!concept || isDrafting) return;
        setIsDrafting(true);
        setScenes([]);
        setResults({});
        try {
            const draftedScenes = await draftStoryboard(concept);
            setScenes(draftedScenes.map((s: Omit<Scene, 'id'>) => ({ ...s, id: crypto.randomUUID() })));
        } catch (error) {
            console.error("Failed to draft storyboard", error);
            // Add user-facing error handling (e.g., toast notification)
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
                        message: `Creating... (${status.state || 'in progress'})`,
                    } as Result
                }));

                if (status.done) {
                    clearInterval(pollingIntervals.current[jobId]);
                    delete pollingIntervals.current[jobId];

                    if (status.videoUrl) {
                        setResults(prev => ({
                            ...prev,
                            [sceneId]: { status: 'done', sceneNum, progress: 100, videoUrl: status.videoUrl, message: 'Ready!' },
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
                    [sceneId]: { status: 'error', sceneNum, progress: 0, message: 'Something went wrong.' },
                }));
            }
        }, 5000); // Poll every 5 seconds
    };


    const handleGenerateStory = async () => {
        if (scenes.length === 0 || isGenerating) return;
        setIsGenerating(true);

        const initialResults = scenes.reduce((acc, scene) => {
            acc[scene.id] = { status: 'generating', sceneNum: scene.scene, progress: 0, message: 'Starting creation...' };
            return acc;
        }, {} as Record<string, Result>);
        setResults(initialResults);

        try {
            const jobs = await generateStory(scenes, conditioningImages, format);
            jobs.forEach((job: Job) => pollJobStatus(job.jobId, job.sceneId, job.sceneNum));
        } catch (error) {
            console.error("Failed to start story generation", error);
            setIsGenerating(false);
            // Add user-facing error handling
        }
    };

    useEffect(() => {
        if (!isGenerating) return;
        const allDone = scenes.length > 0 && scenes.every(scene => results[scene.id]?.status === 'done' || results[scene.id]?.status === 'error');
        if (allDone) {
            setIsGenerating(false);
        }
    }, [results, scenes, isGenerating]);


    return (
        <div className="story-studio-container">
            <main className="generator-card">
                <div className="card-section">
                    <label htmlFor="prompt-input" className="spaced-title">1. What's Your Story?</label>
                    <div className="concept-input-group">
                        <textarea id="prompt-input" className="form-input" placeholder="Try something like: &quot;A quick video for social media about my brand's mission.&quot;" value={concept} onChange={e => setConcept(e.target.value)} disabled={isDrafting || isGenerating} rows={3} />
                        <button id="maya-button" className="luxury-btn" onClick={handleDraftScenes} disabled={isDrafting || isGenerating}>
                            {isDrafting ? 'DRAFTING YOUR STORY...' : "✨ 2. Let's Draft the Scenes"}
                        </button>
                    </div>
                </div>

                <div id="scene-director" className="card-section">
                    {scenes.length === 0 ? (
                        <p className="placeholder-text" style={{ backgroundImage: `url('${getNextImage()}')` }}>This is where your story will take shape. Let's get started!</p>
                    ) : (
                        scenes.map(scene => (
                            <SceneCard key={scene.id} scene={scene}
                                onPromptChange={(id, prompt) => setScenes(scenes.map(s => s.id === id ? { ...s, prompt } : s))}
                                onImageAdd={(id, file) => setConditioningImages({ ...conditioningImages, [id]: file })}
                                isDisabled={isGenerating} />
                        ))
                    )}
                </div>

                <div className="card-section">
                    <h3 className="spaced-title">3. Where Will This Be Seen?</h3>
                    <div id="format-selector" className="format-selector">
                        <button className={`luxury-btn format-btn ${format === '9:16' ? 'active' : ''}`} onClick={() => setFormat('9:16')} disabled={isGenerating}>Social Media (Portrait)</button>
                        <button className={`luxury-btn format-btn ${format === '16:9' ? 'active' : ''}`} onClick={() => setFormat('16:9')} disabled={isGenerating}>Website (Landscape)</button>
                    </div>
                </div>

                <div className="card-actions">
                    <button id="generate-button" className="luxury-btn" onClick={handleGenerateStory} disabled={isGenerating || scenes.length === 0}>
                        {isGenerating ? 'CREATING YOUR STORY...' : 'Bring My Story to Life'}
                    </button>
                </div>
            </main>

            {Object.keys(results).length > 0 && (
                <div id="results-container" className="results-container">
                    {scenes.map(scene => results[scene.id] && (
                         <ResultCard key={scene.id} result={results[scene.id]} />
                    ))}
                </div>
            )}
        </div>
    );
};