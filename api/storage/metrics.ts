/**
 * Storage Metrics API Endpoint
 * SSELFIE Platform - Storage Metrics API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageService } from '../../shared/storage/storage-service';
import { FeatureFlags } from '../../server/utils/feature-flags';

export async function GET(request: NextRequest) {
  try {
    // Check if monitoring is enabled
    if (!FeatureFlags.isEnabled('STORAGE_ENABLE_METRICS')) {
      return NextResponse.json(
        { error: 'Storage metrics are not enabled' },
        { status: 503 }
      );
    }

    // Get storage service
    const storageService = getStorageService();

    // Get metrics
    const metrics = storageService.getMetrics();
    const cacheStats = await storageService.getCacheStats();

    return NextResponse.json({
      success: true,
      data: {
        storage: metrics,
        cache: cacheStats,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Metrics API error:', error);

    return NextResponse.json(
      { error: 'Failed to get metrics', message: error.message },
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