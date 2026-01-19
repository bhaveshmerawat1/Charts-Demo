/**
 * Dashboard Type Definitions
 * Types for ECharts dashboard API responses and data structures
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface SalesApiResponse {
  totalSalesOverTime: Array<{ date: string; sales: number; revenue: number }>;
  ordersOverTime: Array<{ date: string; orders: number; value: number }>;
  revenueByPaymentMethod: Array<{ method: string; revenue: number; orders: number; percentage: number }>;
  overview: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    salesGrowth: number;
    orderGrowth: number;
  };
}

export interface ProductsApiResponse {
  topSellingProducts: Array<{ product: string; revenue: number; units: number; margin: number }>;
  categoryWiseSales: Array<{ category: string; revenue: number; units: number; percentage: number }>;
  inventoryStockStatus: Array<{ product: string; stockLevel: number; stockPercentage: number; status: string }>;
}

export interface CustomersApiResponse {
  newVsReturningCustomers: { new: number; returning: number; newPercentage: number; returningPercentage: number };
  customerGrowth: Array<{ date: string; newCustomers: number; totalCustomers: number; growthRate: number }>;
  ordersByLocation: Array<{ location: string; country?: string; orders: number; revenue: number; percentage: number }>;
}

export interface OrdersApiResponse {
  orderStatusDistribution: Array<{ status: string; count: number; percentage: number; revenue: number }>;
  conversionFunnel: Array<{ stage: string; count: number; percentage: number; dropoffRate: number }>;
  overview: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
}

export interface FinancialApiResponse {
  revenueVsProfit: Array<{ period: string; revenue: number; profit: number; profitMargin: number }>;
  discountImpact: Array<{ period: string; discountAmount: number; revenueWithDiscount: number; revenueWithoutDiscount: number; impact: number }>;
}

export interface OperationsApiResponse {
  deliveryTimeAnalysis: Array<{ period: string; averageDays: number; minDays: number; maxDays: number; medianDays: number; p25Days: number; p75Days: number }>;
  returnsAndRefundRate: Array<{ period: string; returns: number; refunds: number; returnRate: number; refundRate: number; totalOrders: number }>;
}

export interface DashboardApiResponse {
  kpiWidgets: {
    conversionRate: { value: number; target: number; percentage: number };
    orderSuccessRate: { value: number; target: number; percentage: number };
    dailyTarget: { value: number; target: number; percentage: number };
    trendIndicator: Array<{ date: string; value: number }>;
  };
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
  };
}

// ============================================================================
// Unified Dashboard Data Type
// ============================================================================

export interface DashboardData {
  sales: SalesApiResponse | null;
  products: ProductsApiResponse | null;
  customers: CustomersApiResponse | null;
  orders: OrdersApiResponse | null;
  financial: FinancialApiResponse | null;
  operations: OperationsApiResponse | null;
  dashboard: DashboardApiResponse | null;
}

// ============================================================================
// Loading and Error States
// ============================================================================

export interface DashboardLoadingState {
  sales: boolean;
  products: boolean;
  customers: boolean;
  orders: boolean;
  financial: boolean;
  operations: boolean;
  dashboard: boolean;
}

export interface DashboardErrorState {
  sales: string | null;
  products: string | null;
  customers: string | null;
  orders: string | null;
  financial: string | null;
  operations: string | null;
  dashboard: string | null;
}

// ============================================================================
// Theme Types
// ============================================================================

export type Theme = "light" | "dark";

// ============================================================================
// Time Filter Types
// ============================================================================

export type TimeFilterValue = "all" | "last3" | "last6" | "last12";

