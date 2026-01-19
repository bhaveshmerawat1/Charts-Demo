/**
 * Product Analytics API Endpoint
 * Product performance, inventory, and lifecycle metrics
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, getCachedOrFetch, getCacheKey, validateDateRange, parseQueryParams } from '@/lib/api-helpers';
import { aggregateData, processTimeSeries, calculateGrowthRates } from '@/lib/computation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface ProductData {
  overview: {
    totalProducts: number;
    activeProducts: number;
    totalRevenue: number;
    totalUnitsSold: number;
    averagePrice: number;
  };
  // E-Commerce: Product & Inventory Charts
  topSellingProducts: Array<{
    product: string;
    revenue: number;
    units: number;
    margin: number;
  }>;
  categoryWiseSales: Array<{
    category: string;
    revenue: number;
    units: number;
    percentage: number;
  }>;
  inventoryStockStatus: Array<{
    product: string;
    stockLevel: number;
    stockPercentage: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    minThreshold: number;
    maxCapacity: number;
  }>;
  performance: {
    topProducts: Array<{ product: string; revenue: number; units: number; margin: number }>;
    worstProducts: Array<{ product: string; revenue: number; units: number; margin: number }>;
    byCategory: Array<{ category: string; revenue: number; units: number; growth: number }>;
  };
  inventory: {
    totalValue: number;
    turnover: number;
    stockoutRate: number;
    byProduct: Array<{ product: string; quantity: number; value: number; daysOfStock: number }>;
    byCategory: Array<{ category: string; quantity: number; value: number }>;
  };
  lifecycle: {
    newProducts: number;
    matureProducts: number;
    decliningProducts: number;
    byStage: Array<{ stage: string; count: number; revenue: number }>;
  };
  trends: {
    sales: Array<{ period: string; revenue: number; units: number; growth: number }>;
    inventory: Array<{ period: string; value: number; turnover: number }>;
  };
}

async function fetchProductData(startDate?: Date, endDate?: Date): Promise<ProductData> {
  const mockData = generateMockProductData();
  
  const salesByProduct = aggregateData(mockData.sales, {
    groupBy: 'product',
    aggregations: {
      revenue: 'sum',
      units: 'sum',
    },
  });

  const salesByCategory = aggregateData(mockData.sales, {
    groupBy: 'category',
    aggregations: {
      revenue: 'sum',
      units: 'sum',
    },
  });

  const salesTrends = processTimeSeries(mockData.sales, {
    dateField: 'date',
    valueField: 'revenue',
    interval: 'month',
  });

  const salesWithGrowth = calculateGrowthRates(
    salesTrends.map((item) => ({ date: item.date, value: item.value }))
  );

  const topProducts = [...salesByProduct]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((item) => ({
      product: item.product,
      revenue: item.revenue,
      units: item.units,
      margin: 20 + Math.random() * 15,
    }));

  const worstProducts = [...salesByProduct]
    .sort((a, b) => a.revenue - b.revenue)
    .slice(0, 10)
    .map((item) => ({
      product: item.product,
      revenue: item.revenue,
      units: item.units,
      margin: 10 + Math.random() * 10,
    }));

  const totalRevenue = salesByProduct.reduce((sum, item) => sum + item.revenue, 0);
  const totalUnits = salesByProduct.reduce((sum, item) => sum + item.units, 0);

  // E-Commerce: Top Selling Products (horizontal bar chart)
  const topSellingProducts = [...salesByProduct]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((item) => ({
      product: item.product,
      revenue: item.revenue,
      units: item.units,
      margin: 20 + Math.random() * 15,
    }));

  // E-Commerce: Category-wise Sales (bar/stacked bar chart)
  const categoryWiseSales = salesByCategory.map((item) => ({
    category: item.category,
    revenue: item.revenue,
    units: item.units,
    percentage: (item.revenue / totalRevenue) * 100,
  }));

  const inventoryByProduct = aggregateData(mockData.inventory, {
    groupBy: 'product',
    aggregations: {
      quantity: 'sum',
      value: 'sum',
    },
  });

  const inventoryByCategory = aggregateData(mockData.inventory, {
    groupBy: 'category',
    aggregations: {
      quantity: 'sum',
      value: 'sum',
    },
  });

  const totalInventoryValue = inventoryByProduct.reduce((sum, item) => sum + item.value, 0);

  // E-Commerce: Inventory Stock Status (gauge chart)
  const inventoryStockStatus = inventoryByProduct.map((item) => {
    const maxCapacity = item.quantity * 2; // Assuming max capacity is 2x current
    const minThreshold = maxCapacity * 0.2; // 20% threshold
    const stockPercentage = (item.quantity / maxCapacity) * 100;
    let status: 'in_stock' | 'low_stock' | 'out_of_stock';
    
    if (item.quantity === 0) {
      status = 'out_of_stock';
    } else if (item.quantity < minThreshold) {
      status = 'low_stock';
    } else {
      status = 'in_stock';
    }

    return {
      product: item.product,
      stockLevel: item.quantity,
      stockPercentage,
      status,
      minThreshold,
      maxCapacity,
    };
  });

  return {
    overview: {
      totalProducts: salesByProduct.length,
      activeProducts: salesByProduct.filter((p) => p.revenue > 0).length,
      totalRevenue,
      totalUnitsSold: totalUnits,
      averagePrice: totalUnits > 0 ? totalRevenue / totalUnits : 0,
    },
    // E-Commerce Charts Data
    topSellingProducts,
    categoryWiseSales,
    inventoryStockStatus,
    performance: {
      topProducts,
      worstProducts,
      byCategory: salesByCategory.map((item) => ({
        category: item.category,
        revenue: item.revenue,
        units: item.units,
        growth: Math.random() * 20 - 5,
      })),
    },
    inventory: {
      totalValue: totalInventoryValue,
      turnover: 8.5,
      stockoutRate: 2.3,
      byProduct: inventoryByProduct.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        value: item.value,
        daysOfStock: Math.floor(item.quantity / 10), // Assuming 10 units per day
      })),
      byCategory: inventoryByCategory,
    },
    lifecycle: {
      newProducts: 25,
      matureProducts: 150,
      decliningProducts: 15,
      byStage: [
        { stage: 'Introduction', count: 25, revenue: totalRevenue * 0.05 },
        { stage: 'Growth', count: 80, revenue: totalRevenue * 0.35 },
        { stage: 'Maturity', count: 70, revenue: totalRevenue * 0.50 },
        { stage: 'Decline', count: 15, revenue: totalRevenue * 0.10 },
      ],
    },
    trends: {
      sales: salesWithGrowth.map((item) => ({
        period: item.date,
        revenue: item.value,
        units: Math.floor(item.value / 50), // Assuming $50 average price
        growth: item.growthRate,
      })),
      inventory: salesTrends.map((item) => ({
        period: item.date,
        value: totalInventoryValue + (Math.random() * 10000 - 5000),
        turnover: 8 + Math.random() * 2,
      })),
    },
  };
}

function generateMockProductData() {
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F'];
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports'];
  
  const sales = [];
  const inventory = [];

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - i));
    
    sales.push({
      date: date.toISOString(),
      product: products[Math.floor(Math.random() * products.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      revenue: Math.random() * 5000 + 1000,
      units: Math.floor(Math.random() * 50) + 5,
    });
  }

  for (const product of products) {
    inventory.push({
      product,
      category: categories[Math.floor(Math.random() * categories.length)],
      quantity: Math.floor(Math.random() * 500) + 100,
      value: Math.random() * 10000 + 5000,
    });
  }

  return { sales, inventory };
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
      () => fetchProductData(dateValidation.start, dateValidation.end),
      5 * 60 * 1000
    );

    return createSuccessResponse(data);
  } catch (error) {
    console.error('Product API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch product data',
      500
    );
  }
}

