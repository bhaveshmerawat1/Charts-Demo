export interface KPICardData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  variant?: "primary" | "default";
  icon?: "doctor" | "nurse" | "staff" | "patients";
}

interface DashboardData {
  kpis: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
  };
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
export function prepareKPICards(dashboardData: DashboardData): KPICardData[] {
  const { kpis } = dashboardData;
  
  return [
    {
      label: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      change: `${kpis.revenueGrowth.toFixed(1)}%`,
      trend: kpis.revenueGrowth >= 0 ? "up" : "down",
      variant: "primary",
      icon: "doctor",
    },
    {
      label: "Total Orders",
      value: formatNumber(kpis.totalOrders),
      change: `${kpis.revenueGrowth.toFixed(1)}%`,
      trend: kpis.revenueGrowth >= 0 ? "up" : "down",
      variant: "default",
      icon: "nurse",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(kpis.avgOrderValue),
      change: `${kpis.revenueGrowth.toFixed(1)}%`,
      trend: kpis.revenueGrowth >= 0 ? "up" : "down",
      variant: "default",
      icon: "staff",
    },
    {
      label: "Conversion Rate",
      value: `${kpis.conversionRate.toFixed(1)}%`,
      change: `${kpis.revenueGrowth.toFixed(1)}%`,
      trend: kpis.revenueGrowth >= 0 ? "up" : "down",
      variant: "default",
      icon: "patients",
    },
  ];
}

