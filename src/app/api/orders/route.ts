/**
 * Orders Analytics API Endpoint
 * E-Commerce order data, status distribution, and conversion funnel
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries, calculateGrowthRates } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface OrdersData {
  overview: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    totalRevenue: number;
  };
  // E-Commerce: Order & Funnel Charts
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
    dropoffRate: number;
  }>;
  ordersByTime: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  ordersByProduct: Array<{
    product: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>;
}

async function fetchOrdersData(startDate?: Date, endDate?: Date): Promise<OrdersData> {
  const mockData = generateMockOrdersData();
  
  // E-Commerce: Order Status Distribution (pie chart)
  const ordersByStatus = aggregateData(mockData.orders, {
    groupBy: 'status',
    aggregations: {
      revenue: 'sum',
      quantity: 'sum', // Using quantity as a proxy for count
    },
  });
  // Count orders by status manually
  const statusCounts = new Map<string, number>();
  mockData.orders.forEach((order) => {
    statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1);
  });
  const totalOrders = mockData.orders.length;
  const totalRevenue = ordersByStatus.reduce((sum, item) => sum + item.revenue, 0);
  const orderStatusDistribution = ordersByStatus.map((item) => {
    const count = statusCounts.get(item.status) || 0;
    return {
      status: item.status,
      count,
      percentage: (count / totalOrders) * 100,
      revenue: item.revenue,
    };
  });

  // E-Commerce: Conversion Funnel (funnel chart)
  const funnelStages = [
    { stage: 'Visitors', count: 100000 },
    { stage: 'Add to Cart', count: 25000 },
    { stage: 'Checkout Started', count: 12000 },
    { stage: 'Payment Initiated', count: 8000 },
    { stage: 'Order Completed', count: 5000 },
  ];
  
  const conversionFunnel = funnelStages.map((stage, index) => {
    const previousCount = index > 0 ? funnelStages[index - 1].count : stage.count;
    const dropoffRate = index > 0 
      ? ((previousCount - stage.count) / previousCount) * 100 
      : 0;
    const percentage = (stage.count / funnelStages[0].count) * 100;
    
    return {
      stage: stage.stage,
      count: stage.count,
      percentage,
      dropoffRate,
    };
  });

  // Orders over time
  const ordersByTime = processTimeSeries(mockData.orders, {
    dateField: 'date',
    valueField: 'revenue',
    interval: 'day',
  }).map((item) => ({
    date: item.date,
    orders: item.count,
    revenue: item.sum,
  }));

  // Orders by product
  const ordersByProduct = aggregateData(mockData.orders, {
    groupBy: 'product',
    aggregations: {
      revenue: 'sum',
    },
  });
  // Count orders by product manually
  const productCounts = new Map<string, number>();
  mockData.orders.forEach((order) => {
    productCounts.set(order.product, (productCounts.get(order.product) || 0) + 1);
  });
  const ordersByProductWithPercentage = ordersByProduct
    .map((item) => {
      const count = productCounts.get(item.product) || 0;
      return { ...item, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      product: item.product,
      orders: item.count,
      revenue: item.revenue,
      percentage: (item.count / totalOrders) * 100,
    }));

  const completedOrders = statusCounts.get('Completed') || 0;
  const pendingOrders = statusCounts.get('Pending') || 0;
  const cancelledOrders = statusCounts.get('Cancelled') || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    overview: {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      averageOrderValue: avgOrderValue,
      totalRevenue,
    },
    orderStatusDistribution,
    conversionFunnel,
    ordersByTime,
    ordersByProduct: ordersByProductWithPercentage,
  };
}

function generateMockOrdersData() {
  const statuses = ['Completed', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
  const products = [
    'Laptop Pro 15', 'Wireless Headphones', 'Smart Watch', 'Tablet Air', 
    'Phone Case', 'USB-C Cable', 'Power Bank', 'Keyboard', 'Mouse', 'Monitor'
  ];
  
  const orders = [];

  for (let i = 0; i < 1000; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    
    orders.push({
      date: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      product: products[Math.floor(Math.random() * products.length)],
      revenue: Math.random() * 500 + 50,
      quantity: Math.floor(Math.random() * 3) + 1,
    });
  }

  return { orders };
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
      () => fetchOrdersData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Orders API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch orders data',
      500
    );
  }
}

