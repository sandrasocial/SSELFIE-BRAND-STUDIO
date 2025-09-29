import sharp from './image-compression-placeholder.js';
import { Buffer } from 'buffer';
export class ImageCompressionService {
    static async compressImageForTraining(base64Image) {
        try {
            const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
            const originalBuffer = Buffer.from(base64Data, 'base64');
            const originalSize = originalBuffer.length;
            const compressedBuffer = await sharp(originalBuffer)
                .resize(1024, 1024)
                .jpeg()
                .toBuffer();
            const compressedBase64 = compressedBuffer.toString('base64');
            const compressedSize = compressedBuffer.length;
            return {
                compressedBase64,
                originalSize,
                compressedSize
            };
        }
        catch (error) {
            console.error('Image compression failed:', error);
            throw new Error('Failed to compress image');
        }
    }
    static async compressImagesForTraining(base64Images) {
        const results = await Promise.all(base64Images.map(img => this.compressImageForTraining(img)));
        const compressedImages = results.map(r => r.compressedBase64);
        const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
        const compressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;
        console.log(`🗜️ Image compression complete: ${results.length} images`);
        console.log(`📊 Size reduction: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB → ${(totalCompressedSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio.toFixed(1)}% reduction)`);
        return {
            compressedImages,
            compressionStats: {
                totalOriginalSize,
                totalCompressedSize,
                compressionRatio
            }
        };
    }
}
//# sourceMappingURL=image-compression-service.js.map