/**
 * Storage URL API Endpoint
 * SSELFIE Platform - Generate Optimized URLs
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
    if (!FeatureFlags.isEnabled('STORAGE_CDN_CACHING')) {
      return NextResponse.json(
        { error: 'CDN service is not enabled' },
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined;
    const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : undefined;
    const format = searchParams.get('f') as 'jpeg' | 'png' | 'webp' | 'avif' | undefined;
    const fit = searchParams.get('fit') as 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | undefined;

    // Get storage service
    const storageService = getStorageService();

    // Generate optimized URL
    const url = storageService.getUrl(decodedKey, {
      width,
      height,
      quality,
      format,
      fit,
    });

    // If this is a direct image request, redirect to the optimized URL
    const accept = request.headers.get('accept');
    if (accept && accept.includes('image/')) {
      return NextResponse.redirect(url);
    }

    // Otherwise return JSON response
    return NextResponse.json({
      success: true,
      key: decodedKey,
      url,
      transformations: {
        width,
        height,
        quality,
        format,
        fit,
      },
    });

  } catch (error: any) {
    console.error('URL API error:', error);

    return NextResponse.json(
      { error: 'Failed to generate URL', message: error.message },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}