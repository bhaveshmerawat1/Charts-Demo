/**
 * API Type Definitions
 * Shared types for all API endpoints
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface FilterParams {
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface QueryParams extends DateRangeParams, FilterParams {
  page?: number;
  pageSize?: number;
}



