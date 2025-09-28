/**
 * Storage Upload API Endpoint
 * SSELFIE Platform - File Upload API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageService } from '../../shared/storage/storage-service';
import { FeatureFlags } from '../../server/utils/feature-flags';

export async function POST(request: NextRequest) {
  try {
    // Check if storage features are enabled
    if (!FeatureFlags.isEnabled('STORAGE_IMAGE_OPTIMIZATION')) {
      return NextResponse.json(
        { error: 'Storage service is not enabled' },
        { status: 503 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const key = formData.get('key') as string;
    const optionsStr = formData.get('options') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        { error: 'No key provided' },
        { status: 400 }
      );
    }

    // Parse options
    let options;
    try {
      options = optionsStr ? JSON.parse(optionsStr) : {};
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid options format' },
        { status: 400 }
      );
    }

    // Default upload options
    const uploadOptions = {
      contentType: file.type,
      maxSizeBytes: 50 * 1024 * 1024, // 50MB default
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
      optimize: FeatureFlags.isEnabled('STORAGE_IMAGE_OPTIMIZATION'),
      generateThumbnail: FeatureFlags.isEnabled('STORAGE_AUTO_THUMBNAILS'),
      validateImage: true,
      ...options,
    };

    // Get storage service
    const storageService = getStorageService();

    // Upload file
    const result = await storageService.upload(file, key, uploadOptions);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Upload API error:', error);

    // Handle different error types
    if (error.type === 'validation') {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    if (error.type === 'permission') {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 403 }
      );
    }

    if (error.type === 'quota') {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 413 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Upload failed', message: error.message },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}