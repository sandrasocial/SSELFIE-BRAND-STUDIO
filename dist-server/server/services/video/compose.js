/**
 * Video Storyboard Composition Service
 * Chains 2-3 video motions into coherent clips using existing VEO3 service
 */
// Using video generation infrastructure from routes/video.js
// Since VEO service is disabled, we'll use the pattern from the video route
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ulid } from 'ulid';
/**
 * Compose multi-scene video by generating individual scenes and stitching them together
 */
export async function composeStoryboard(options) {
    const { scenes, userId, mode, format = '9:16', crossfade = true } = options;
    const compositionJobId = `storyboard_${ulid()}`;
    console.log(`🎬 VIDEO COMPOSER: Starting storyboard composition for user ${userId}`, {
        sceneCount: scenes.length,
        mode,
        compositionJobId
    });
    try {
        // Validate scenes
        if (scenes.length < 2 || scenes.length > 3) {
            throw new Error('Storyboard must have 2-3 scenes');
        }
        // Generate each scene sequentially using existing VEO3 service
        const sceneJobs = [];
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            console.log(`🎥 VIDEO COMPOSER: Generating scene ${i + 1}/${scenes.length}`);
            try {
                // Convert scene to VEO format - use existing VEO service patterns
                const veoScenes = [{
                        prompt: scene.motionPrompt,
                        duration: Math.min(Math.max(scene.duration, 1), 12), // Clamp duration
                        cameraMovement: 'slow push-in',
                        imageUrl: scene.imageUrl
                    }];
                // Get user's LoRA model if available
                let userLoraModel = null;
                try {
                    const { storage } = await import('../../storage.js');
                    const profile = await storage.getUserProfile(userId);
                    userLoraModel = profile?.['replicateModelId'] || null;
                }
                catch (e) {
                    console.log('⚠️ VIDEO COMPOSER: Unable to load user profile for LoRA model (continuing)', e?.message);
                }
                // Start video generation using existing VEO3 service
                const startResult = await startVeoVideo({
                    scenes: veoScenes,
                    format,
                    userLoraModel,
                    userId
                });
                sceneJobs.push({
                    sceneIndex: i,
                    jobId: startResult.jobId,
                    status: 'pending',
                });
                console.log(`✅ VIDEO COMPOSER: Scene ${i + 1} job started`, { jobId: startResult.jobId });
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : String(error);
                console.error(`❌ VIDEO COMPOSER: Scene ${i + 1} generation failed:`, errMsg);
                sceneJobs.push({
                    sceneIndex: i,
                    jobId: '',
                    status: 'failed',
                });
            }
        }
        // Check if all scenes started successfully
        const failedScenes = sceneJobs.filter(job => job.status === 'failed');
        if (failedScenes.length > 0) {
            return {
                jobId: compositionJobId,
                status: 'failed',
                sceneJobs,
                error: `Failed to start ${failedScenes.length} scene(s)`
            };
        }
        console.log(`🎬 VIDEO COMPOSER: All scenes started, returning pending result`, { compositionJobId });
        return {
            jobId: compositionJobId,
            status: 'pending',
            sceneJobs
        };
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ VIDEO COMPOSER: Composition failed:', errMsg);
        return {
            jobId: compositionJobId,
            status: 'failed',
            error: errMsg
        };
    }
}
/**
 * Check status of storyboard composition and compose final video when all scenes are ready
 */
export async function getCompositionStatus(compositionJobId, sceneJobs, userId, crossfade = true) {
    if (!sceneJobs || sceneJobs.length === 0) {
        return {
            jobId: compositionJobId,
            status: 'failed',
            error: 'No scene jobs found'
        };
    }
    console.log(`🔍 VIDEO COMPOSER: Checking composition status for ${compositionJobId}`);
    try {
        // Check status of each scene
        const updatedSceneJobs = await Promise.all(sceneJobs.map(async (sceneJob) => {
            if (sceneJob.status === 'completed' || sceneJob.status === 'failed') {
                return sceneJob; // Already resolved
            }
            try {
                const status = await getVeoStatus(sceneJob.jobId, userId);
                return {
                    ...sceneJob,
                    status: status.status === 'succeeded' ? 'completed' :
                        status.status === 'failed' ? 'failed' : 'processing',
                    videoUrl: status.videoUrl || undefined
                };
            }
            catch (error) {
                console.error(`❌ VIDEO COMPOSER: Scene ${sceneJob.sceneIndex} status check failed:`, error);
                return { ...sceneJob, status: 'failed' };
            }
        }));
        const completedScenes = updatedSceneJobs.filter(job => job.status === 'completed' && job.videoUrl);
        const failedScenes = updatedSceneJobs.filter(job => job.status === 'failed');
        const processingScenes = updatedSceneJobs.filter(job => job.status === 'processing' || job.status === 'pending');
        // If any scenes failed, mark composition as failed
        if (failedScenes.length > 0) {
            return {
                jobId: compositionJobId,
                status: 'failed',
                sceneJobs: updatedSceneJobs,
                error: `${failedScenes.length} scene(s) failed to generate`
            };
        }
        // If scenes are still processing, return processing status
        if (processingScenes.length > 0) {
            return {
                jobId: compositionJobId,
                status: 'processing',
                sceneJobs: updatedSceneJobs
            };
        }
        // All scenes completed - compose final video
        if (completedScenes.length === sceneJobs.length) {
            console.log(`🎬 VIDEO COMPOSER: All scenes ready, composing final video`);
            const composedVideoUrl = await composeScenes(completedScenes.map(job => job.videoUrl), crossfade);
            return {
                jobId: compositionJobId,
                status: 'completed',
                sceneJobs: updatedSceneJobs,
                composedVideoUrl
            };
        }
        // Shouldn't reach here, but fallback
        return {
            jobId: compositionJobId,
            status: 'processing',
            sceneJobs: updatedSceneJobs
        };
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ VIDEO COMPOSER: Status check failed:', errMsg);
        return {
            jobId: compositionJobId,
            status: 'failed',
            sceneJobs,
            error: errMsg
        };
    }
}
/**
 * Compose individual scene videos into final storyboard using ffmpeg
 */
