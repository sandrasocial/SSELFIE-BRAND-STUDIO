// This file centralizes all communication with the backend.
// All AI operations are performed server-side for security.

// Stack Auth handles authentication via cookies automatically
// No need to manually manage tokens

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
        credentials: 'include', // Include cookies for Stack Auth
    });
    return handleResponse(response);
};

export const sendMayaMessage = async (message: string, context: string) => {
    const response = await fetch('/api/maya/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for Stack Auth
        body: JSON.stringify({ message, context }),
    });
    return handleResponse(response); // Expects { response, conceptCards, ... }
};

export const generatePhotoImage = async (prompt: string) => {
    const response = await fetch('/api/ai-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for Stack Auth
        body: JSON.stringify({ prompt }),
    });
    return handleResponse(response); // Expects { imageUrls: [...] }
}


// --- STORY STUDIO APIS ---

// Draft storyboard using server-side AI processing
export const draftStoryboard = async (concept: string) => {
    const response = await fetch('/api/story/draft', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for Stack Auth
        body: JSON.stringify({ concept }),
    });
    return handleResponse(response); // Expects { scenes: [...] }
};

// Generate story videos using server-side AI processing
export const generateStory = async (scenes: any[], conditioningImages: Record<string, File>, format: string) => {
    const formData = new FormData();
    formData.append('scenes', JSON.stringify(scenes));
    formData.append('format', format);
    
    // Add conditioning images
    Object.entries(conditioningImages).forEach(([sceneId, file]) => {
        formData.append(`image_${sceneId}`, file);
    });

    const response = await fetch('/api/story/generate', {
        method: 'POST',
        credentials: 'include', // Include cookies for Stack Auth
        body: formData,
    });
    return handleResponse(response); // Expects { jobs: [...] }
};

// Get job status from server-side polling
export const getJobStatus = async (jobId: string) => {
    const response = await fetch(`/api/story/status/${encodeURIComponent(jobId)}`, {
        credentials: 'include', // Include cookies for Stack Auth
    });
    return handleResponse(response); // Expects { done, progressPercent, state, videoUrl, error }
};