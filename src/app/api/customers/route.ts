/**
 * Customer Analytics API Endpoint
 * Customer data, segmentation, and behavior analytics
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries, calculateGrowthRates } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface CustomerData {
  overview: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    churnedCustomers: number;
    customerGrowth: number;
    churnRate: number;
    retentionRate: number;
  };
  // E-Commerce: Customer Analytics Charts
  newVsReturningCustomers: {
    new: number;
    returning: number;
    newPercentage: number;
    returningPercentage: number;
  };
  customerGrowth: Array<{
    date: string;
    newCustomers: number;
    totalCustomers: number;
    growthRate: number;
  }>;
  ordersByLocation: Array<{
    location: string;
    country?: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>;
  segmentation: {
    byTier: Array<{ tier: string; count: number; revenue: number; percentage: number }>;
    byRegion: Array<{ region: string; count: number; percentage: number }>;
    byIndustry: Array<{ industry: string; count: number; percentage: number }>;
    byLifetimeValue: Array<{ range: string; count: number; totalValue: number }>;
  };
  behavior: {
    acquisition: Array<{ period: string; newCustomers: number; growth: number }>;
    retention: Array<{ period: string; retentionRate: number; churnRate: number }>;
    engagement: {
      averageSessions: number;
      averageSessionDuration: number;
      bounceRate: number;
      repeatPurchaseRate: number;
    };
  };
  lifetimeValue: {
    average: number;
    bySegment: Array<{ segment: string; ltv: number; count: number }>;
    trends: Array<{ period: string; ltv: number }>;
  };
  satisfaction: {
    nps: number;
    csat: number;
    ces: number;
    trends: Array<{ period: string; nps: number; csat: number }>;
  };
}

async function fetchCustomerData(startDate?: Date, endDate?: Date): Promise<CustomerData> {
  const mockData = generateMockCustomerData();
  
  const customersByTier = aggregateData(mockData.customers, {
    groupBy: 'tier',
    aggregations: {
      revenue: 'sum',
    },
  });

  const totalCustomers = mockData.customers.length;
  const customersByTierWithCount = customersByTier.map((item) => {
    const count = mockData.customers.filter((c) => c.tier === item.tier).length;
    return {
      tier: item.tier,
      count,
      revenue: item.revenue,
      percentage: (count / totalCustomers) * 100,
    };
  });

  const customersByRegion = aggregateData(mockData.customers, {
    groupBy: 'region',
    aggregations: {},
  });

  const customersByRegionWithCount = customersByRegion.map((item) => {
    const count = mockData.customers.filter((c) => c.region === item.region).length;
    return {
      region: item.region,
      count,
      percentage: (count / totalCustomers) * 100,
    };
  });

  const customersByIndustry = aggregateData(mockData.customers, {
    groupBy: 'industry',
    aggregations: {},
  });

  const customersByIndustryWithCount = customersByIndustry.map((item) => {
    const count = mockData.customers.filter((c) => c.industry === item.industry).length;
    return {
      industry: item.industry,
      count,
      percentage: (count / totalCustomers) * 100,
    };
  });

  const acquisitionTrends = processTimeSeries(mockData.acquisition, {
    dateField: 'date',
    valueField: 'newCustomers',
    interval: 'month',
  });

  const acquisitionWithGrowth = calculateGrowthRates(
    acquisitionTrends.map((item) => ({ date: item.date, value: item.value }))
  );

  const averageLTV = mockData.customers.reduce((sum, c) => sum + c.ltv, 0) / totalCustomers;

  const ltvBySegment = aggregateData(mockData.customers, {
    groupBy: 'tier',
    aggregations: {
      ltv: 'avg',
    },
  });

  const activeCustomers = mockData.customers.filter((c) => c.status === 'active').length;
  const newCustomers = mockData.acquisition.reduce((sum, item) => sum + item.newCustomers, 0);
  const churnedCustomers = mockData.customers.filter((c) => c.status === 'churned').length;

  // E-Commerce: New vs Returning Customers (pie chart)
  const newCustomersCount = mockData.customers.filter((c) => c.isNew).length;
  const returningCustomersCount = totalCustomers - newCustomersCount;
  const newVsReturningCustomers = {
    new: newCustomersCount,
    returning: returningCustomersCount,
    newPercentage: (newCustomersCount / totalCustomers) * 100,
    returningPercentage: (returningCustomersCount / totalCustomers) * 100,
  };

  // E-Commerce: Customer Growth (line chart)
  const customerGrowth = acquisitionWithGrowth.map((item, index) => {
    const cumulativeCustomers = acquisitionTrends.slice(0, index + 1).reduce((sum, t) => sum + t.value, 0);
    return {
      date: item.date,
      newCustomers: item.value,
      totalCustomers: cumulativeCustomers,
      growthRate: item.growthRate,
    };
  });

  // E-Commerce: Orders by Location (bar/map chart)
  const countryCounts = new Map<string, number>();
  const countryOrders = new Map<string, number>();
  const countryRevenue = new Map<string, number>();
  
  mockData.customers.forEach((customer) => {
    const count = countryCounts.get(customer.country) || 0;
    countryCounts.set(customer.country, count + 1);
    
    const orders = countryOrders.get(customer.country) || 0;
    countryOrders.set(customer.country, orders + customer.orders);
    
    const revenue = countryRevenue.get(customer.country) || 0;
    countryRevenue.set(customer.country, revenue + customer.revenue);
  });
  
  const totalOrdersCount = Array.from(countryOrders.values()).reduce((sum, val) => sum + val, 0);
  const ordersByLocation = Array.from(countryCounts.entries())
    .map(([country, count]) => ({
      country,
      count,
      orders: countryOrders.get(country) || 0,
      revenue: countryRevenue.get(country) || 0,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 20)
    .map((item) => ({
      location: item.country,
      country: item.country,
      orders: item.orders,
      revenue: item.revenue,
      percentage: (item.orders / totalOrdersCount) * 100,
    }));

  return {
    overview: {
      totalCustomers,
      activeCustomers,
      newCustomers,
      churnedCustomers,
      customerGrowth: acquisitionWithGrowth[acquisitionWithGrowth.length - 1]?.growthRate || 0,
      churnRate: (churnedCustomers / totalCustomers) * 100,
      retentionRate: 100 - (churnedCustomers / totalCustomers) * 100,
    },
    // E-Commerce Charts Data
    newVsReturningCustomers,
    customerGrowth,
    ordersByLocation,
    segmentation: {
      byTier: customersByTierWithCount,
      byRegion: customersByRegionWithCount,
      byIndustry: customersByIndustryWithCount,
      byLifetimeValue: [
        { range: '$0-$1K', count: 500, totalValue: 250000 },
        { range: '$1K-$5K', count: 300, totalValue: 900000 },
        { range: '$5K-$10K', count: 150, totalValue: 1125000 },
        { range: '$10K+', count: 50, totalValue: 750000 },
      ],
    },
    behavior: {
      acquisition: acquisitionWithGrowth.map((item) => ({
        period: item.date,
        newCustomers: item.value,
        growth: item.growthRate,
      })),
      retention: acquisitionTrends.map((item) => ({
        period: item.date,
        retentionRate: 85 + Math.random() * 10,
        churnRate: 2 + Math.random() * 3,
      })),
      engagement: {
        averageSessions: 4.2,
        averageSessionDuration: 8.5,
        bounceRate: 35.2,
        repeatPurchaseRate: 42.5,
      },
    },
    lifetimeValue: {
      average: averageLTV,
      bySegment: ltvBySegment.map((item) => ({
        segment: item.tier,
        ltv: item.ltv,
        count: mockData.customers.filter((c) => c.tier === item.tier).length,
      })),
      trends: acquisitionTrends.map((item) => ({
        period: item.date,
        ltv: averageLTV + (Math.random() * 500 - 250),
      })),
    },
    satisfaction: {
      nps: 52,
      csat: 4.3,
      ces: 4.1,
      trends: acquisitionTrends.map((item) => ({
        period: item.date,
        nps: 50 + Math.random() * 10,
        csat: 4.2 + Math.random() * 0.4,
      })),
    },
  };
}

function generateMockCustomerData() {
  const tiers = ['Enterprise', 'Professional', 'Standard', 'Basic'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];
  const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'India', 'Canada', 'Australia'];
  const cities = ['New York', 'London', 'Berlin', 'Paris', 'Tokyo', 'Mumbai', 'Toronto', 'Sydney'];
  
  const customers = [];
  for (let i = 0; i < 1000; i++) {
    const isNew = Math.random() > 0.6; // 40% are new customers
    customers.push({
      id: i + 1,
      tier: tiers[Math.floor(Math.random() * tiers.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      revenue: Math.random() * 50000 + 5000,
      ltv: Math.random() * 10000 + 1000,
      status: Math.random() > 0.1 ? 'active' : 'churned',
      isNew,
      orders: Math.floor(Math.random() * 10) + (isNew ? 1 : 2),
    });
  }

  const acquisition = [];
  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - i));
    acquisition.push({
      date: date.toISOString(),
      newCustomers: Math.floor(Math.random() * 20) + 5,
    });
  }

  return { customers, acquisition };
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
      () => fetchCustomerData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Customer API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch customer data',
      500
    );
  }
}

