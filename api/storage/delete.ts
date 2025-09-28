/**
 * Storage Delete API Endpoint
 * SSELFIE Platform - File Delete API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageService } from '../../shared/storage/storage-service';
import { FeatureFlags } from '../../server/utils/feature-flags';

export async function DELETE(request: NextRequest) {
  try {
    // Check if storage features are enabled
    if (!FeatureFlags.isEnabled('STORAGE_IMAGE_OPTIMIZATION')) {
      return NextResponse.json(
        { error: 'Storage service is not enabled' },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'No key provided' },
        { status: 400 }
      );
    }

    // Get storage service
    const storageService = getStorageService();

    // Delete file
    await storageService.delete(key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      key,
    });

  } catch (error: any) {
    console.error('Delete API error:', error);

    // Handle different error types
    if (error.type === 'permission') {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 403 }
      );
    }

    if (error.code === 'NoSuchKey' || error.name === 'NotFound') {
      return NextResponse.json(
        { error: 'File not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Delete failed', message: error.message },
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}