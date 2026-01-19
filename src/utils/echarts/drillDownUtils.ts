import type { DrillDownData } from "@/components/Charts/echarts/Chart";

export interface DashboardData {
  salesByCategory: Array<{
    category: string;
    revenue: number;
    orders: number;
    growth: number;
    products?: Array<{
      name: string;
      revenue: number;
      orders: number;
      margin?: number;
    }>;
  }>;
}

/**
 * Default category colors for charts
 */
export const CATEGORY_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
];

/**
 * Create a color mapping for categories
 */
export function createCategoryColorMap(salesByCategory: DashboardData['salesByCategory']): Record<string, string> {
  const categoryColorMap: Record<string, string> = {};
  salesByCategory.forEach((category, index) => {
    categoryColorMap[category.category] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  });
  return categoryColorMap;
}

/**
 * Prepare drill-down data structure for category charts
 * Note: This creates mock product data if products are not available in the API response
 */
export function prepareDrillDownData(dashboardData: DashboardData): Record<string, DrillDownData> {
  const categoryColorMap = createCategoryColorMap(dashboardData.salesByCategory);
  const drillDownData: Record<string, DrillDownData> = {};

  dashboardData.salesByCategory.forEach((category) => {
    const categoryColor = categoryColorMap[category.category];
    
    // Use products from API if available, otherwise generate mock products
    let products = category.products;
    if (!products || products.length === 0) {
      // Generate mock products for drill-down
      products = [
        { name: `${category.category} - Product A`, revenue: category.revenue * 0.4, orders: category.orders * 0.4, margin: 20 },
        { name: `${category.category} - Product B`, revenue: category.revenue * 0.3, orders: category.orders * 0.3, margin: 25 },
        { name: `${category.category} - Product C`, revenue: category.revenue * 0.2, orders: category.orders * 0.2, margin: 22 },
        { name: `${category.category} - Product D`, revenue: category.revenue * 0.1, orders: category.orders * 0.1, margin: 18 },
      ];
    }
    
    // Add color property to each product to match parent category color
    const productsWithColor = products.map((product) => ({
      ...product,
      color: categoryColor,
    }));

    drillDownData[category.category] = {
      name: category.category,
      data: productsWithColor,
      xKey: "name",
      series: [{ type: "bar", dataKey: "revenue", name: "Revenue" }],
    };
  });

  return drillDownData;
}

