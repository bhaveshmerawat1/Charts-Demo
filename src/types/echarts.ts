export interface UserRole {
  role: string;
  count: number;
}

export interface UserRegion {
  region: string;
  users: number;
  growth: number;
}

export interface UserActivityPoint {
  hour: string;
  active: number;
}

export interface UsersData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  usersByRole: UserRole[];
  usersByRegion: UserRegion[];
  userActivityByHour: UserActivityPoint[];
}

export interface Product {
  name: string;
  revenue: number;
  orders: number;
  margin: number;
}

export interface SalesCategory {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
  products: Product[];
}

export interface MonthlySale {
  month: string;
  revenue: number;
  orders: number;
  target: number;
}

export interface OrderStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueChannel {
  channel: string;
  revenue: number;
  orders: number;
}

export interface DashboardData {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
  salesByCategory: SalesCategory[];
  monthlySales: MonthlySale[];
  ordersByStatus: OrderStatus[];
  revenueByChannel: RevenueChannel[];
}
