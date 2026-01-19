/**
 * Sales Analytics API Endpoint
 * Comprehensive sales data and analytics
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries, calculateGrowthRates, calculatePercentile } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface SalesData {
  overview: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    salesGrowth: number;
    orderGrowth: number;
  };
  // E-Commerce: Sales & Revenue Charts
  totalSalesOverTime: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  ordersOverTime: Array<{
    date: string;
    orders: number;
    value: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
  byTimePeriod: Array<{
    period: string;
    sales: number;
    orders: number;
    growth: number;
  }>;
  byRegion: Array<{
    region: string;
    sales: number;
    orders: number;
    percentage: number;
    growth: number;
  }>;
  byProduct: Array<{
    product: string;
    sales: number;
    units: number;
    margin: number;
  }>;
  bySalesRep: Array<{
    rep: string;
    sales: number;
    orders: number;
    quota: number;
    performance: number;
  }>;
  salesFunnel: {
    leads: number;
    qualified: number;
    proposals: number;
    closed: number;
    conversionRates: {
      leadToQualified: number;
      qualifiedToProposal: number;
      proposalToClosed: number;
    };
  };
  trends: {
    daily: Array<{ date: string; sales: number; orders: number }>;
    weekly: Array<{ week: string; sales: number; orders: number }>;
    monthly: Array<{ month: string; sales: number; orders: number }>;
  };
}

async function fetchSalesData(startDate?: Date, endDate?: Date): Promise<SalesData> {
  const mockData = generateMockSalesData();
  
  const salesByPeriod = processTimeSeries(mockData.sales, {
    dateField: 'date',
    valueField: 'amount',
    interval: 'month',
  });

  const salesWithGrowth = calculateGrowthRates(
    salesByPeriod.map((item) => ({ date: item.date, value: item.value }))
  );

  // E-Commerce: Total Sales Over Time (for line chart)
  const totalSalesOverTime = processTimeSeries(mockData.sales, {
    dateField: 'date',
    valueField: 'amount',
    interval: 'day',
  }).map((item) => ({
    date: item.date,
    sales: item.value,
    revenue: item.value,
  }));

  // E-Commerce: Orders Over Time (for bar/line chart)
  const ordersByDay = processTimeSeries(mockData.sales, {
    dateField: 'date',
    valueField: 'orders',
    interval: 'day',
  });
  const ordersOverTime = ordersByDay.map((item) => ({
    date: item.date,
    orders: item.value,
    value: item.value,
  }));

  // E-Commerce: Revenue by Payment Method (for pie chart)
  const salesByPaymentMethod = aggregateData(mockData.sales, {
    groupBy: 'paymentMethod',
    aggregations: {
      amount: 'sum',
      orders: 'sum',
    },
  });
  const totalRevenue = salesByPaymentMethod.reduce((sum, item) => sum + item.amount, 0);
  const revenueByPaymentMethod = salesByPaymentMethod.map((item) => ({
    method: item.paymentMethod,
    revenue: item.amount,
    orders: item.orders,
    percentage: (item.amount / totalRevenue) * 100,
  }));

  const salesByRegion = aggregateData(mockData.sales, {
    groupBy: 'region',
    aggregations: {
      amount: 'sum',
      orders: 'sum',
    },
  });

  const totalSales = salesByRegion.reduce((sum, item) => sum + item.amount, 0);
  const salesByRegionWithPercentage = salesByRegion.map((item) => ({
    region: item.region,
    sales: item.amount,
    orders: item.orders,
    percentage: (item.amount / totalSales) * 100,
    growth: Math.random() * 20 - 5,
  }));

  const salesByProduct = aggregateData(mockData.sales, {
    groupBy: 'product',
    aggregations: {
      amount: 'sum',
      units: 'sum',
    },
  });

  const salesByRep = aggregateData(mockData.sales, {
    groupBy: 'salesRep',
    aggregations: {
      amount: 'sum',
      orders: 'sum',
    },
  });

  const totalOrders = salesByRegion.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const dailyTrends = processTimeSeries(mockData.sales, {
    dateField: 'date',
    valueField: 'amount',
    interval: 'day',
  });

  const weeklyTrends = processTimeSeries(mockData.sales, {
    dateField: 'date',
    valueField: 'amount',
    interval: 'week',
  });

  return {
    overview: {
      totalSales,
      totalOrders,
      averageOrderValue: avgOrderValue,
      conversionRate: 3.4,
      salesGrowth: salesWithGrowth[salesWithGrowth.length - 1]?.growthRate || 0,
      orderGrowth: 12.5,
    },
    // E-Commerce Charts Data
    totalSalesOverTime,
    ordersOverTime,
    revenueByPaymentMethod,
    byTimePeriod: salesWithGrowth.map((item) => ({
      period: item.date,
      sales: item.value,
      orders: Math.floor(item.value / avgOrderValue),
      growth: item.growthRate,
    })),
    byRegion: salesByRegionWithPercentage,
    byProduct: salesByProduct.map((item) => ({
      product: item.product,
      sales: item.amount,
      units: item.units,
      margin: 25 + Math.random() * 15,
    })),
    bySalesRep: salesByRep.map((item) => {
      const quota = item.amount * 1.2;
      return {
        rep: item.salesRep,
        sales: item.amount,
        orders: item.orders,
        quota,
        performance: (item.amount / quota) * 100,
      };
    }),
    salesFunnel: {
      leads: 10000,
      qualified: 3500,
      proposals: 1200,
      closed: 450,
      conversionRates: {
        leadToQualified: 35,
        qualifiedToProposal: 34.3,
        proposalToClosed: 37.5,
      },
    },
    trends: {
      daily: dailyTrends.map((item) => ({
        date: item.date,
        sales: item.value,
        orders: Math.floor(item.value / avgOrderValue),
      })),
      weekly: weeklyTrends.map((item) => ({
        week: item.date,
        sales: item.value,
        orders: Math.floor(item.value / avgOrderValue),
      })),
      monthly: salesWithGrowth.map((item) => ({
        month: item.date,
        sales: item.value,
        orders: Math.floor(item.value / avgOrderValue),
      })),
    },
  };
}

function generateMockSalesData() {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const salesReps = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'UPI', 'Cash on Delivery', 'Bank Transfer'];
  
  const sales = [];

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - i));
    
    sales.push({
      date: date.toISOString(),
      region: regions[Math.floor(Math.random() * regions.length)],
      product: products[Math.floor(Math.random() * products.length)],
      salesRep: salesReps[Math.floor(Math.random() * salesReps.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      amount: Math.random() * 10000 + 5000,
      orders: Math.floor(Math.random() * 20) + 5,
      units: Math.floor(Math.random() * 50) + 10,
    });
  }

  return { sales };
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
      () => fetchSalesData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Sales API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch sales data',
      500
    );
  }
}

