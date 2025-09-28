/**
 * Storage Info API Endpoint
 * SSELFIE Platform - File Info API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageService } from '../../../shared/storage/storage-service';
import { FeatureFlags } from '../../../server/utils/feature-flags';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Check if storage features are enabled
    if (!FeatureFlags.isEnabled('STORAGE_IMAGE_OPTIMIZATION')) {
      return NextResponse.json(
        { error: 'Storage service is not enabled' },
        { status: 503 }
      );
    }

    const { key } = params;
    if (!key) {
      return NextResponse.json(
        { error: 'No key provided' },
        { status: 400 }
      );
    }

    // Decode the key
    const decodedKey = decodeURIComponent(key);

    // Get storage service
    const storageService = getStorageService();

    try {
      // Check if file exists and get metadata
      const s3Client = (storageService as any).s3Client;
      const exists = await s3Client.exists(decodedKey);
      
      if (!exists) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }

      // Get file metadata
      const metadata = await s3Client.getMetadata(decodedKey);
      const url = storageService.getUrl(decodedKey);
      const responsiveUrls = storageService.getResponsiveUrls(decodedKey);

      return NextResponse.json({
        success: true,
        data: {
          key: decodedKey,
          url,
          responsiveUrls,
          metadata,
          exists: true,
        },
      });

    } catch (error: any) {
      if (error.name === 'NotFound' || error.code === 'NoSuchKey') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      throw error;
    }

  } catch (error: any) {
    console.error('Info API error:', error);

    return NextResponse.json(
      { error: 'Failed to get file info', message: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}