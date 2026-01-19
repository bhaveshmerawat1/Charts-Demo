/**
 * API Helper utilities for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from './cache';

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: 'API Error',
      message,
      statusCode,
    },
    { status: statusCode }
  );
}

export function createSuccessResponse<T>(data: T, statusCode: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status: statusCode });
}

export function getCacheKey(request: NextRequest): string {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
}

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

export function parseQueryParams(request: NextRequest): Record<string, string> {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function validateDateRange(startDate?: string, endDate?: string): {
  valid: boolean;
  start?: Date;
  end?: Date;
  error?: string;
} {
  if (!startDate && !endDate) {
    return { valid: true };
  }

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  if (startDate && isNaN(start!.getTime())) {
    return { valid: false, error: 'Invalid start date format' };
  }

  if (endDate && isNaN(end!.getTime())) {
    return { valid: false, error: 'Invalid end date format' };
  }

  if (start && end && start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  return { valid: true, start, end };
}



