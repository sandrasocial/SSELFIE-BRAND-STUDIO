import { BaseService } from './base-service.js';
export class UserService extends BaseService {
    async getUser(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            this.log('info', 'Getting user', { userId });
            const user = await this.storage.getUser(userId);
            if (!user) {
                this.log('warn', 'User not found', { userId });
                return null;
            }
            const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
            const updatedAt = user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt);
            return {
                id: user.id,
                email: user.email ?? null,
                displayName: user.displayName ?? null,
                firstName: user.firstName ?? null,
                lastName: user.lastName ?? null,
                gender: user.gender ?? null,
                profileImageUrl: user.profileImageUrl ?? null,
                createdAt,
                updatedAt
            };
        }
        catch (error) {
            this.handleError(error, 'getUser');
            return null;
        }
    }
    async updateUserProfile(userId, updates) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            const sanitizedUpdates = this.sanitizeInput(updates);
            if (sanitizedUpdates.gender && !['man', 'woman', 'other'].includes(sanitizedUpdates.gender)) {
                throw new Error('Invalid gender value. Must be "man", "woman", or "other"');
            }
            this.log('info', 'Updating user profile', { userId, updates: sanitizedUpdates });
            await this.storage.updateUserProfile(userId, {
                ...sanitizedUpdates,
                updatedAt: new Date()
            });
            const updatedUser = await this.getUser(userId);
            if (!updatedUser) {
                throw new Error('User not found after update');
            }
            return updatedUser;
        }
        catch (error) {
            this.handleError(error, 'updateUserProfile');
            return null;
        }
    }
    getDefaultUserFields(overrides = {}) {
        return {
            plan: 'sselfie-studio',
            role: 'user',
            monthlyGenerationLimit: 100,
            mayaAiAccess: true,
            victoriaAiAccess: false,
            preferredOnboardingMode: 'conversational',
            onboardingProgress: {},
            gender: '',
            profession: '',
            brandStyle: '',
            photoGoals: '',
            trainingCoachingStarted: false,
            trainingCoachingCompleted: false,
            trainingCoachingPhase: '',
            trainingCoachingStep: 0,
            brandStrategyContext: {},
            ...overrides
        };
    }
    async createUser(email, userData = {}) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }
            const sanitizedData = this.sanitizeInput(userData);
            const userId = sanitizedData.id || this.generateId('user');
            this.log('info', 'Creating new user', { email, userId, isStackAuthUser: !!sanitizedData.id });
            const currentDate = new Date();
            const newUser = await this.storage.createUser(this.getDefaultUserFields({
                id: userId,
                email,
                displayName: sanitizedData.displayName || email.split('@')[0],
                firstName: sanitizedData.firstName ?? null,
                lastName: sanitizedData.lastName ?? null,
                gender: sanitizedData.gender ?? null,
                profileImageUrl: sanitizedData.profileImageUrl ?? null,
                createdAt: currentDate,
                updatedAt: currentDate
            }));
            const createdAt = newUser.createdAt instanceof Date ? newUser.createdAt : new Date(newUser.createdAt);
            const updatedAt = newUser.updatedAt instanceof Date ? newUser.updatedAt : new Date(newUser.updatedAt);
            return {
                id: newUser.id,
                email: newUser.email ?? null,
                displayName: newUser.displayName ?? null,
                firstName: newUser.firstName ?? null,
                lastName: newUser.lastName ?? null,
                gender: newUser.gender ?? null,
                profileImageUrl: newUser.profileImageUrl ?? null,
                createdAt,
                updatedAt
            };
        }
        catch (error) {
            this.handleError(error, 'createUser');
            return null;
        }
    }
    async getUserByEmail(email) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }
            this.log('info', 'Getting user by email', { email });
            const user = await this.storage.getUserByEmail(email);
            if (!user) {
                this.log('warn', 'User not found by email', { email });
                return null;
            }
            const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
            const updatedAt = user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt);
            return {
                id: user.id,
                email: user.email ?? null,
                displayName: user.displayName ?? null,
                firstName: user.firstName ?? null,
                lastName: user.lastName ?? null,
                gender: user.gender ?? null,
                profileImageUrl: user.profileImageUrl ?? null,
                createdAt,
                updatedAt
            };
        }
        catch (error) {
            this.handleError(error, 'getUserByEmail');
            return null;
        }
    }
}
export const userService = new UserService();
//# sourceMappingURL=user-service.js.map