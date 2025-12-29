import dashboardData from "@/utils/echarts/dashboardData.json";
import type { DrillDownData } from "@/components/Charts/echarts/Chart";

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
export function createCategoryColorMap(): Record<string, string> {
  const categoryColorMap: Record<string, string> = {};
  dashboardData.salesByCategory.forEach((category, index) => {
    categoryColorMap[category.category] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  });
  return categoryColorMap;
}

/**
 * Prepare drill-down data structure for category charts
 */
export function prepareDrillDownData(): Record<string, DrillDownData> {
  const categoryColorMap = createCategoryColorMap();
  const drillDownData: Record<string, DrillDownData> = {};

  dashboardData.salesByCategory.forEach((category) => {
    const categoryColor = categoryColorMap[category.category];
    // Add color property to each product to match parent category color
    const productsWithColor = category.products.map((product) => ({
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

