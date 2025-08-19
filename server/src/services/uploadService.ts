import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UploadProgress {
  totalImages: number;
  uploadedImages: number;
  processingImages: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export const uploadService = {
  async uploadImages(
    userId: string,
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string[]> {
    const uploadUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        onProgress?.({
          totalImages: files.length,
          uploadedImages: i,
          processingImages: 0,
          status: 'uploading'
        });

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('selfie-uploads')
          .upload(`${userId}/${Date.now()}-${file.name}`, file);

        if (error) throw error;

        if (data) {
          const { publicURL } = supabase.storage
            .from('selfie-uploads')
            .getPublicUrl(data.path);

          if (publicURL) {
            uploadUrls.push(publicURL);
            
            // Track upload in database
            await supabase.from('selfie_uploads').insert({
              user_id: userId,
              image_url: publicURL,
              status: 'uploaded',
              metadata: {
                originalName: file.name,
                size: file.size,
                type: file.type
              }
            });
          }
        }
      }

      // Update final progress
      onProgress?.({
        totalImages: files.length,
        uploadedImages: files.length,
        processingImages: 0,
        status: 'complete'
      });

      return uploadUrls;
    } catch (error) {
      onProgress?.({
        totalImages: files.length,
        uploadedImages: 0,
        processingImages: 0,
        status: 'error',
        error: error.message
      });
      throw error;
    }
  },

  async getUploadStatus(userId: string): Promise<UploadProgress> {
    const { data, error } = await supabase
      .from('selfie_uploads')
      .select('status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data?.length) {
      return {
        totalImages: 0,
        uploadedImages: 0,
        processingImages: 0,
        status: 'pending'
      };
    }

    const { status } = data[0];
    
    return {
      totalImages: 1,
      uploadedImages: status === 'uploaded' ? 1 : 0,
      processingImages: status === 'processing' ? 1 : 0,
      status: status as UploadProgress['status']
    };
  }
};