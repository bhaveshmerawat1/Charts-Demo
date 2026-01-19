/**
 * KPI Section Component
 * Displays KPI widgets and trend indicator
 */

"use client";

import React from "react";
import { Chart } from "@/components/Charts/echarts/Chart";
import { ChartLoader } from "@/components/Charts/echarts/core/ChartLoader";
import { KPITable } from "@/components/Charts/echarts/widgets/KPITable";
import { InventoryTable } from "@/components/Charts/echarts/widgets/InventoryTable";
import { dashboardCharts } from "@/config/chartConfigs";
import type { DashboardApiResponse, ProductsApiResponse, Theme } from "@/types/dashboard";

interface KPISectionProps {
  dashboardData: DashboardApiResponse | null;
  productsData: ProductsApiResponse | null;
  loadingDashboard: boolean;
  loadingProducts: boolean;
  theme: Theme;
}

export function KPISection({
  dashboardData,
  productsData,
  loadingDashboard,
  loadingProducts,
  theme,
}: KPISectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* KPI Table */}
        {loadingDashboard || !dashboardData ? (
          <ChartLoader
            title="Key Performance Indicators"
            cardVariant="bordered"
            theme={theme}
          />
        ) : (
          <KPITable data={dashboardData.kpiWidgets} theme={theme} />
        )}

        {/* Inventory Stock Status Table */}
        {loadingProducts || !productsData ? (
          <ChartLoader
            title="Inventory Stock Status"
            cardVariant="bordered"
            theme={theme}
          />
        ) : (
          <InventoryTable data={productsData.inventoryStockStatus} theme={theme} />
        )}
      </div>

      {/* Trend Indicator */}
      {loadingDashboard || !dashboardData ? (
        <ChartLoader
          title="Revenue Trend (Last 30 Days)"
          subtitle="Daily revenue trend indicator"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...dashboardCharts.revenueTrend(theme)}
          data={dashboardData.kpiWidgets.trendIndicator}
          theme={theme}
        />
      )}
    </>
  );
}

