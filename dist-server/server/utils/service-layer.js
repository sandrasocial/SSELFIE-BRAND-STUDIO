import { Logger } from './logger.js';
import { errorHandler } from './error-handler.js';
export class BaseService {
    logger;
    serviceName;
    isEnabled;
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.logger = new Logger(serviceName);
        this.isEnabled = true;
    }
    createSuccessResponse(data, message) {
        return {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
        };
    }
    createErrorResponse(error, message) {
        return {
            success: false,
            error,
            message: message || undefined,
            timestamp: new Date().toISOString(),
        };
    }
    handleError(error, context) {
        this.logger.error(`Service error in ${this.serviceName}`, {
            error: error.message,
            stack: error.stack,
            context,
        });
        return this.createErrorResponse(error.message, `An error occurred in ${this.serviceName}`);
    }
    validateInput(data, requiredFields) {
        const missing = requiredFields.filter(field => !data[field]);
        if (missing.length > 0) {
            throw errorHandler.createError(`Missing required fields: ${missing.join(', ')}`, 'VALIDATION_ERROR', 400);
        }
    }
    createPaginatedResponse(data, pagination, total) {
        const totalPages = Math.ceil(total / pagination.limit);
        return {
            success: true,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages,
                hasNext: pagination.page < totalPages,
                hasPrev: pagination.page > 1,
            },
            timestamp: new Date().toISOString(),
        };
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.info(`Service ${this.serviceName} ${enabled ? 'enabled' : 'disabled'}`);
    }
    getEnabled() {
        return this.isEnabled;
    }
}
export class UserService extends BaseService {
    constructor() {
        super('UserService');
    }
    async getUserById(userId) {
        try {
            this.validateInput({ userId }, ['userId']);
            const user = {
                id: userId,
                email: 'user@example.com',
                displayName: 'John Doe',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(user, 'User retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getUserById');
        }
    }
    async getUserByEmail(email) {
        try {
            this.validateInput({ email }, ['email']);
            errorHandler.validateEmail(email);
            const user = {
                id: 'user_123',
                email,
                displayName: 'John Doe',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(user, 'User retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getUserByEmail');
        }
    }
    async createUser(userData) {
        try {
            this.validateInput(userData, ['email', 'displayName']);
            errorHandler.validateEmail(userData.email);
            const user = {
                id: `user_${Date.now()}`,
                ...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(user, 'User created successfully');
        }
        catch (error) {
            return this.handleError(error, 'createUser');
        }
    }
    async updateUserProfile(userId, updates) {
        try {
            this.validateInput({ userId }, ['userId']);
            const user = {
                id: userId,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(user, 'User profile updated successfully');
        }
        catch (error) {
            return this.handleError(error, 'updateUserProfile');
        }
    }
    async getAllUsers(pagination) {
        try {
            const users = Array.from({ length: 50 }, (_, i) => ({
                id: `user_${i + 1}`,
                email: `user${i + 1}@example.com`,
                displayName: `User ${i + 1}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }));
            const startIndex = (pagination.page - 1) * pagination.limit;
            const endIndex = startIndex + pagination.limit;
            const paginatedUsers = users.slice(startIndex, endIndex);
            return this.createPaginatedResponse(paginatedUsers, pagination, users.length);
        }
        catch (error) {
            return this.handleError(error, 'getAllUsers');
        }
    }
}
export class AIGenerationService extends BaseService {
    constructor() {
        super('AIGenerationService');
    }
    async draftStory(userId, concept) {
        try {
            this.validateInput({ userId, concept }, ['userId', 'concept']);
            const story = {
                id: `story_${Date.now()}`,
                userId,
                concept,
                content: `This is a draft story based on: ${concept}`,
                status: 'draft',
                createdAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(story, 'Story drafted successfully');
        }
        catch (error) {
            return this.handleError(error, 'draftStory');
        }
    }
    async generateStory(userId, concept, style, length) {
        try {
            this.validateInput({ userId, concept }, ['userId', 'concept']);
            const story = {
                id: `story_${Date.now()}`,
                userId,
                concept,
                style: style || 'default',
                length: length || 'medium',
                content: `This is a generated story based on: ${concept}`,
                status: 'generated',
                createdAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(story, 'Story generated successfully');
        }
        catch (error) {
            return this.handleError(error, 'generateStory');
        }
    }
    async getStoryStatus(userId, jobId) {
        try {
            this.validateInput({ userId, jobId }, ['userId', 'jobId']);
            const status = {
                jobId,
                userId,
                status: 'completed',
                progress: 100,
                result: {
                    id: `story_${jobId}`,
                    content: 'Generated story content',
                    createdAt: new Date().toISOString(),
                },
                createdAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(status, 'Story status retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getStoryStatus');
        }
    }
    async generateVideoFromStory(userId, story, style, duration) {
        try {
            this.validateInput({ userId, story }, ['userId', 'story']);
            const video = {
                id: `video_${Date.now()}`,
                userId,
                story,
                style: style || 'default',
                duration: duration || 30,
                status: 'generating',
                createdAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(video, 'Video generation started');
        }
        catch (error) {
            return this.handleError(error, 'generateVideoFromStory');
        }
    }
    async generateVideo(userId, prompt, style, duration) {
        try {
            this.validateInput({ userId, prompt }, ['userId', 'prompt']);
            const video = {
                id: `video_${Date.now()}`,
                userId,
                prompt,
                style: style || 'default',
                duration: duration || 30,
                status: 'generating',
                createdAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(video, 'Video generation started');
        }
        catch (error) {
            return this.handleError(error, 'generateVideo');
        }
    }
    async getUserVideos(userId) {
        try {
            this.validateInput({ userId }, ['userId']);
            const videos = Array.from({ length: 10 }, (_, i) => ({
                id: `video_${i + 1}`,
                userId,
                prompt: `Video prompt ${i + 1}`,
                status: 'completed',
                createdAt: new Date().toISOString(),
            }));
            return this.createSuccessResponse(videos, 'Videos retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getUserVideos');
        }
    }
    async generateAiImages(userId, prompt, style, count) {
        try {
            this.validateInput({ userId, prompt }, ['userId', 'prompt']);
            const images = {
                id: `images_${Date.now()}`,
                userId,
                prompt,
                style: style || 'default',
                count: count || 1,
                status: 'generating',
                createdAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(images, 'Image generation started');
        }
        catch (error) {
            return this.handleError(error, 'generateAiImages');
        }
    }
    async getAiImages(userId) {
        try {
            this.validateInput({ userId }, ['userId']);
            const images = Array.from({ length: 20 }, (_, i) => ({
                id: `image_${i + 1}`,
                userId,
                prompt: `Image prompt ${i + 1}`,
                url: `https://example.com/image_${i + 1}.jpg`,
                status: 'completed',
                createdAt: new Date().toISOString(),
            }));
            return this.createSuccessResponse(images, 'Images retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getAiImages');
        }
    }
    async getMayaChats(userId) {
        try {
            this.validateInput({ userId }, ['userId']);
            const chats = Array.from({ length: 15 }, (_, i) => ({
                id: `chat_${i + 1}`,
                userId,
                message: `Maya chat message ${i + 1}`,
                response: `Maya response ${i + 1}`,
                createdAt: new Date().toISOString(),
            }));
            return this.createSuccessResponse(chats, 'Maya chats retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getMayaChats');
        }
    }
    async getCategorizedMayaChats(userId) {
        try {
            this.validateInput({ userId }, ['userId']);
            const categorizedChats = {
                photography: [
                    { id: 'chat_1', message: 'Photography question 1', response: 'Photography answer 1' },
                    { id: 'chat_2', message: 'Photography question 2', response: 'Photography answer 2' },
                ],
                branding: [
                    { id: 'chat_3', message: 'Branding question 1', response: 'Branding answer 1' },
                    { id: 'chat_4', message: 'Branding question 2', response: 'Branding answer 2' },
                ],
                business: [
                    { id: 'chat_5', message: 'Business question 1', response: 'Business answer 1' },
                    { id: 'chat_6', message: 'Business question 2', response: 'Business answer 2' },
                ],
            };
            return this.createSuccessResponse(categorizedChats, 'Categorized Maya chats retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getCategorizedMayaChats');
        }
    }
}
export class AdminService extends BaseService {
    constructor() {
        super('AdminService');
    }
    async getDashboardData() {
        try {
            const dashboardData = {
                users: {
                    total: 1250,
                    active: 890,
                    new: 45,
                },
                revenue: {
                    total: 125000,
                    monthly: 15000,
                },
                content: {
                    images: 5000,
                    videos: 1200,
                    stories: 800,
                },
                system: {
                    uptime: '99.9%',
                    responseTime: '250ms',
                    errorRate: '0.1%',
                },
            };
            return this.createSuccessResponse(dashboardData, 'Dashboard data retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getDashboardData');
        }
    }
    async getAllUsers() {
        try {
            const users = Array.from({ length: 100 }, (_, i) => ({
                id: `user_${i + 1}`,
                email: `user${i + 1}@example.com`,
                displayName: `User ${i + 1}`,
                status: 'active',
                createdAt: new Date().toISOString(),
            }));
            return this.createSuccessResponse(users, 'Users retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getAllUsers');
        }
    }
    async getUserById(userId) {
        try {
            this.validateInput({ userId }, ['userId']);
            const user = {
                id: userId,
                email: 'user@example.com',
                displayName: 'John Doe',
                status: 'active',
                subscription: {
                    plan: 'premium',
                    status: 'active',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return this.createSuccessResponse(user, 'User retrieved successfully');
        }
        catch (error) {
            return this.handleError(error, 'getUserById');
        }
    }
}
export const userService = new UserService();
export const aiGenerationService = new AIGenerationService();
export const adminService = new AdminService();
//# sourceMappingURL=service-layer.js.map