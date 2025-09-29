import { BaseService } from './base-service.js';
export class AIGenerationService extends BaseService {
    async generateStoryDraft(request) {
        try {
            this.validateRequired(request, ['concept', 'userId']);
            const sanitizedRequest = this.sanitizeInput(request);
            const jobId = this.generateId('draft');
            const job = {
                jobId,
                type: 'story',
                status: 'pending',
                progress: 0,
                request: sanitizedRequest,
                startedAt: new Date()
            };
            this.log('info', 'Generating story draft', { jobId, concept: sanitizedRequest.concept });
            job.status = 'completed';
            job.progress = 100;
            job.completedAt = new Date();
            return {
                jobId,
                status: job.status,
                progress: job.progress
            };
        }
        catch (error) {
            const serviceError = {
                name: 'GenerationError',
                message: error instanceof Error ? error.message : 'Story draft generation failed',
                code: 'STORY_DRAFT_ERROR',
                type: 'processing',
                jobId: this.generateId('draft'),
                request,
                context: {
                    service: 'story_draft',
                    timestamp: new Date().toISOString()
                }
            };
            throw serviceError;
        }
    }
    async generateStory(request) {
        try {
            this.validateRequired(request, ['concept', 'userId']);
            const sanitizedRequest = this.sanitizeInput(request);
            const jobId = this.generateId('story');
            const job = {
                jobId,
                type: 'story',
                status: 'pending',
                progress: 0,
                request: sanitizedRequest,
                startedAt: new Date()
            };
            this.log('info', 'Generating full story', { jobId, concept: sanitizedRequest.concept });
            job.status = 'completed';
            job.progress = 100;
            job.completedAt = new Date();
            return {
                jobId: job.jobId,
                status: job.status,
                progress: job.progress
            };
        }
        catch (error) {
            const serviceError = {
                name: 'GenerationError',
                message: error instanceof Error ? error.message : 'Story generation failed',
                code: 'STORY_ERROR',
                type: 'processing',
                jobId: this.generateId('story'),
                request,
                context: {
                    service: 'story',
                    timestamp: new Date().toISOString()
                }
            };
            throw serviceError;
        }
    }
    async generateVideoFromStory(request) {
        try {
            this.validateRequired(request, ['userId']);
            if (!request.storyId && !request.prompt) {
                const validationError = {
                    name: 'ValidationError',
                    message: 'Either storyId or prompt is required',
                    code: 'INVALID_REQUEST',
                    type: 'validation',
                    request
                };
                throw validationError;
            }
            const sanitizedRequest = this.sanitizeInput(request);
            const jobId = this.generateId('video');
            const job = {
                jobId,
                type: 'video',
                status: 'processing',
                progress: 0,
                request: sanitizedRequest,
                startedAt: new Date()
            };
            this.log('info', 'Generating video from story', { jobId, storyId: sanitizedRequest.storyId });
            return {
                jobId: job.jobId,
                status: job.status,
                progress: 0
            };
        }
        catch (error) {
            if (error.type === 'validation') {
                throw error;
            }
            const serviceError = {
                name: 'GenerationError',
                message: error instanceof Error ? error.message : 'Video generation failed',
                code: 'VIDEO_ERROR',
                type: 'processing',
                jobId: this.generateId('video'),
                request,
                context: {
                    service: 'video',
                    timestamp: new Date().toISOString()
                }
            };
            throw serviceError;
        }
    }
    async generateImages(request) {
        try {
            this.validateRequired(request, ['prompt', 'userId']);
            const sanitizedRequest = this.sanitizeInput(request);
            const jobId = this.generateId('image_job');
            const job = {
                jobId,
                type: 'image',
                status: 'processing',
                progress: 0,
                request: sanitizedRequest,
                startedAt: new Date()
            };
            this.log('info', 'Generating AI images', {
                jobId,
                prompt: sanitizedRequest.prompt,
                count: sanitizedRequest.count || 1,
                size: sanitizedRequest.size || '1024x1024'
            });
            return {
                jobId: job.jobId,
                status: job.status,
                progress: 0
            };
        }
        catch (error) {
            const serviceError = {
                name: 'GenerationError',
                message: error instanceof Error ? error.message : 'Image generation failed',
                code: 'IMAGE_ERROR',
                type: 'processing',
                jobId: this.generateId('image_job'),
                request,
                context: {
                    service: 'image',
                    timestamp: new Date().toISOString()
                }
            };
            throw serviceError;
        }
    }
    async getGenerationStatus(jobId) {
        try {
            if (!jobId) {
                const validationError = {
                    name: 'ValidationError',
                    message: 'Job ID is required',
                    code: 'INVALID_JOB_ID',
                    type: 'validation'
                };
                throw validationError;
            }
            this.log('info', 'Getting generation status', { jobId });
            return {
                jobId,
                status: 'completed',
                progress: 100
            };
        }
        catch (error) {
            if (error.type === 'validation') {
                throw error;
            }
            const serviceError = {
                name: 'StatusError',
                message: error instanceof Error ? error.message : 'Failed to get generation status',
                code: 'STATUS_ERROR',
                type: 'service',
                jobId,
                context: {
                    service: 'status',
                    timestamp: new Date().toISOString()
                }
            };
            throw serviceError;
        }
    }
}
export const aiGenerationService = new AIGenerationService();
//# sourceMappingURL=ai-generation-service.js.map