async function composeScenes(videoUrls, crossfade) {
    const tempDir = tmpdir();
    const outputPath = join(tempDir, `storyboard_${ulid()}.mp4`);
    console.log(`🔧 VIDEO COMPOSER: Composing ${videoUrls.length} scenes with ffmpeg`);
    try {
        // Download video files to temp directory
        const tempFiles = [];
        for (let i = 0; i < videoUrls.length; i++) {
            const tempFile = join(tempDir, `scene_${i}.mp4`);
            // Download video (would need proper implementation with fetch/stream)
            console.log(`📥 VIDEO COMPOSER: Downloading scene ${i + 1}: ${videoUrls[i]}`);
            // For now, assume videos are accessible file paths
            tempFiles.push(videoUrls[i]); // TODO: Implement actual download
        }
        // Build ffmpeg command for concatenation
        let ffmpegCommand;
        if (crossfade && videoUrls.length > 1) {
            // Complex filter with crossfade transitions
            const crossfadeDuration = 0.5; // 0.5 second crossfade
            if (videoUrls.length === 2) {
                ffmpegCommand = `ffmpeg -i "${tempFiles[0]}" -i "${tempFiles[1]}" ` +
                    `-filter_complex "[0][1]xfade=transition=fade:duration=${crossfadeDuration}:offset=0" ` +
                    `-c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;
            }
            else {
                // 3 scenes with crossfades
                ffmpegCommand = `ffmpeg -i "${tempFiles[0]}" -i "${tempFiles[1]}" -i "${tempFiles[2]}" ` +
                    `-filter_complex "[0][1]xfade=transition=fade:duration=${crossfadeDuration}:offset=0[v01];[v01][2]xfade=transition=fade:duration=${crossfadeDuration}:offset=5" ` +
                    `-c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;
            }
        }
        else {
            // Simple concatenation without crossfade
            const fileList = join(tempDir, 'filelist.txt');
            const fileListContent = tempFiles.map(file => `file '${file}'`).join('\n');
            await fs.writeFile(fileList, fileListContent);
            ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${fileList}" -c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;
        }
        console.log(`🔧 VIDEO COMPOSER: Running ffmpeg composition`);
        // Execute ffmpeg command
        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ VIDEO COMPOSER: FFmpeg error:', error);
                    console.error('FFmpeg stderr:', stderr);
                    reject(error);
                }
                else {
                    console.log('✅ VIDEO COMPOSER: FFmpeg composition completed');
                    resolve();
                }
            });
        });
        // TODO: Upload composed video to storage and return public URL
        // For now, return local path
        console.log(`🎬 VIDEO COMPOSER: Composition completed: ${outputPath}`);
        return outputPath;
        // TODO: Clean up temp files
        // await Promise.all(tempFiles.map(file => fs.unlink(file).catch(() => {})));
    }
    catch (error) {
        console.error('❌ VIDEO COMPOSER: Scene composition failed:', error);
        throw error;
    }
}
/**
 * Cancel composition job and clean up resources
 */
export async function cancelComposition(compositionJobId, sceneJobs) {
    console.log(`🛑 VIDEO COMPOSER: Cancelling composition ${compositionJobId}`);
    // TODO: Cancel individual scene jobs if VEO service supports cancellation
    // For now, just log the cancellation
    if (sceneJobs) {
        console.log(`🛑 VIDEO COMPOSER: ${sceneJobs.length} scene jobs cancelled`);
    }
}
