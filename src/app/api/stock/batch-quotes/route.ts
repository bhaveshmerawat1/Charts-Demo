import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key is missing on the server' },
        { status: 500 }
      );
    }

    // For Basic plan, we'll fetch quotes one by one to avoid issues
    // and use caching to minimize API calls
    const results: Record<string, any> = {};
    const fetchPromises = symbols.map(async (symbol: string) => {
      const cacheKey = `quote-${symbol}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        results[symbol] = cached.data;
        return;
      }

      try {
        const response = await fetch(
          `${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status !== 'error') {
            cache.set(cacheKey, { data, timestamp: Date.now() });
            results[symbol] = data;
          } else {
            console.error('Batch quote API error for', symbol, data);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    });

    await Promise.all(fetchPromises);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Batch quotes API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch batch quotes' },
      { status: 500 }
    );
  }
}
