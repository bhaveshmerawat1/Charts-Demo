/**
 * Geographic Data API Endpoint
 * Location-based analytics and regional performance
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface GeographicData {
  overview: {
    totalRegions: number;
    totalCountries: number;
    totalRevenue: number;
    topRegion: string;
  };
  byRegion: Array<{
    region: string;
    revenue: number;
    orders: number;
    customers: number;
    growth: number;
    percentage: number;
  }>;
  byCountry: Array<{
    country: string;
    region: string;
    revenue: number;
    orders: number;
    customers: number;
    percentage: number;
  }>;
  byCity: Array<{
    city: string;
    country: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
  heatmap: Array<{
    location: string;
    latitude: number;
    longitude: number;
    value: number;
    label: string;
  }>;
  trends: {
    byRegion: Array<{ period: string; region: string; revenue: number }>;
  };
}

async function fetchGeographicData(startDate?: Date, endDate?: Date): Promise<GeographicData> {
  const mockData = generateMockGeographicData();
  
  const salesByRegion = aggregateData(mockData.sales, {
    groupBy: 'region',
    aggregations: {
      revenue: 'sum',
      orders: 'sum',
    },
  });

  const salesByCountry = aggregateData(mockData.sales, {
    groupBy: ['region', 'country'],
    aggregations: {
      revenue: 'sum',
      orders: 'sum',
    },
  });

  const salesByCity = aggregateData(mockData.sales, {
    groupBy: ['country', 'city'],
    aggregations: {
      revenue: 'sum',
      orders: 'sum',
    },
  });

  const totalRevenue = salesByRegion.reduce((sum, item) => sum + item.revenue, 0);
  
  const customersByRegion = aggregateData(mockData.customers, {
    groupBy: 'region',
    aggregations: {},
  });

  const customersByCountry = aggregateData(mockData.customers, {
    groupBy: ['region', 'country'],
    aggregations: {},
  });

  const regionData = salesByRegion.map((item) => {
    const customerCount = mockData.customers.filter((c) => c.region === item.region).length;
    return {
      region: item.region,
      revenue: item.revenue,
      orders: item.orders,
      customers: customerCount,
      growth: Math.random() * 20 - 5,
      percentage: (item.revenue / totalRevenue) * 100,
    };
  });

  const countryData = salesByCountry.map((item) => {
    const customerCount = mockData.customers.filter(
      (c) => c.region === item.region && c.country === item.country
    ).length;
    return {
      country: item.country,
      region: item.region,
      revenue: item.revenue,
      orders: item.orders,
      customers: customerCount,
      percentage: (item.revenue / totalRevenue) * 100,
    };
  });

  const cityData = salesByCity
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 50)
    .map((item) => ({
      city: item.city,
      country: item.country,
      revenue: item.revenue,
      orders: item.orders,
      percentage: (item.revenue / totalRevenue) * 100,
    }));

  const heatmapData = countryData.map((item) => {
    const coords = getCountryCoordinates(item.country);
    return {
      location: item.country,
      latitude: coords.lat,
      longitude: coords.lng,
      value: item.revenue,
      label: `${item.country}: $${item.revenue.toLocaleString()}`,
    };
  });

  const trendsByRegion = processTimeSeries(mockData.sales, {
    dateField: 'date',
    valueField: 'revenue',
    interval: 'month',
  });

  return {
    overview: {
      totalRegions: new Set(mockData.sales.map((s) => s.region)).size,
      totalCountries: new Set(mockData.sales.map((s) => s.country)).size,
      totalRevenue,
      topRegion: regionData.sort((a, b) => b.revenue - a.revenue)[0]?.region || '',
    },
    byRegion: regionData.sort((a, b) => b.revenue - a.revenue),
    byCountry: countryData.sort((a, b) => b.revenue - a.revenue),
    byCity: cityData,
    heatmap: heatmapData,
    trends: {
      byRegion: trendsByRegion.map((item) => ({
        period: item.date,
        region: 'All', // Simplified - in production, group by region
        revenue: item.value,
      })),
    },
  };
}

function getCountryCoordinates(country: string): { lat: number; lng: number } {
  // Simplified coordinates - in production, use a proper geocoding service
  const coords: Record<string, { lat: number; lng: number }> = {
    'United States': { lat: 37.0902, lng: -95.7129 },
    'United Kingdom': { lat: 55.3781, lng: -3.4360 },
    'Germany': { lat: 51.1657, lng: 10.4515 },
    'France': { lat: 46.2276, lng: 2.2137 },
    'Japan': { lat: 36.2048, lng: 138.2529 },
    'China': { lat: 35.8617, lng: 104.1954 },
    'Canada': { lat: 56.1304, lng: -106.3468 },
    'Australia': { lat: -25.2744, lng: 133.7751 },
    'Brazil': { lat: -14.2350, lng: -51.9253 },
    'India': { lat: 20.5937, lng: 78.9629 },
  };
  return coords[country] || { lat: 0, lng: 0 };
}

function generateMockGeographicData() {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Japan', 'China', 'Australia', 'Brazil', 'India',
  ];
  const cities = [
    'New York', 'London', 'Tokyo', 'Paris', 'Berlin',
    'Sydney', 'Toronto', 'São Paulo', 'Mumbai', 'Shanghai',
  ];
  
  const sales = [];
  const customers = [];

  for (let i = 0; i < 1000; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    sales.push({
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      region,
      country,
      city,
      revenue: Math.random() * 10000 + 1000,
      orders: Math.floor(Math.random() * 20) + 1,
    });

    customers.push({
      region,
      country,
      city,
    });
  }

  return { sales, customers };
}

export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request);
    const { startDate, endDate } = params;
    
    const dateValidation = validateDateRange(startDate, endDate);
    if (!dateValidation.valid) {
      return createErrorResponse(dateValidation.error || 'Invalid date range', 400);
    }

    const cacheKey = getCacheKey(request);
    const data = await getCachedOrFetch(
      cacheKey,
      () => fetchGeographicData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Geographic API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch geographic data',
      500
    );
  }
}



