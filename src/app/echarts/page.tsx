"use client";

import React from "react";
import { KPICard } from "@/components/Charts/echarts/KPICard";
import { LiveChart } from "@/components/Charts/echarts/LiveChart";
import { DashboardHeader } from "@/components/Charts/echarts/DashboardHeader";
import { SalesSection } from "@/components/Charts/echarts/sections/SalesSection";
import { ProductsSection } from "@/components/Charts/echarts/sections/ProductsSection";
import { CustomersSection } from "@/components/Charts/echarts/sections/CustomersSection";
import { OrdersSection } from "@/components/Charts/echarts/sections/OrdersSection";
import { FinancialSection } from "@/components/Charts/echarts/sections/FinancialSection";
import { OperationsSection } from "@/components/Charts/echarts/sections/OperationsSection";
import { KPISection } from "@/components/Charts/echarts/sections/KPISection";
import { LiveChartTable } from "@/components/Charts/echarts/widgets/LiveChartTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTheme } from "@/hooks/useTheme";
import { usePDFExport } from "@/hooks/usePDFExport";

export default function ECommerceDashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { data, loading } = useDashboardData();
  const { pageRef, isExporting, handleExportPDF } = usePDFExport();

  const isDark = theme === "dark";
  const bgGradient = isDark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-white";

  return (
    <div ref={pageRef} className={`min-h-screen ${bgGradient} py-8 px-4 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader
          theme={theme}
          onThemeToggle={toggleTheme}
          onExportPDF={() => handleExportPDF(theme)}
          isExporting={isExporting}
          title="Analytics Dashboard"
          subtitle="Comprehensive e-commerce performance metrics and insights"
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading.dashboard || !data.dashboard || loading.sales || !data.sales ? (
            <>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
            </>
          ) : (
            <>
              <KPICard
                label="Total Revenue"
                value={`$${(data.dashboard.kpis.totalRevenue / 1000000).toFixed(1)}M`}
                change={`${data.sales.overview.salesGrowth.toFixed(1)}%`}
                trend={data.sales.overview.salesGrowth >= 0 ? "up" : "down"}
                theme={theme}
                variant="primary"
              />
              <KPICard
                label="Total Orders"
                value={data.dashboard.kpis.totalOrders.toLocaleString()}
                change={`${data.sales.overview.orderGrowth.toFixed(1)}%`}
                trend={data.sales.overview.orderGrowth >= 0 ? "up" : "down"}
                theme={theme}
              />
              <KPICard
                label="Avg Order Value"
                value={`$${data.dashboard.kpis.avgOrderValue.toFixed(0)}`}
                change="+5.2%"
                trend="up"
                theme={theme}
              />
              <KPICard
                label="Conversion Rate"
                value={`${data.dashboard.kpis.conversionRate.toFixed(1)}%`}
                change="+0.3%"
                trend="up"
                theme={theme}
              />
            </>
          )}
        </div>

        {/* Live Sales Chart */}
        <div className="mb-8">
          <LiveChart
            title="Live Sales Revenue"
            subtitle="Real-time sales revenue tracking (updates every second)"
            cardVariant="bordered"
            xKey="date"
            series={[
              { type: "line", dataKey: "revenue", name: "Revenue", smooth: true, area: true },
            ]}
            colors={["#3b82f6"]}
            exportOptions={{
              enabled: true,
              formats: ["png", "svg", "pdf", "csv"],
              fileName: "live-sales-revenue",
            }}
            theme={theme}
            updateInterval={1000}
            maxDataPoints={120}
            showLiveIndicator={true}
            chartHeight={400}
            dataZoom={true}
          />
        </div>

        {/* Live Chart Table */}
        <div className="mb-8">
          <LiveChartTable
            theme={theme}
            updateInterval={1000}
            maxDataPoints={60}
          />
        </div>

        {/* Sales Section */}
        <SalesSection data={data.sales} loading={loading.sales} theme={theme} />

        {/* Products Section */}
        <ProductsSection data={data.products} loading={loading.products} theme={theme} />

        {/* Customers Section */}
        <CustomersSection data={data.customers} loading={loading.customers} theme={theme} />

        {/* Orders Section */}
        <OrdersSection data={data.orders} loading={loading.orders} theme={theme} />

        {/* Financial Section */}
        <FinancialSection data={data.financial} loading={loading.financial} theme={theme} />

        {/* Operations Section */}
        <OperationsSection data={data.operations} loading={loading.operations} theme={theme} />

        {/* KPI Section */}
        <KPISection
          dashboardData={data.dashboard}
          productsData={data.products}
          loadingDashboard={loading.dashboard}
          loadingProducts={loading.products}
          theme={theme}
        />
      </div>
    </div>
  );
}
