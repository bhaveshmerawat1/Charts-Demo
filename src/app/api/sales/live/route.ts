/**
 * Live Sales Data API Endpoint
 * Returns real-time sales data for live chart visualization
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LiveSalesDataPoint {
  timestamp: string; // ISO timestamp
  revenue: number;
  sales: number;
  orders: number;
}

interface LiveSalesResponse {
  data: LiveSalesDataPoint[];
  lastUpdate: string;
}

// Generate a single live data point with timestamp
function generateLiveDataPoint(timestamp?: Date): LiveSalesDataPoint {
  const now = timestamp || new Date();
  
  // Generate realistic sales data with some variation
  const baseRevenue = 5000 + Math.random() * 10000;
  const revenue = Math.round(baseRevenue * 100) / 100;
  const orders = Math.floor(Math.random() * 20) + 5;
  const sales = revenue; // Sales equals revenue in this context
  
  return {
    timestamp: now.toISOString(),
    revenue,
    sales,
    orders,
  };
}

// Generate historical data points for initial load
function generateInitialDataPoints(count: number = 15): LiveSalesDataPoint[] {
  const points: LiveSalesDataPoint[] = [];
  const now = new Date();
  
  // Generate points going back in time (one per second)
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 1000));
    points.push(generateLiveDataPoint(timestamp));
  }
  
  return points;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const initial = searchParams.get('initial') === 'true';
    
    let dataPoints: LiveSalesDataPoint[];
    
    if (initial) {
      // Return 15 historical data points for initial load
      dataPoints = generateInitialDataPoints(15);
    } else {
      // Return a single current data point for subsequent updates
      dataPoints = [generateLiveDataPoint()];
    }
    
    const response: LiveSalesResponse = {
      data: dataPoints,
      lastUpdate: new Date().toISOString(),
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('Live Sales API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch live sales data',
      500
    );
  }
}

