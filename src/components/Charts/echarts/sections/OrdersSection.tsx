/**
 * Orders Section Component
 * Displays all orders-related charts
 */

"use client";

import React from "react";
import { Chart } from "@/components/Charts/echarts/Chart";
import { ChartLoader } from "@/components/Charts/echarts/core/ChartLoader";
import { ordersCharts } from "@/config/chartConfigs";
import type { OrdersApiResponse, Theme } from "@/types/dashboard";

interface OrdersSectionProps {
  data: OrdersApiResponse | null;
  loading: boolean;
  theme: Theme;
}

export function OrdersSection({ data, loading, theme }: OrdersSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Order Status Distribution */}
      {loading || !data ? (
        <ChartLoader
          title="Order Status Distribution"
          subtitle="Breakdown of orders by status"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...ordersCharts.orderStatusDistribution(theme)}
          data={data.orderStatusDistribution}
          theme={theme}
        />
      )}

      {/* Conversion Funnel */}
      {loading || !data ? (
        <ChartLoader
          title="Conversion Funnel"
          subtitle="Customer journey from visitors to completed orders"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...ordersCharts.conversionFunnel(theme)}
          data={data.conversionFunnel}
          theme={theme}
        />
      )}
    </div>
  );
}

