/**
 * Chart Configuration Presets
 * Centralized chart configurations for the dashboard
 */

import type { ChartSeries, ExportOptions } from "@/components/Charts/echarts/Chart";
import type { Theme } from "@/types/dashboard";

export interface ChartConfig {
  title: string;
  subtitle: string;
  cardVariant?: "plain" | "elevated" | "gradient" | "bordered";
  xKey?: string;
  nameKey?: string;
  valueKey?: string;
  series: ChartSeries[];
  colors: string[];
  exportOptions: ExportOptions;
  dataZoom?: boolean | object;
  showLabels?: boolean;
  showLegend?: boolean;
  legendPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  chartHeight?: number | string;
  className?: string;
  overrideOption?: any;
}

// ============================================================================
// Sales Section Charts
// ============================================================================

export const salesCharts = {
  totalSalesOverTime: (theme: Theme): ChartConfig => ({
    title: "Total Sales Over Time",
    subtitle: "Daily revenue trend analysis",
    cardVariant: "bordered",
    xKey: "date",
    series: [
      { type: "line", dataKey: "revenue", name: "Revenue", smooth: true, area: true },
    ],
    colors: ["#3b82f6"],
    exportOptions: {
      enabled: true,
      formats: ["png", "svg", "pdf", "csv"],
      fileName: "total-sales-over-time",
    },
    dataZoom: true,
  }),

  ordersOverTime: (theme: Theme): ChartConfig => ({
    title: "Orders Over Time",
    subtitle: "Daily order volume tracking",
    cardVariant: "bordered",
    xKey: "date",
    series: [{ type: "bar", dataKey: "orders", name: "Orders" }],
    colors: ["#10b981"],
    exportOptions: {
      enabled: true,
      formats: ["png", "svg", "pdf", "csv"],
      fileName: "orders-over-time",
    },
    dataZoom: true,
  }),

  revenueByPaymentMethod: (theme: Theme): ChartConfig => ({
    title: "Revenue by Payment Method",
    subtitle: "Distribution of revenue across payment methods",
    cardVariant: "bordered",
    nameKey: "method",
    valueKey: "revenue",
    series: [{ type: "pie", name: "Revenue", radius: ["40%", "70%"] }],
    showLabels: false,
    showLegend: true,
    legendPosition: "top-right",
    colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "revenue-by-payment-method",
    },
    className: "mb-8",
  }),
};

// ============================================================================
// Products Section Charts
// ============================================================================

export const productsCharts = {
  topSellingProducts: (theme: Theme, products: any[]): ChartConfig => ({
    title: "Top Selling Products",
    subtitle: "Best performing products by revenue",
    cardVariant: "bordered",
    xKey: "product",
    series: [{ type: "bar", dataKey: "revenue", name: "Revenue" }],
    colors: ["#3b82f6"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "top-selling-products",
    },
    overrideOption: {
      xAxis: { type: "value" },
      yAxis: {
        type: "category",
        data: products.map((p) => p.product),
      },
    },
  }),

  categoryWiseSales: (theme: Theme): ChartConfig => ({
    title: "Category-wise Sales",
    subtitle: "Revenue breakdown by product category",
    cardVariant: "bordered",
    xKey: "category",
    series: [
      { type: "bar", dataKey: "revenue", name: "Revenue", stack: "sales" },
      { type: "bar", dataKey: "units", name: "Units", stack: "sales" },
    ],
    colors: ["#3b82f6", "#8b5cf6"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "category-wise-sales",
    },
  }),
};

// ============================================================================
// Customers Section Charts
// ============================================================================

export const customersCharts = {
  newVsReturningCustomers: (theme: Theme): ChartConfig => ({
    title: "New vs Returning Customers",
    subtitle: "Customer acquisition breakdown",
    cardVariant: "bordered",
    nameKey: "name",
    valueKey: "value",
    series: [{ type: "pie", name: "Customers" }],
    showLabels: true,
    showLegend: true,
    colors: ["#3b82f6", "#10b981"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "new-vs-returning-customers",
    },
  }),

  customerGrowth: (theme: Theme): ChartConfig => ({
    title: "Customer Growth",
    subtitle: "New customer acquisition trend",
    cardVariant: "bordered",
    xKey: "date",
    series: [
      { type: "line", dataKey: "newCustomers", name: "New Customers", smooth: true },
      { type: "line", dataKey: "totalCustomers", name: "Total Customers", smooth: true },
    ],
    colors: ["#3b82f6", "#10b981"],
    exportOptions: {
      enabled: true,
      formats: ["png", "svg", "pdf", "csv"],
      fileName: "customer-growth",
    },
  }),

  ordersByLocation: (theme: Theme): ChartConfig => ({
    title: "Orders by Location",
    subtitle: "Geographic distribution of orders",
    cardVariant: "bordered",
    xKey: "location",
    series: [{ type: "bar", dataKey: "orders", name: "Orders" }],
    colors: ["#8b5cf6"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "orders-by-location",
    },
    className: "mb-8",
  }),
};

