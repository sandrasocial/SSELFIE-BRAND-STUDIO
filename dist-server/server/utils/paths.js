import path from 'path';
export const paths = {
    modelBase: process.env['MODEL_BASE_PATH'] || 'models',
    getUserModelPath: (userId, suffix = 'selfie-lora') => path.join(process.env['MODEL_BASE_PATH'] || 'models', `${userId}-${suffix}`),
    getTrainingDataPath: (userId) => path.join(process.env['MODEL_BASE_PATH'] || 'models', userId, 'training-data'),
    getValidationPath: (userId) => path.join(process.env['MODEL_BASE_PATH'] || 'models', userId, 'validation'),
    getCheckpointPath: (userId) => path.join(process.env['MODEL_BASE_PATH'] || 'models', userId, 'checkpoints'),
    getTempUploadPath: () => path.join(process.env['TEMP_PATH'] || 'tmp', 'uploads'),
};
export const getAbsolutePath = (relativePath) => path.resolve(relativePath);
export default paths;
//# sourceMappingURL=paths.js.map