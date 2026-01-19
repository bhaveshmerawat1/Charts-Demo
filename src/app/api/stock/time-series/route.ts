import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes cache for time series

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1day';
    const outputsize = searchParams.get('outputsize') || '30';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key is missing on the server' },
        { status: 500 }
      );
    }

    // Check cache first
    const cacheKey = `timeseries-${symbol}-${interval}-${outputsize}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ ...cached.data, cached: true });
    }

    // Fetch from Twelve Data API
    const response = await fetch(
      `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      console.error('Time series API returned error:', data);
      return NextResponse.json(
        { error: data.message || 'API error' },
        { status: 400 }
      );
    }

    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Time series API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch time series' },
      { status: 500 }
    );
  }
}