// ============================================================================
// Orders Section Charts
// ============================================================================

export const ordersCharts = {
  orderStatusDistribution: (theme: Theme): ChartConfig => ({
    title: "Order Status Distribution",
    subtitle: "Breakdown of orders by status",
    cardVariant: "bordered",
    nameKey: "status",
    valueKey: "count",
    series: [{ type: "pie", name: "Orders", radius: ["40%", "70%"] }],
    showLabels: true,
    showLegend: false,
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "order-status-distribution",
    },
  }),

  conversionFunnel: (theme: Theme): ChartConfig => ({
    title: "Conversion Funnel",
    subtitle: "Customer journey from visitors to completed orders",
    cardVariant: "bordered",
    nameKey: "stage",
    valueKey: "count",
    series: [{ type: "funnel", name: "Conversion" }],
    showLabels: true,
    showLegend: false,
    colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "conversion-funnel",
    },
  }),
};

// ============================================================================
// Financial Section Charts
// ============================================================================

export const financialCharts = {
  revenueVsProfit: (theme: Theme): ChartConfig => ({
    title: "Revenue vs Profit",
    subtitle: "Comparison of revenue and profit over time",
    cardVariant: "bordered",
    xKey: "period",
    series: [
      { type: "line", dataKey: "revenue", name: "Revenue", smooth: true },
      { type: "line", dataKey: "profit", name: "Profit", smooth: true },
    ],
    colors: ["#3b82f6", "#10b981"],
    exportOptions: {
      enabled: true,
      formats: ["png", "svg", "pdf", "csv"],
      fileName: "revenue-vs-profit",
    },
  }),

  discountImpact: (theme: Theme): ChartConfig => ({
    title: "Discount Impact",
    subtitle: "Effect of discounts on revenue",
    cardVariant: "bordered",
    xKey: "period",
    series: [{ type: "bar", dataKey: "discountAmount", name: "Discount Amount" }],
    colors: ["#f59e0b"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "discount-impact",
    },
  }),
};

// ============================================================================
// Operations Section Charts
// ============================================================================

export const operationsCharts = {
  deliveryTimeAnalysis: (theme: Theme): ChartConfig => ({
    title: "Delivery Time Analysis",
    subtitle: "Average delivery time by period",
    cardVariant: "bordered",
    xKey: "period",
    series: [
      { type: "bar", dataKey: "averageDays", name: "Avg Days" },
      { type: "bar", dataKey: "minDays", name: "Min Days" },
      { type: "bar", dataKey: "maxDays", name: "Max Days" },
    ],
    colors: ["#3b82f6", "#10b981", "#ef4444"],
    exportOptions: {
      enabled: true,
      formats: ["png", "pdf", "csv"],
      fileName: "delivery-time-analysis",
    },
  }),

  returnsAndRefundRate: (theme: Theme): ChartConfig => ({
    title: "Returns & Refund Rate",
    subtitle: "Return and refund trends over time",
    cardVariant: "bordered",
    xKey: "period",
    series: [
      { type: "line", dataKey: "returnRate", name: "Return Rate %", smooth: true },
      { type: "line", dataKey: "refundRate", name: "Refund Rate %", smooth: true },
    ],
    colors: ["#ef4444", "#f59e0b"],
    exportOptions: {
      enabled: true,
      formats: ["png", "svg", "pdf", "csv"],
      fileName: "returns-refund-rate",
    },
  }),
};

// ============================================================================
// Dashboard Section Charts
// ============================================================================

export const dashboardCharts = {
  revenueTrend: (theme: Theme): ChartConfig => ({
    title: "Revenue Trend (Last 30 Days)",
    subtitle: "Daily revenue trend indicator",
    cardVariant: "bordered",
    xKey: "date",
    series: [{ type: "line", dataKey: "value", name: "Revenue", smooth: true, area: true }],
    colors: ["#3b82f6"],
    chartHeight: 200,
    exportOptions: {
      enabled: true,
      formats: ["png", "svg", "csv"],
      fileName: "revenue-trend-indicator",
    },
    className: "mb-8",
  }),
};

