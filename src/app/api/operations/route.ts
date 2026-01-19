/**
 * Operational Metrics API Endpoint
 * Operations, efficiency, and productivity metrics
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries, calculateGrowthRates } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface OperationsData {
  efficiency: {
    overallEfficiency: number;
    productionEfficiency: number;
    processEfficiency: number;
    resourceUtilization: number;
  };
  // E-Commerce: Delivery & Operations Charts
  deliveryTimeAnalysis: Array<{
    period: string;
    averageDays: number;
    minDays: number;
    maxDays: number;
    medianDays: number;
    p25Days: number;
    p75Days: number;
  }>;
  returnsAndRefundRate: Array<{
    period: string;
    returns: number;
    refunds: number;
    returnRate: number;
    refundRate: number;
    totalOrders: number;
  }>;
  productivity: {
    outputPerEmployee: number;
    outputPerHour: number;
    productivityGrowth: number;
    byDepartment: Array<{ department: string; productivity: number; output: number }>;
  };
  quality: {
    defectRate: number;
    firstPassYield: number;
    customerComplaints: number;
    qualityScore: number;
    trends: Array<{ period: string; defectRate: number; qualityScore: number }>;
  };
  capacity: {
    utilization: number;
    available: number;
    used: number;
    byResource: Array<{ resource: string; utilization: number; capacity: number }>;
  };
  downtime: {
    total: number;
    planned: number;
    unplanned: number;
    mttr: number; // Mean Time To Repair
    mtbf: number; // Mean Time Between Failures
    byReason: Array<{ reason: string; hours: number; percentage: number }>;
  };
  costs: {
    operationalCosts: number;
    costPerUnit: number;
    costTrends: Array<{ period: string; cost: number; costPerUnit: number }>;
  };
}

async function fetchOperationsData(startDate?: Date, endDate?: Date): Promise<OperationsData> {
  const mockData = generateMockOperationsData();
  
  const productivityByDepartment = aggregateData(mockData.productivity, {
    groupBy: 'department',
    aggregations: {
      output: 'sum',
      hours: 'sum',
    },
  });

  const downtimeByReason = aggregateData(mockData.downtime, {
    groupBy: 'reason',
    aggregations: {
      hours: 'sum',
    },
  });

  const totalDowntime = downtimeByReason.reduce((sum, item) => sum + item.hours, 0);
  const downtimeByReasonWithPercentage = downtimeByReason.map((item) => ({
    reason: item.reason,
    hours: item.hours,
    percentage: (item.hours / totalDowntime) * 100,
  }));

  const costTrends = processTimeSeries(mockData.costs, {
    dateField: 'date',
    valueField: 'cost',
    interval: 'month',
  });

  const qualityTrends = processTimeSeries(mockData.quality, {
    dateField: 'date',
    valueField: 'defectRate',
    interval: 'month',
  });

  const totalOutput = productivityByDepartment.reduce((sum, item) => sum + item.output, 0);
  const totalHours = productivityByDepartment.reduce((sum, item) => sum + item.hours, 0);

  // E-Commerce: Delivery Time Analysis (bar/boxplot chart)
  const deliveryByPeriod = processTimeSeries(mockData.deliveries, {
    dateField: 'date',
    valueField: 'deliveryDays',
    interval: 'month',
  });
  
  // Calculate boxplot statistics for each period
  const deliveryTimeAnalysis = deliveryByPeriod.map((item) => {
    // Simulate boxplot data (min, Q1, median, Q3, max)
    const baseDays = item.value;
    return {
      period: item.date,
      averageDays: baseDays,
      minDays: Math.max(1, baseDays - 2),
      maxDays: baseDays + 3,
      medianDays: baseDays,
      p25Days: Math.max(1, baseDays - 1),
      p75Days: baseDays + 1.5,
    };
  });

  // E-Commerce: Returns & Refund Rate (line/bar chart)
  const returnsByPeriod = processTimeSeries(
    mockData.returns.map((r) => ({ ...r, count: 1 })),
    {
      dateField: 'date',
      valueField: 'count',
      interval: 'month',
    }
  );
  const refundsByPeriod = processTimeSeries(
    mockData.returns.filter((r) => r.isRefunded).map((r) => ({ ...r, count: 1 })),
    {
      dateField: 'date',
      valueField: 'count',
      interval: 'month',
    }
  );
  const ordersByPeriod = processTimeSeries(
    mockData.deliveries.map((d) => ({ ...d, count: 1 })),
    {
      dateField: 'date',
      valueField: 'count',
      interval: 'month',
    }
  );

  const returnsAndRefundRate = returnsByPeriod.map((ret, index) => {
    const refunds = refundsByPeriod[index]?.value || 0;
    const orders = ordersByPeriod[index]?.value || 1;
    const returns = ret.value;
    
    return {
      period: ret.date,
      returns,
      refunds,
      returnRate: (returns / orders) * 100,
      refundRate: returns > 0 ? (refunds / returns) * 100 : 0,
      totalOrders: orders,
    };
  });

  return {
    efficiency: {
      overallEfficiency: 87.5,
      productionEfficiency: 89.2,
      processEfficiency: 85.8,
      resourceUtilization: 82.3,
    },
    // E-Commerce Charts Data
    deliveryTimeAnalysis,
    returnsAndRefundRate,
    productivity: {
      outputPerEmployee: totalOutput / 100, // Assuming 100 employees
      outputPerHour: totalHours > 0 ? totalOutput / totalHours : 0,
      productivityGrowth: 5.2,
      byDepartment: productivityByDepartment.map((item) => ({
        department: item.department,
        productivity: item.hours > 0 ? item.output / item.hours : 0,
        output: item.output,
      })),
    },
    quality: {
      defectRate: 1.2,
      firstPassYield: 98.8,
      customerComplaints: 45,
      qualityScore: 94.5,
      trends: qualityTrends.map((item) => ({
        period: item.date,
        defectRate: item.value,
        qualityScore: 100 - item.value * 5,
      })),
    },
    capacity: {
      utilization: 82.5,
      available: 1000,
      used: 825,
      byResource: [
        { resource: 'Manufacturing', utilization: 85, capacity: 500 },
        { resource: 'Warehouse', utilization: 80, capacity: 300 },
        { resource: 'Logistics', utilization: 82, capacity: 200 },
      ],
    },
    downtime: {
      total: totalDowntime,
      planned: totalDowntime * 0.3,
      unplanned: totalDowntime * 0.7,
      mttr: 2.5, // hours
      mtbf: 120, // hours
      byReason: downtimeByReasonWithPercentage,
    },
    costs: {
      operationalCosts: costTrends.reduce((sum, item) => sum + item.value, 0),
      costPerUnit: 12.5,
      costTrends: costTrends.map((item) => ({
        period: item.date,
        cost: item.value,
        costPerUnit: item.value / 1000, // Assuming 1000 units per period
      })),
    },
  };
}

function generateMockOperationsData() {
  const departments = ['Manufacturing', 'Quality', 'Logistics', 'Warehouse', 'Maintenance'];
  const reasons = ['Equipment Failure', 'Maintenance', 'Material Shortage', 'Quality Issue', 'Other'];
  
  const productivity = [];
  const downtime = [];
  const costs = [];
  const quality = [];
  const deliveries = [];
  const returns = [];

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - i));
    
    productivity.push({
      date: date.toISOString(),
      department: departments[Math.floor(Math.random() * departments.length)],
      output: Math.random() * 1000 + 500,
      hours: Math.random() * 100 + 50,
    });

    if (Math.random() < 0.1) { // 10% chance of downtime
      downtime.push({
        date: date.toISOString(),
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        hours: Math.random() * 8 + 1,
      });
    }

    costs.push({
      date: date.toISOString(),
      cost: Math.random() * 50000 + 20000,
    });

    quality.push({
      date: date.toISOString(),
      defectRate: Math.random() * 2 + 0.5,
    });

    // E-Commerce: Delivery time data (for boxplot/bar chart)
    const deliveryDays = Math.random() * 7 + 1; // 1-8 days
    deliveries.push({
      date: date.toISOString(),
      deliveryDays,
      orderId: `ORD-${i + 1000}`,
    });

    // E-Commerce: Returns and refunds data
    if (Math.random() < 0.05) { // 5% return rate
      returns.push({
        date: date.toISOString(),
        isRefunded: Math.random() > 0.3, // 70% refunded
        orderId: `ORD-${i + 1000}`,
      });
    }
  }

  return { productivity, downtime, costs, quality, deliveries, returns };
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
      () => fetchOperationsData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Operations API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch operations data',
      500
    );
  }
}

