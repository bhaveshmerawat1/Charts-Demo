import dashboardData from "@/utils/echarts/dashboardData.json";

export interface KPICardData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  variant?: "primary" | "default";
  icon?: "doctor" | "nurse" | "staff" | "patients";
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Prepare KPI cards data from dashboard data
 */
export function prepareKPICards(): KPICardData[] {
  return [
    {
      label: "Total Revenue",
      value: formatCurrency(dashboardData.totalRevenue),
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "primary",
      icon: "doctor",
    },
    {
      label: "Total Orders",
      value: formatNumber(dashboardData.totalOrders),
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "default",
      icon: "nurse",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(dashboardData.avgOrderValue),
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "default",
      icon: "staff",
    },
    {
      label: "Conversion Rate",
      value: `${dashboardData.conversionRate}%`,
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "default",
      icon: "patients",
    },
  ];
}

