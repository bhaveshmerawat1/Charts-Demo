/**
 * Financial Metrics API Endpoint
 * Provides comprehensive financial data for enterprise reporting
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries, calculateGrowthRates, calculateMovingAverage } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface FinancialData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    ebitda: number;
    cashFlow: number;
    workingCapital: number;
    debtToEquity: number;
  };
  // E-Commerce: Profit & Discounts Charts
  revenueVsProfit: Array<{
    period: string;
    revenue: number;
    profit: number;
    profitMargin: number;
  }>;
  discountImpact: Array<{
    period: string;
    discountAmount: number;
    revenueWithDiscount: number;
    revenueWithoutDiscount: number;
    impact: number;
  }>;
  revenue: {
    total: number;
    growth: number;
    byPeriod: Array<{ period: string; revenue: number; growth: number }>;
    bySegment: Array<{ segment: string; revenue: number; percentage: number }>;
  };
  expenses: {
    total: number;
    byCategory: Array<{ category: string; amount: number; percentage: number }>;
    trends: Array<{ period: string; amount: number }>;
  };
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    trends: Array<{ period: string; margin: number }>;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    free: number;
    trends: Array<{ period: string; operating: number; investing: number; financing: number }>;
  };
  balanceSheet: {
    assets: number;
    liabilities: number;
    equity: number;
    currentRatio: number;
    quickRatio: number;
  };
}

async function fetchFinancialData(startDate?: Date, endDate?: Date): Promise<FinancialData> {
  // In production, fetch from financial API
  // const response = await apiClient.get('/financial', { startDate, endDate });
  
  const mockData = generateMockFinancialData();
  
  // Process with computation engine
  const revenueByPeriod = processTimeSeries(mockData.revenue, {
    dateField: 'date',
    valueField: 'amount',
    interval: 'month',
  });

  const revenueWithGrowth = calculateGrowthRates(
    revenueByPeriod.map((item) => ({ date: item.date, value: item.value }))
  );

  const expensesByCategory = aggregateData(mockData.expenses, {
    groupBy: 'category',
    aggregations: {
      amount: 'sum',
    },
  });

  const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.amount, 0);
  const expensesWithPercentage = expensesByCategory.map((item) => ({
    ...item,
    percentage: (item.amount / totalExpenses) * 100,
  }));

  const revenueBySegment = aggregateData(mockData.revenue, {
    groupBy: 'segment',
    aggregations: {
      amount: 'sum',
    },
  });

  const totalRevenue = revenueBySegment.reduce((sum, item) => sum + item.amount, 0);
  const revenueBySegmentWithPercentage = revenueBySegment.map((item) => ({
    segment: item.segment,
    revenue: item.amount,
    percentage: (item.amount / totalRevenue) * 100,
  }));

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Process expenses by period
  const expensesByPeriod = processTimeSeries(mockData.expenses, {
    dateField: 'date',
    valueField: 'amount',
    interval: 'month',
  });

  // E-Commerce: Revenue vs Profit (multi-line chart)
  const revenueVsProfit = revenueWithGrowth.map((item, index) => {
    const periodExpenses = expensesByPeriod[index]?.value || 0;
    const periodProfit = item.value - periodExpenses;
    const periodProfitMargin = item.value > 0 ? (periodProfit / item.value) * 100 : 0;
    
    return {
      period: item.date,
      revenue: item.value,
      profit: periodProfit,
      profitMargin: periodProfitMargin,
    };
  });

  // E-Commerce: Discount Impact (bar chart)
  const discountData = processTimeSeries(mockData.revenue, {
    dateField: 'date',
    valueField: 'discountAmount',
    interval: 'month',
  });
  const discountImpact = discountData.map((item, index) => {
    const revenueWithDiscount = revenueWithGrowth[index]?.value || 0;
    const discountAmount = item.sum;
    const revenueWithoutDiscount = revenueWithDiscount + discountAmount;
    const impact = discountAmount > 0 ? ((revenueWithDiscount - revenueWithoutDiscount) / revenueWithoutDiscount) * 100 : 0;
    
    return {
      period: item.date,
      discountAmount,
      revenueWithDiscount,
      revenueWithoutDiscount,
      impact: Math.abs(impact),
    };
  });

  return {
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      ebitda: netProfit * 1.2, // Simulated
      cashFlow: netProfit * 0.8,
      workingCapital: totalRevenue * 0.15,
      debtToEquity: 0.45,
    },
    // E-Commerce Charts Data
    revenueVsProfit,
    discountImpact,
    revenue: {
      total: totalRevenue,
      growth: revenueWithGrowth[revenueWithGrowth.length - 1]?.growthRate || 0,
      byPeriod: revenueWithGrowth.map((item) => ({
        period: item.date,
        revenue: item.value,
        growth: item.growthRate,
      })),
      bySegment: revenueBySegmentWithPercentage,
    },
    expenses: {
      total: totalExpenses,
      byCategory: expensesWithPercentage,
      trends: processTimeSeries(mockData.expenses, {
        dateField: 'date',
        valueField: 'amount',
        interval: 'month',
      }).map((item) => ({
        period: item.date,
        amount: item.value,
      })),
    },
    profitability: {
      grossMargin: 45.2,
      operatingMargin: 28.5,
      netMargin: profitMargin,
      trends: revenueWithGrowth.map((item, index) => ({
        period: item.date,
        margin: profitMargin + (Math.random() * 5 - 2.5),
      })),
    },
    cashFlow: {
      operating: netProfit * 0.8,
      investing: -totalRevenue * 0.1,
      financing: totalRevenue * 0.05,
      free: netProfit * 0.7,
      trends: revenueWithGrowth.map((item) => ({
        period: item.date,
        operating: item.value * 0.8,
        investing: -item.value * 0.1,
        financing: item.value * 0.05,
      })),
    },
    balanceSheet: {
      assets: totalRevenue * 2.5,
      liabilities: totalRevenue * 1.2,
      equity: totalRevenue * 1.3,
      currentRatio: 1.8,
      quickRatio: 1.2,
    },
  };
}

function generateMockFinancialData() {
  const segments = ['Product Sales', 'Services', 'Licensing', 'Subscriptions'];
  const categories = ['Salaries', 'Marketing', 'Operations', 'R&D', 'Administration'];
  
  const revenue = [];
  const expenses = [];

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - i));
    
    const revenueAmount = Math.random() * 50000 + 20000;
    revenue.push({
      date: date.toISOString(),
      segment: segments[Math.floor(Math.random() * segments.length)],
      amount: revenueAmount,
      discountAmount: Math.random() * revenueAmount * 0.15, // 0-15% discount
    });

    expenses.push({
      date: date.toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      amount: Math.random() * 30000 + 10000,
    });
  }

  return { revenue, expenses };
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
      () => fetchFinancialData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Financial API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch financial data',
      500
    );
  }
}

