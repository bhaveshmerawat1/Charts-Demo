/**
 * Custom hook for fetching and managing dashboard data
 */

import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/dashboard-api";
import type {
  DashboardData,
  DashboardLoadingState,
  DashboardErrorState,
} from "@/types/dashboard";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    sales: null,
    products: null,
    customers: null,
    orders: null,
    financial: null,
    operations: null,
    dashboard: null,
  });

  const [loading, setLoading] = useState<DashboardLoadingState>({
    sales: true,
    products: true,
    customers: true,
    orders: true,
    financial: true,
    operations: true,
    dashboard: true,
  });

  const [errors, setErrors] = useState<DashboardErrorState>({
    sales: null,
    products: null,
    customers: null,
    orders: null,
    financial: null,
    operations: null,
    dashboard: null,
  });

  useEffect(() => {
    // Fetch all data independently in parallel
    const fetchSales = async () => {
      try {
        setLoading((prev) => ({ ...prev, sales: true }));
        setErrors((prev) => ({ ...prev, sales: null }));
        const salesData = await dashboardApi.fetchSales();
        setData((prev) => ({ ...prev, sales: salesData }));
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setErrors((prev) => ({
          ...prev,
          sales: err instanceof Error ? err.message : "Failed to load sales data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, sales: false }));
      }
    };

    const fetchProducts = async () => {
      try {
        setLoading((prev) => ({ ...prev, products: true }));
        setErrors((prev) => ({ ...prev, products: null }));
        const productsData = await dashboardApi.fetchProducts();
        setData((prev) => ({ ...prev, products: productsData }));
      } catch (err) {
        console.error("Error fetching products data:", err);
        setErrors((prev) => ({
          ...prev,
          products: err instanceof Error ? err.message : "Failed to load products data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };

    const fetchCustomers = async () => {
      try {
        setLoading((prev) => ({ ...prev, customers: true }));
        setErrors((prev) => ({ ...prev, customers: null }));
        const customersData = await dashboardApi.fetchCustomers();
        setData((prev) => ({ ...prev, customers: customersData }));
      } catch (err) {
        console.error("Error fetching customers data:", err);
        setErrors((prev) => ({
          ...prev,
          customers: err instanceof Error ? err.message : "Failed to load customers data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, customers: false }));
      }
    };

    const fetchOrders = async () => {
      try {
        setLoading((prev) => ({ ...prev, orders: true }));
        setErrors((prev) => ({ ...prev, orders: null }));
        const ordersData = await dashboardApi.fetchOrders();
        setData((prev) => ({ ...prev, orders: ordersData }));
      } catch (err) {
        console.error("Error fetching orders data:", err);
        setErrors((prev) => ({
          ...prev,
          orders: err instanceof Error ? err.message : "Failed to load orders data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, orders: false }));
      }
    };

    const fetchFinancial = async () => {
      try {
        setLoading((prev) => ({ ...prev, financial: true }));
        setErrors((prev) => ({ ...prev, financial: null }));
        const financialData = await dashboardApi.fetchFinancial();
        setData((prev) => ({ ...prev, financial: financialData }));
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setErrors((prev) => ({
          ...prev,
          financial: err instanceof Error ? err.message : "Failed to load financial data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, financial: false }));
      }
    };

    const fetchOperations = async () => {
      try {
        setLoading((prev) => ({ ...prev, operations: true }));
        setErrors((prev) => ({ ...prev, operations: null }));
        const operationsData = await dashboardApi.fetchOperations();
        setData((prev) => ({ ...prev, operations: operationsData }));
      } catch (err) {
        console.error("Error fetching operations data:", err);
        setErrors((prev) => ({
          ...prev,
          operations: err instanceof Error ? err.message : "Failed to load operations data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, operations: false }));
      }
    };

    const fetchDashboard = async () => {
      try {
        setLoading((prev) => ({ ...prev, dashboard: true }));
        setErrors((prev) => ({ ...prev, dashboard: null }));
        const dashboardData = await dashboardApi.fetchDashboard();
        setData((prev) => ({ ...prev, dashboard: dashboardData }));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setErrors((prev) => ({
          ...prev,
          dashboard: err instanceof Error ? err.message : "Failed to load dashboard data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, dashboard: false }));
      }
    };

    // Fetch all data in parallel
    fetchSales();
    fetchProducts();
    fetchCustomers();
    fetchOrders();
    fetchFinancial();
    fetchOperations();
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    errors,
  };
}

