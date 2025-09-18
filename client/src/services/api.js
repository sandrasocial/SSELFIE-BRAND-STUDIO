/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calls the backend to draft a storyboard based on a concept.
 * @param {string} concept - The user's concept for the story.
 * @returns {Promise<Array<{scene: number, prompt: string}>>} - A promise that resolves to an array of scenes.
 */
export async function draftStoryboard(concept) {
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
}

/**
 * Calls the backend to generate video scenes.
 * @param {Array<object>} scenes - The scene definitions.
 * @param {Record<string, File>} conditioningImages - A map of scene IDs to image files.
 * @param {string} format - The aspect ratio for the videos (e.g., '9:16').
 * @returns {Promise<Array<{jobId: string, sceneId: string, sceneNum: number}>>} - A promise that resolves to an array of jobs.
 */
export async function generateStory(scenes, conditioningImages, format) {
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
}

/**
 * Fetches the status of a video generation job.
 * @param {string} jobId - The ID of the job to check.
 * @returns {Promise<object>} A promise that resolves to the job status object.
 */
export async function getJobStatus(jobId) {
    const response = await fetch(`/api/video/status/${jobId}`);
    if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Sends a message to the Maya chat API.
 * @param {string} message - The user's message.
 * @param {object} history - The chat history (not fully implemented in component).
 * @returns {Promise<{response: string, conceptCards: Array<{title: string, prompt: string}>>>} - A promise that resolves to Maya's response.
 */
export async function sendMayaMessage(message, history) {
    // Use authenticated apiFetch instead of raw fetch to prevent 401 errors
    const { apiFetch } = await import('../lib/api');
    return apiFetch('/maya/chat', {
        method: 'POST',
        json: { message, history }
    });
}

/**
 * Calls the backend to generate a photo/image based on a prompt.
 * @param {string} prompt - The prompt for image generation.
 * @returns {Promise<{imageUrls: string[]}>} - A promise that resolves to an object containing an array of image URLs.
 */
export async function generatePhotoImage(prompt) {
    const response = await fetch('/api/photo/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
        throw new Error(`Failed to generate photo: ${response.statusText}`);
    }
    return response.json();
}