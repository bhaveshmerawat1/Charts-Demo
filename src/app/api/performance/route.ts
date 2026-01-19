/**
 * Performance Indicators API Endpoint
 * Key Performance Indicators (KPIs) and metrics
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { processTimeSeries, calculateGrowthRates, calculateMovingAverage } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface PerformanceData {
  kpis: {
    financial: Array<{ name: string; value: number; target: number; trend: 'up' | 'down' | 'stable'; unit: string }>;
    operational: Array<{ name: string; value: number; target: number; trend: 'up' | 'down' | 'stable'; unit: string }>;
    customer: Array<{ name: string; value: number; target: number; trend: 'up' | 'down' | 'stable'; unit: string }>;
    employee: Array<{ name: string; value: number; target: number; trend: 'up' | 'down' | 'stable'; unit: string }>;
  };
  scorecard: {
    overall: number;
    byCategory: Array<{ category: string; score: number; weight: number }>;
    trends: Array<{ period: string; score: number }>;
  };
  benchmarks: {
    industry: Array<{ metric: string; ourValue: number; industryAvg: number; percentile: number }>;
    competitors: Array<{ metric: string; ourValue: number; competitorAvg: number; rank: number }>;
  };
  trends: {
    kpiTrends: Array<{ period: string; kpis: Record<string, number> }>;
    movingAverages: Array<{ period: string; value: number; movingAvg: number }>;
  };
}

async function fetchPerformanceData(startDate?: Date, endDate?: Date): Promise<PerformanceData> {
  const mockData = generateMockPerformanceData();
  
  const trends = processTimeSeries(mockData.metrics, {
    dateField: 'date',
    valueField: 'overallScore',
    interval: 'month',
  });

  const movingAvg = calculateMovingAverage(
    trends.map((item) => item.value),
    3 // 3-month moving average
  );

  const trendsWithGrowth = calculateGrowthRates(
    trends.map((item) => ({ date: item.date, value: item.value }))
  );

  return {
    kpis: {
      financial: [
        { name: 'Revenue', value: 8456789, target: 9000000, trend: 'up', unit: '$' },
        { name: 'Profit Margin', value: 28.5, target: 30, trend: 'up', unit: '%' },
        { name: 'ROI', value: 15.2, target: 18, trend: 'up', unit: '%' },
        { name: 'Cash Flow', value: 1250000, target: 1500000, trend: 'stable', unit: '$' },
      ],
      operational: [
        { name: 'Efficiency', value: 87.5, target: 90, trend: 'up', unit: '%' },
        { name: 'Quality Score', value: 94.5, target: 95, trend: 'up', unit: '%' },
        { name: 'On-Time Delivery', value: 96.2, target: 98, trend: 'up', unit: '%' },
        { name: 'Capacity Utilization', value: 82.5, target: 85, trend: 'stable', unit: '%' },
      ],
      customer: [
        { name: 'Customer Satisfaction', value: 4.3, target: 4.5, trend: 'up', unit: '/5' },
        { name: 'NPS', value: 52, target: 60, trend: 'up', unit: 'score' },
        { name: 'Retention Rate', value: 87.5, target: 90, trend: 'up', unit: '%' },
        { name: 'Churn Rate', value: 2.3, target: 2, trend: 'down', unit: '%' },
      ],
      employee: [
        { name: 'Employee Satisfaction', value: 4.1, target: 4.3, trend: 'up', unit: '/5' },
        { name: 'Productivity', value: 105, target: 110, trend: 'up', unit: 'index' },
        { name: 'Turnover Rate', value: 8.5, target: 7, trend: 'down', unit: '%' },
        { name: 'Training Hours', value: 40, target: 45, trend: 'up', unit: 'hours' },
      ],
    },
    scorecard: {
      overall: 85.2,
      byCategory: [
        { category: 'Financial', score: 88, weight: 30 },
        { category: 'Operational', score: 87, weight: 25 },
        { category: 'Customer', score: 84, weight: 25 },
        { category: 'Employee', score: 82, weight: 20 },
      ],
      trends: trendsWithGrowth.map((item) => ({
        period: item.date,
        score: item.value,
      })),
    },
    benchmarks: {
      industry: [
        { metric: 'Revenue Growth', ourValue: 15.8, industryAvg: 12.5, percentile: 75 },
        { metric: 'Profit Margin', ourValue: 28.5, industryAvg: 22.3, percentile: 80 },
        { metric: 'Customer Satisfaction', ourValue: 4.3, industryAvg: 4.1, percentile: 70 },
        { metric: 'Employee Satisfaction', ourValue: 4.1, industryAvg: 3.9, percentile: 65 },
      ],
      competitors: [
        { metric: 'Market Share', ourValue: 18.5, competitorAvg: 15.2, rank: 2 },
        { metric: 'Revenue', ourValue: 8456789, competitorAvg: 7200000, rank: 2 },
        { metric: 'Innovation Index', ourValue: 82, competitorAvg: 78, rank: 1 },
        { metric: 'Brand Recognition', ourValue: 75, competitorAvg: 72, rank: 2 },
      ],
    },
    trends: {
      kpiTrends: trends.map((item) => ({
        period: item.date,
        kpis: {
          revenue: item.value * 100000,
          efficiency: item.value * 1.1,
          satisfaction: item.value / 20,
          productivity: item.value * 1.2,
        },
      })),
      movingAverages: trends.map((item, index) => ({
        period: item.date,
        value: item.value,
        movingAvg: movingAvg[index] || item.value,
      })),
    },
  };
}

function generateMockPerformanceData() {
  const metrics = [];
  
  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - i));
    metrics.push({
      date: date.toISOString(),
      overallScore: 80 + Math.random() * 10,
    });
  }

  return { metrics };
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
      () => fetchPerformanceData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Performance API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch performance data',
      500
    );
  }
}



