/**
 * Live Sales Data API Endpoint by Region
 * Returns real-time sales data for specific regions/categories for live chart visualization
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

// Region configuration with base revenue ranges
const REGION_CONFIG: Record<string, { baseRevenue: number; variance: number; baseOrders: number }> = {
  'north-america': { baseRevenue: 8000, variance: 5000, baseOrders: 15 },
  'europe': { baseRevenue: 6000, variance: 4000, baseOrders: 12 },
  'asia': { baseRevenue: 10000, variance: 6000, baseOrders: 20 },
  'online': { baseRevenue: 12000, variance: 8000, baseOrders: 25 },
  'retail': { baseRevenue: 4000, variance: 3000, baseOrders: 10 },
  'wholesale': { baseRevenue: 15000, variance: 10000, baseOrders: 30 },
};

// Default region config if region not found
const DEFAULT_CONFIG = { baseRevenue: 5000, variance: 3000, baseOrders: 10 };

// Generate a single live data point with timestamp for a specific region
function generateLiveDataPoint(region: string, timestamp?: Date): LiveSalesDataPoint {
  const now = timestamp || new Date();
  const config = REGION_CONFIG[region] || DEFAULT_CONFIG;
  
  // Generate realistic sales data with region-specific variation
  const baseRevenue = config.baseRevenue + (Math.random() - 0.5) * config.variance;
  const revenue = Math.max(0, Math.round(baseRevenue * 100) / 100);
  const orders = Math.max(1, Math.floor(config.baseOrders + (Math.random() - 0.5) * 10));
  const sales = revenue; // Sales equals revenue in this context
  
  return {
    timestamp: now.toISOString(),
    revenue,
    sales,
    orders,
  };
}

// Generate historical data points for initial load
function generateInitialDataPoints(region: string, count: number = 15): LiveSalesDataPoint[] {
  const points: LiveSalesDataPoint[] = [];
  const now = new Date();
  
  // Generate points going back in time (one per second)
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 1000));
    points.push(generateLiveDataPoint(region, timestamp));
  }
  
  return points;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const initial = searchParams.get('initial') === 'true';
    const region = searchParams.get('region') || 'north-america';
    
    // Validate region exists or use default
    const validRegion = REGION_CONFIG[region] ? region : 'north-america';
    
    let dataPoints: LiveSalesDataPoint[];
    
    if (initial) {
      // Return 15 historical data points for initial load
      dataPoints = generateInitialDataPoints(validRegion, 15);
    } else {
      // Return a single current data point for subsequent updates
      dataPoints = [generateLiveDataPoint(validRegion)];
    }
    
    const response: LiveSalesResponse = {
      data: dataPoints,
      lastUpdate: new Date().toISOString(),
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('Live Sales Region API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch live sales data for region',
      500
    );
  }
}

