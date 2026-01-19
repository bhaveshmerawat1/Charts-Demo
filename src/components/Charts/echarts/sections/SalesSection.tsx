/**
 * Sales Section Component
 * Displays all sales-related charts
 */

"use client";

import React from "react";
import { Chart } from "@/components/Charts/echarts/Chart";
import { ChartLoader } from "@/components/Charts/echarts/core/ChartLoader";
import { salesCharts } from "@/config/chartConfigs";
import type { SalesApiResponse, Theme } from "@/types/dashboard";

interface SalesSectionProps {
  data: SalesApiResponse | null;
  loading: boolean;
  theme: Theme;
}

export function SalesSection({ data, loading, theme }: SalesSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Total Sales Over Time */}
        {loading || !data ? (
          <ChartLoader
            title="Total Sales Over Time"
            subtitle="Daily revenue trend analysis"
            cardVariant="bordered"
            theme={theme}
          />
        ) : (
          <Chart
            {...salesCharts.totalSalesOverTime(theme)}
            data={data.totalSalesOverTime}
            theme={theme}
          />
        )}

        {/* Orders Over Time */}
        {loading || !data ? (
          <ChartLoader
            title="Orders Over Time"
            subtitle="Daily order volume tracking"
            cardVariant="bordered"
            theme={theme}
          />
        ) : (
          <Chart
            {...salesCharts.ordersOverTime(theme)}
            data={data.ordersOverTime}
            theme={theme}
          />
        )}
      </div>

      {/* Revenue by Payment Method */}
      {loading || !data ? (
        <ChartLoader
          title="Revenue by Payment Method"
          subtitle="Distribution of revenue across payment methods"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...salesCharts.revenueByPaymentMethod(theme)}
          data={data.revenueByPaymentMethod}
          theme={theme}
        />
      )}
    </>
  );
}

