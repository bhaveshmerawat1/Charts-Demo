/**
 * Dashboard API Service
 * Centralized service for fetching dashboard data from API endpoints
 */

import type {
  SalesApiResponse,
  ProductsApiResponse,
  CustomersApiResponse,
  OrdersApiResponse,
  FinancialApiResponse,
  OperationsApiResponse,
  DashboardApiResponse,
} from "@/types/dashboard";

export class DashboardApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error instanceof Error ? error : new Error(`Failed to fetch ${endpoint}`);
    }
  }

  /**
   * Fetch sales data
   */
  async fetchSales(): Promise<SalesApiResponse> {
    return this.fetchData<SalesApiResponse>("/api/sales");
  }

  /**
   * Fetch products data
   */
  async fetchProducts(): Promise<ProductsApiResponse> {
    return this.fetchData<ProductsApiResponse>("/api/products");
  }

  /**
   * Fetch customers data
   */
  async fetchCustomers(): Promise<CustomersApiResponse> {
    return this.fetchData<CustomersApiResponse>("/api/customers");
  }

  /**
   * Fetch orders data
   */
  async fetchOrders(): Promise<OrdersApiResponse> {
    return this.fetchData<OrdersApiResponse>("/api/orders");
  }

  /**
   * Fetch financial data
   */
  async fetchFinancial(): Promise<FinancialApiResponse> {
    return this.fetchData<FinancialApiResponse>("/api/financial");
  }

  /**
   * Fetch operations data
   */
  async fetchOperations(): Promise<OperationsApiResponse> {
    return this.fetchData<OperationsApiResponse>("/api/operations");
  }

  /**
   * Fetch dashboard data
   */
  async fetchDashboard(): Promise<DashboardApiResponse> {
    return this.fetchData<DashboardApiResponse>("/api/dashboard");
  }

  /**
   * Fetch all dashboard data in parallel
   */
  async fetchAll(): Promise<{
    sales: SalesApiResponse;
    products: ProductsApiResponse;
    customers: CustomersApiResponse;
    orders: OrdersApiResponse;
    financial: FinancialApiResponse;
    operations: OperationsApiResponse;
    dashboard: DashboardApiResponse;
  }> {
    const [sales, products, customers, orders, financial, operations, dashboard] = await Promise.all([
      this.fetchSales(),
      this.fetchProducts(),
      this.fetchCustomers(),
      this.fetchOrders(),
      this.fetchFinancial(),
      this.fetchOperations(),
      this.fetchDashboard(),
    ]);

    return {
      sales,
      products,
      customers,
      orders,
      financial,
      operations,
      dashboard,
    };
  }
}

// Default service instance
export const dashboardApi = new DashboardApiService();

