/**
 * Marketing Analytics API Endpoint
 * Marketing performance, campaigns, and ROI metrics
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries, calculateGrowthRates } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface MarketingData {
  overview: {
    totalSpend: number;
    totalRevenue: number;
    roi: number;
    cac: number; // Customer Acquisition Cost
    ltvCacRatio: number;
    conversionRate: number;
  };
  channels: {
    byChannel: Array<{ channel: string; spend: number; revenue: number; roi: number; conversions: number }>;
    performance: Array<{ channel: string; impressions: number; clicks: number; ctr: number; cpc: number }>;
  };
  campaigns: {
    active: number;
    total: number;
    topPerforming: Array<{ campaign: string; spend: number; revenue: number; roi: number }>;
    byStatus: Array<{ status: string; count: number; spend: number }>;
  };
  funnel: {
    awareness: number;
    interest: number;
    consideration: number;
    purchase: number;
    conversionRates: {
      awarenessToInterest: number;
      interestToConsideration: number;
      considerationToPurchase: number;
    };
  };
  trends: {
    spend: Array<{ period: string; spend: number; revenue: number; roi: number }>;
    conversions: Array<{ period: string; conversions: number; growth: number }>;
  };
}

async function fetchMarketingData(startDate?: Date, endDate?: Date): Promise<MarketingData> {
  const mockData = generateMockMarketingData();
  
  const spendByChannel = aggregateData(mockData.campaigns, {
    groupBy: 'channel',
    aggregations: {
      spend: 'sum',
      revenue: 'sum',
      conversions: 'sum',
    },
  });

  const channelsWithROI = spendByChannel.map((item) => ({
    channel: item.channel,
    spend: item.spend,
    revenue: item.revenue,
    roi: item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : 0,
    conversions: item.conversions,
  }));

  const spendTrends = processTimeSeries(mockData.campaigns, {
    dateField: 'date',
    valueField: 'spend',
    interval: 'month',
  });

  const revenueTrends = processTimeSeries(mockData.campaigns, {
    dateField: 'date',
    valueField: 'revenue',
    interval: 'month',
  });

  const conversionTrends = processTimeSeries(mockData.campaigns, {
    dateField: 'date',
    valueField: 'conversions',
    interval: 'month',
  });

  const conversionWithGrowth = calculateGrowthRates(
    conversionTrends.map((item) => ({ date: item.date, value: item.value }))
  );

  const totalSpend = spendByChannel.reduce((sum, item) => sum + item.spend, 0);
  const totalRevenue = spendByChannel.reduce((sum, item) => sum + item.revenue, 0);
  const totalConversions = spendByChannel.reduce((sum, item) => sum + item.conversions, 0);

  const topCampaigns = [...mockData.campaigns]
    .sort((a, b) => (b.revenue - b.spend) - (a.revenue - a.spend))
    .slice(0, 10)
    .map((item) => ({
      campaign: item.campaign,
      spend: item.spend,
      revenue: item.revenue,
      roi: item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : 0,
    }));

  const campaignsByStatus = aggregateData(mockData.campaigns, {
    groupBy: 'status',
    aggregations: {
      spend: 'sum',
    },
  });

  return {
    overview: {
      totalSpend,
      totalRevenue,
      roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
      cac: totalConversions > 0 ? totalSpend / totalConversions : 0,
      ltvCacRatio: 3.5,
      conversionRate: (totalConversions / 100000) * 100, // Assuming 100k impressions
    },
    channels: {
      byChannel: channelsWithROI,
      performance: channelsWithROI.map((item) => ({
        channel: item.channel,
        impressions: Math.floor(item.spend * 100), // Simulated
        clicks: Math.floor(item.spend * 10),
        ctr: 2.5 + Math.random() * 2,
        cpc: item.spend / Math.floor(item.spend * 10),
      })),
    },
    campaigns: {
      active: mockData.campaigns.filter((c) => c.status === 'active').length,
      total: mockData.campaigns.length,
      topPerforming: topCampaigns,
      byStatus: campaignsByStatus.map((item) => ({
        status: item.status,
        count: mockData.campaigns.filter((c) => c.status === item.status).length,
        spend: item.spend,
      })),
    },
    funnel: {
      awareness: 100000,
      interest: 25000,
      consideration: 5000,
      purchase: 1000,
      conversionRates: {
        awarenessToInterest: 25,
        interestToConsideration: 20,
        considerationToPurchase: 20,
      },
    },
    trends: {
      spend: spendTrends.map((item, index) => ({
        period: item.date,
        spend: item.value,
        revenue: revenueTrends[index]?.value || 0,
        roi: item.value > 0
          ? ((revenueTrends[index]?.value || 0) - item.value) / item.value * 100
          : 0,
      })),
      conversions: conversionWithGrowth.map((item) => ({
        period: item.date,
        conversions: item.value,
        growth: item.growthRate,
      })),
    },
  };
}

function generateMockMarketingData() {
  const channels = ['Google Ads', 'Facebook', 'LinkedIn', 'Email', 'Organic'];
  const campaigns = ['Summer Sale', 'Product Launch', 'Brand Awareness', 'Retargeting'];
  const statuses = ['active', 'paused', 'completed'];
  
  const campaignsData = [];

  for (let i = 0; i < 180; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (180 - i));
    
    campaignsData.push({
      date: date.toISOString(),
      channel: channels[Math.floor(Math.random() * channels.length)],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      spend: Math.random() * 5000 + 1000,
      revenue: Math.random() * 15000 + 5000,
      conversions: Math.floor(Math.random() * 100) + 10,
    });
  }

  return { campaigns: campaignsData };
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
      () => fetchMarketingData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Marketing API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch marketing data',
      500
    );
  }
}



