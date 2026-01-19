/**
 * Main Dashboard API Endpoint
 * Aggregates data from multiple sources for enterprise dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey } from '@/lib/api-helpers';
import { apiClient } from '@/lib/api-client';
import { aggregateData, processTimeSeries, calculateGrowthRates } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

interface DashboardData {
  kpis: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
    customerCount: number;
    customerGrowth: number;
    activeUsers: number;
    churnRate: number;
  };
  // E-Commerce: Admin KPI Widgets (Top Cards)
  kpiWidgets: {
    conversionRate: {
      value: number;
      target: number;
      percentage: number;
    };
    orderSuccessRate: {
      value: number;
      target: number;
      percentage: number;
    };
    dailyTarget: {
      value: number;
      target: number;
      percentage: number;
    };
    trendIndicator: Array<{
      date: string;
      value: number;
    }>;
  };
  monthlySales: Array<{
    month: string;
    revenue: number;
    orders: number;
    target: number;
    growth: number;
  }>;
  salesByCategory: Array<{
    category: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  revenueByChannel: Array<{
    channel: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics: Array<{
    name: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

async function fetchDashboardData(): Promise<DashboardData> {
  // In a real implementation, fetch from external APIs
  // For now, we'll simulate with mock data that can be replaced with actual API calls
  
  // Example: Fetch from external API
  // const salesResponse = await apiClient.get('/sales', { period: 'monthly' });
  // const ordersResponse = await apiClient.get('/orders', { status: 'all' });
  // etc.

  // Simulated data processing with high computation
  const mockSalesData = generateMockSalesData();
  const mockOrdersData = generateMockOrdersData();
  const mockCustomerData = generateMockCustomerData();

  // Process with computation engine
  const monthlySales = processTimeSeries(mockSalesData, {
    dateField: 'date',
    valueField: 'revenue',
    interval: 'month',
  });

  const salesByCategory = aggregateData(mockSalesData, {
    groupBy: 'category',
    aggregations: {
      revenue: 'sum',
      orders: 'sum',
    },
  });

  const revenueByChannel = aggregateData(mockSalesData, {
    groupBy: 'channel',
    aggregations: {
      revenue: 'sum',
      orders: 'sum',
    },
  });

  // Calculate percentages
  const totalRevenue = revenueByChannel.reduce((sum, item) => sum + item.revenue, 0);
  const revenueByChannelWithPercentage = revenueByChannel.map((item) => ({
    ...item,
    percentage: (item.revenue / totalRevenue) * 100,
  }));

  // Calculate growth rates
  const monthlySalesWithGrowth = calculateGrowthRates(
    monthlySales.map((item) => ({ date: item.date, value: item.value }))
  );

  // E-Commerce: KPI Widgets (for gauge charts and sparklines)
  // Calculate daily trends first (needed for todayRevenue calculation)
  const dailyTrends = processTimeSeries(mockSalesData, {
    dateField: 'date',
    valueField: 'revenue',
    interval: 'day',
  });
  const trendIndicator = dailyTrends.slice(-30).map((item) => ({
    date: item.date,
    value: item.value,
  }));

  // Calculate KPIs
  const totalOrders = mockOrdersData.reduce((sum, item) => sum + item.count, 0);
  const totalRevenueKPI = monthlySales.reduce((sum, item) => sum + item.sum, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenueKPI / totalOrders : 0;
  const conversionRate = 3.4;
  const completedOrders = mockOrdersData.find((o) => o.status === 'Completed')?.count || 0;
  const orderSuccessRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  const dailyTarget = 50000; // $50k daily target
  
  // Get today's revenue from daily trends (last entry)
  const todayRevenue = dailyTrends.length > 0 
    ? dailyTrends[dailyTrends.length - 1]?.value || Math.random() * 20000 + 30000
    : Math.random() * 20000 + 30000; // Fallback: random value between $30k-$50k

  return {
    kpis: {
      totalRevenue: totalRevenueKPI,
      revenueGrowth: monthlySalesWithGrowth[monthlySalesWithGrowth.length - 1]?.growthRate || 0,
      totalOrders,
      avgOrderValue,
      conversionRate,
      customerCount: mockCustomerData.total,
      customerGrowth: mockCustomerData.growth,
      activeUsers: mockCustomerData.active,
      churnRate: mockCustomerData.churn,
    },
    // E-Commerce: KPI Widgets
    kpiWidgets: {
      conversionRate: {
        value: conversionRate,
        target: 5.0,
        percentage: (conversionRate / 5.0) * 100,
      },
      orderSuccessRate: {
        value: orderSuccessRate,
        target: 95.0,
        percentage: orderSuccessRate,
      },
      dailyTarget: {
        value: todayRevenue,
        target: dailyTarget,
        percentage: (todayRevenue / dailyTarget) * 100,
      },
      trendIndicator,
    },
    monthlySales: monthlySalesWithGrowth.map((item, index) => ({
      month: item.date,
      revenue: item.value,
      orders: Math.floor(item.value / 300), // Simulated
      target: item.value * 1.1, // 10% above actual
      growth: item.growthRate,
    })),
    salesByCategory: salesByCategory.map((item) => ({
      category: item.category,
      revenue: item.revenue,
      orders: item.orders,
      growth: Math.random() * 20 - 5, // Simulated growth
    })),
    revenueByChannel: revenueByChannelWithPercentage,
    ordersByStatus: mockOrdersData.map((item) => ({
      ...item,
      percentage: (item.count / totalOrders) * 100,
    })),
    performanceMetrics: [
      { name: 'Revenue', value: 85, target: 90, trend: 'up' },
      { name: 'Orders', value: 78, target: 85, trend: 'up' },
      { name: 'Conversion', value: 92, target: 95, trend: 'stable' },
      { name: 'Customer Satisfaction', value: 88, target: 90, trend: 'up' },
      { name: 'Growth Rate', value: 75, target: 80, trend: 'up' },
      { name: 'Market Share', value: 82, target: 85, trend: 'stable' },
    ],
  };
}

// Mock data generators (replace with actual API calls)
function generateMockSalesData() {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors'];
  const channels = ['Direct', 'Organic Search', 'Paid Search', 'Social Media'];
  const data = [];

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - i));
    data.push({
      date: date.toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      revenue: Math.random() * 10000 + 5000,
      orders: Math.floor(Math.random() * 50) + 10,
    });
  }
  return data;
}

function generateMockOrdersData() {
  return [
    { status: 'Completed', count: 19450 },
    { status: 'Processing', count: 3250 },
    { status: 'Pending', count: 1450 },
    { status: 'Cancelled', count: 417 },
  ];
}

function generateMockCustomerData() {
  return {
    total: 125000,
    growth: 12.5,
    active: 89000,
    churn: 2.3,
  };
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = getCacheKey(request);
    
    const data = await getCachedOrFetch(
      cacheKey,
      fetchDashboardData,
      5 * 60 * 1000 // 5 minutes cache
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      500
    );
  }
}

