// FIX: Import GoogleGenAI and Type for Gemini API calls.
import { GoogleGenAI, Type } from '@google/genai';

// This file will centralize all communication with your backend.

// FIX: Initialize Gemini API client. API_KEY is expected from environment variables.
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Initialize AI client only if API key is available
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
    try {
        ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
    } catch (error) {
        console.error('Failed to initialize Google GenAI:', error);
    }
}

// FIX: Add helper function to convert Blob to base64 string for image uploads.
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64String = reader.result.toString().split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('FileReader result is null'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

// This function gets the JWT from your Stack Auth state management
const getAuthToken = () => {
    // Replace this with your actual auth token logic from useAuth or similar
    return localStorage.getItem('authToken');
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An API error occurred' }));
        throw new Error(error.message);
    }
    return response.json();
};

// --- PHOTO STUDIO APIS ---

export const getMayaConversation = async () => {
    const response = await fetch('/api/maya/conversation', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
};

export const sendMayaMessage = async (message: string, context: string) => {
    const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ message, context }),
    });
    return handleResponse(response); // Expects { response, conceptCards, ... }
};

export const generatePhotoImage = async (prompt: string) => {
     const response = await fetch('/api/ai-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ prompt }), // Or whatever your API expects
    });
    return handleResponse(response); // Expects { imageUrls: [...] }
}


// --- STORY STUDIO APIS (to be added in Phase 2) ---

// FIX: Implement draftStoryboard to call the Gemini API directly.
export const draftStoryboard = async (concept: string) => {
    if (!ai || !GEMINI_API_KEY) {
        throw new Error('Google API key not configured. Please set VITE_GOOGLE_API_KEY environment variable.');
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: `You are Maya, an AI brand strategist for luxury brands. A user wants to create a short video reel based on the following concept: "${concept}". Your task is to break this concept down into a 3-scene storyboard. For each scene, write a concise, cinematic prompt that an AI video generator can use. Respond in JSON format.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    scene: {type: Type.INTEGER},
                                    prompt: {type: Type.STRING},
                                },
                            },
                        },
                    },
                },
            },
        });
        const json = JSON.parse(response.text);
        return json.scenes;
    } catch (e) {
        console.error('Storyboard drafting failed:', e);
        throw e; // Re-throw to be handled by the component
    }
};

// FIX: Implement generateStory to start video generation jobs for each scene.
export const generateStory = async (scenes: any[], conditioningImages: Record<string, File>, format: string) => {
    if (!ai || !GEMINI_API_KEY) {
        throw new Error('Google API key not configured. Please set VITE_GOOGLE_API_KEY environment variable.');
    }
    
    const jobs = [];
    for (const scene of scenes) {
        const config: any = {
            model: 'veo-2.0-generate-001',
            prompt: scene.prompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: format,
                durationSeconds: 4,
                fps: 24,
                resolution: '1080p',
            },
        };

        const imageFile = conditioningImages[scene.id];
        if (imageFile) {
            const base64 = await blobToBase64(imageFile);
            config.image = {
                imageBytes: base64,
                mimeType: imageFile.type,
            };
        }

        // generateVideos returns a long-running operation
        const operation = await ai.models.generateVideos(config);
        // The component uses `job.jobId` to poll, so we pass the operation name,
        // and other necessary scene data.
        jobs.push({ sceneId: scene.id, jobId: operation.name, sceneNum: scene.scene });
    }
    return jobs;
};

// FIX: Implement getJobStatus to poll the status of a video generation operation.
export const getJobStatus = async (jobId: string) => {
    if (!ai || !GEMINI_API_KEY) {
        throw new Error('Google API key not configured. Please set VITE_GOOGLE_API_KEY environment variable.');
    }
    
    // Poll for the status of a single video generation operation using its name.
    const updatedOperation = await ai.operations.getVideosOperation({ operation: jobId });
    
    const metadata = updatedOperation.metadata;
    const status = {
        done: updatedOperation.done,
        progressPercent: metadata?.progressPercent,
        state: metadata?.state,
        videoUrl: null,
        error: null,
    };

    if (updatedOperation.done) {
        if (updatedOperation.response) {
            const videos = updatedOperation.response.generatedVideos;
            if (videos && videos.length > 0) {
                const videoData = videos[0];
                // The URI needs the API key to be accessed
                const url = `${decodeURIComponent(videoData.video.uri)}&key=${GEMINI_API_KEY}`;
                
                // Fetch the video data as a blob and create an object URL
                // that the browser can use directly in a <video> src attribute.
                const res = await fetch(url);
                if (res.ok) {
                    const blob = await res.blob();
                    status.videoUrl = URL.createObjectURL(blob);
                } else {
                    status.error = 'Failed to fetch generated video.';
                }
            } else {
                status.error = 'No videos were present in the final response.';
            }
        } else if (updatedOperation.error) {
             status.error = updatedOperation.error.message || 'Video generation failed with an unknown error.';
        }
    }
    
    return status;
};