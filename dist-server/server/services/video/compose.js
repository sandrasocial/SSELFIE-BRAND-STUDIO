import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ulid } from 'ulid';
import { generateVeo3Video, getVeo3Status } from './veo3.js';
export async function composeStoryboard(options) {
    const { scenes, userId, mode, format = '9:16', crossfade = true } = options;
    const compositionJobId = `storyboard_${ulid()}`;
    console.log(`🎬 VIDEO COMPOSER: Starting storyboard composition for user ${userId}`, {
        sceneCount: scenes.length,
        mode,
        compositionJobId
    });
    try {
        if (scenes.length < 2 || scenes.length > 3) {
            throw new Error('Storyboard must have 2-3 scenes');
        }
        const sceneJobs = [];
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            if (!scene) {
                console.error(`❌ VIDEO COMPOSER: Scene ${i + 1} is undefined`);
                continue;
            }
            console.log(`🎥 VIDEO COMPOSER: Generating scene ${i + 1}/${scenes.length}`);
            try {
                const veoScene = {
                    prompt: scene.motionPrompt,
                    duration: Math.min(Math.max(scene.duration, 1), 12),
                    cameraMovement: 'slow push-in',
                    imageUrl: scene.imageUrl
                };
                let userLoraModel = null;
                try {
                    const { storage } = await import('../../storage.js');
                    const profile = await storage.getUserProfile(userId);
                    userLoraModel = profile?.replicateModelId || null;
                }
                catch (e) {
                    console.log('⚠️ VIDEO COMPOSER: Unable to load user profile for LoRA model (continuing)', e?.message);
                }
                const veoOptions = {
                    motionPrompt: veoScene.prompt,
                    mode: 'production',
                    userId,
                    aspectRatio: format === '9:16' ? '9:16' : '16:9'
                };
                if (veoScene.imageUrl) {
                    veoOptions.initImageUrl = veoScene.imageUrl;
                }
                const startResult = await generateVeo3Video(veoOptions);
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
        const updatedSceneJobs = await Promise.all(sceneJobs.map(async (sceneJob) => {
            if (sceneJob.status === 'completed' || sceneJob.status === 'failed') {
                return sceneJob;
            }
            try {
                const status = await getVeo3Status(sceneJob.jobId, userId);
                const updatedJob = {
                    sceneIndex: sceneJob.sceneIndex,
                    jobId: sceneJob.jobId,
                    status: status.status === 'completed' ? 'completed' :
                        status.status === 'failed' ? 'failed' : 'processing'
                };
                if (status.videoUrl) {
                    updatedJob.videoUrl = status.videoUrl;
                }
                return updatedJob;
            }
            catch (error) {
                console.error(`❌ VIDEO COMPOSER: Scene ${sceneJob.sceneIndex} status check failed:`, error);
                return {
                    sceneIndex: sceneJob.sceneIndex,
                    jobId: sceneJob.jobId,
                    status: 'failed'
                };
            }
        }));
        const completedScenes = updatedSceneJobs.filter((job) => job.status === 'completed' && job.videoUrl);
        const failedScenes = updatedSceneJobs.filter((job) => job.status === 'failed');
        const processingScenes = updatedSceneJobs.filter((job) => job.status === 'processing' || job.status === 'pending');
        if (failedScenes.length > 0) {
            return {
                jobId: compositionJobId,
                status: 'failed',
                sceneJobs: updatedSceneJobs,
                error: `${failedScenes.length} scene(s) failed to generate`
            };
        }
        if (processingScenes.length > 0) {
            return {
                jobId: compositionJobId,
                status: 'processing',
                sceneJobs: updatedSceneJobs
            };
        }
        if (completedScenes.length === sceneJobs.length) {
            console.log(`🎬 VIDEO COMPOSER: All scenes ready, composing final video`);
            const composedVideoUrl = await composeScenes(completedScenes.map((job) => job.videoUrl), crossfade);
            return {
                jobId: compositionJobId,
                status: 'completed',
                sceneJobs: updatedSceneJobs,
                composedVideoUrl
            };
        }
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
async function composeScenes(videoUrls, crossfade) {
    const tempDir = tmpdir();
    const outputPath = join(tempDir, `storyboard_${ulid()}.mp4`);
    console.log(`🔧 VIDEO COMPOSER: Composing ${videoUrls.length} scenes with ffmpeg`);
    try {
        const tempFiles = [];
        for (let i = 0; i < videoUrls.length; i++) {
            const videoUrl = videoUrls[i];
            if (!videoUrl) {
                console.error(`❌ VIDEO COMPOSER: Video URL ${i + 1} is undefined`);
                continue;
            }
            const tempFile = join(tempDir, `scene_${i}.mp4`);
            console.log(`📥 VIDEO COMPOSER: Downloading scene ${i + 1}: ${videoUrl}`);
            tempFiles.push(videoUrl);
        }
        let ffmpegCommand;
        if (crossfade && videoUrls.length > 1) {
            const crossfadeDuration = 0.5;
            if (videoUrls.length === 2) {
                ffmpegCommand = `ffmpeg -i "${tempFiles[0]}" -i "${tempFiles[1]}" ` +
                    `-filter_complex "[0][1]xfade=transition=fade:duration=${crossfadeDuration}:offset=0" ` +
                    `-c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;
            }
            else {
                ffmpegCommand = `ffmpeg -i "${tempFiles[0]}" -i "${tempFiles[1]}" -i "${tempFiles[2]}" ` +
                    `-filter_complex "[0][1]xfade=transition=fade:duration=${crossfadeDuration}:offset=0[v01];[v01][2]xfade=transition=fade:duration=${crossfadeDuration}:offset=5" ` +
                    `-c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;
            }
        }
        else {
            const fileList = join(tempDir, 'filelist.txt');
            const fileListContent = tempFiles.map(file => `file '${file}'`).join('\n');
            await fs.writeFile(fileList, fileListContent);
            ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${fileList}" -c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`;
        }
        console.log(`🔧 VIDEO COMPOSER: Running ffmpeg composition`);
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
        console.log(`🎬 VIDEO COMPOSER: Composition completed: ${outputPath}`);
        return outputPath;
    }
    catch (error) {
        console.error('❌ VIDEO COMPOSER: Scene composition failed:', error);
        throw error;
    }
}
export async function cancelComposition(compositionJobId, sceneJobs) {
    console.log(`🛑 VIDEO COMPOSER: Cancelling composition ${compositionJobId}`);
    if (sceneJobs) {
        console.log(`🛑 VIDEO COMPOSER: ${sceneJobs.length} scene jobs cancelled`);
    }
}
//# sourceMappingURL=compose.js.map