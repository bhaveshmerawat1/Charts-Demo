"use client";

import React, { useState } from "react";
import userData from "@/utils/echarts/userData.json";
import dashboardData from "@/utils/echarts/dashboardData.json";
import { KPICard } from "@/components/Charts/echarts/KPICard";
import { Chart } from "@/components/Charts/echarts/Chart";
import type { DrillDownData } from "@/components/Charts/echarts/Chart";
import { transformScatterData } from "@/components/Charts/echarts/dataTransformers";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export default function DashboardPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [timeFilter, setTimeFilter] = useState<"all" | "last3" | "last6" | "last12">("all");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Filter monthly sales data based on selected time duration
  const filterMonthlySales = (data: typeof dashboardData.monthlySales) => {
    if (timeFilter === "all") {
      return data;
    }
    
    const monthsToShow = timeFilter === "last3" ? 3 : timeFilter === "last6" ? 6 : 12;
    // Return last N months from the array
    return data.slice(-monthsToShow);
  };

  const filteredMonthlySales = filterMonthlySales(dashboardData.monthlySales);

  /* ---------------- KPI Cards ---------------- */
  // Format numbers for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const kpiCards: (KPICardProps & { variant?: "primary" | "default"; icon?: "doctor" | "nurse" | "staff" | "patients" })[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(dashboardData.totalRevenue),
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "primary",
      icon: "doctor",
    },
    {
      label: "Total Orders",
      value: formatNumber(dashboardData.totalOrders),
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "default",
      icon: "nurse",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(dashboardData.avgOrderValue),
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "default",
      icon: "staff",
    },
    {
      label: "Conversion Rate",
      value: `${dashboardData.conversionRate}%`,
      change: `${dashboardData.revenueGrowth}%`,
      trend: "up",
      variant: "default",
      icon: "patients",
    },
  ];

  /* ---------------- Drill-down Data Preparation ---------------- */
  // Define colors for categories - each category will get a unique color
  const categoryColors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444", "#6366f1", "#14b8a6"];
  
  // Create a color mapping for categories
  const categoryColorMap: Record<string, string> = {};
  dashboardData.salesByCategory.forEach((category, index) => {
    categoryColorMap[category.category] = categoryColors[index % categoryColors.length];
  });

  const drillDownData: Record<string, DrillDownData> = {};
  dashboardData.salesByCategory.forEach((category) => {
    const categoryColor = categoryColorMap[category.category];
    // Add color property to each product to match parent category color
    const productsWithColor = category.products.map((product) => ({
      ...product,
      color: categoryColor,
    }));
    
    drillDownData[category.category] = {
      name: category.category,
      data: productsWithColor,
      xKey: "name",
      series: [{ type: "bar", dataKey: "revenue", name: "Revenue" }],
    };
  });

  /* ---------------- Data Transformations ---------------- */
  // Transform revenueVsOrders from API format to chart format
  const scatterData = transformScatterData(dashboardData.revenueVsOrders, {
    xField: "revenue",
    yField: "orders",
    nameField: "name",
  });

  const isDark = theme === "dark";
  const bgGradient = isDark 
    ? "bg-gradient-to-br from-gray-900 to-gray-800" 
    : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const textSecondaryColor = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgGradient} py-8 px-4 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="mb-8 relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className={`text-5xl font-light ${textColor}`}>Analytics Dashboard</h1>
              <p className={textSecondaryColor}>
                Comprehensive business intelligence and performance metrics
              </p>
            </div>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Light</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, idx) => (
            <KPICard 
              key={idx} 
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              theme={theme}
              variant={kpi.variant}
              icon={kpi.icon}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 1. Bar Chart: Users by Role */}
          <Chart
            title="User Distribution by Role"
            subtitle="Breakdown of users across roles"
            cardVariant="bordered"
            data={userData.usersByRole}
            xKey="role"
            series={[{ type: "bar", dataKey: "count", name: "Users" }]}
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]}
            exportOptions={{
              enabled: true,
              formats: ["png", "jpg", "svg", "pdf", "csv", "xlsx"],
              fileName: "user-distribution-by-role",
            }}
            theme={theme}
          />

          {/* 2. Pie Chart: Users by Region */}
          <Chart
            title="Global User Distribution"
            cardVariant="bordered"
            headerAlign="left"
            data={userData.usersByRegion}
            nameKey="region"
            valueKey="users"
            series={[{ type: "pie", name: "Users" }]}
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]}
            showLabels={false}
            showLegend={true}
            legendPosition="top-right"
            legendOrientation="vertical"
            exportOptions={{
              enabled: true,
              formats: ["png", "jpg", "pdf", "csv", "xlsx"],
              fileName: "global-user-distribution",
            }}
            theme={theme}
          />
        </div>

        {/* 3. Line Chart: User Activity */}
        <Chart
          title="User Activity Throughout the Day"
          cardVariant="bordered"
          className="mb-8"
          data={userData.userActivityByHour}
          xKey="hour"
          series={[
            { type: "line", dataKey: "active", name: "Active Users", area: true },
          ]}
          chartHeight={350}
          colors={["#3b82f6"]}
          exportOptions={{
            enabled: true,
            formats: ["png", "svg", "pdf", "csv", "xlsx"],
            fileName: "user-activity-by-hour",
          }}
          theme={theme}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 4. Bar Chart with Drill-down: Revenue by Category */}
          <Chart
            title="Revenue by Category"
            subtitle="Click any category to drill down"
            cardVariant="bordered"
            data={dashboardData.salesByCategory.map((category, index) => ({
              ...category,
              color: categoryColors[index % categoryColors.length],
            }))}
            xKey="category"
            series={[{ type: "bar", dataKey: "revenue", name: "Revenue" }]}
            enableDrillDown={true}
            drillDownData={drillDownData}
            colors={categoryColors}
            overrideOption={{
              xAxis: {
                axisLabel: {
                  interval: 0,
                  show: true,
                  rotate: 0,
                },
              },
              grid: {
                bottom: "10%",
              },
            }}
            exportOptions={{
              enabled: true,
              formats: ["png", "jpg", "pdf", "csv", "xlsx"],
              fileName: "revenue-by-category",
            }}
            theme={theme}
          />

          {/* 5. Scatter Chart: Revenue vs Orders */}
          <Chart
            title="Revenue vs Orders Correlation"
            subtitle="Relationship between revenue and order volume"
            cardVariant="bordered"
            data={scatterData}
            series={[
              {
                type: "scatter",
                dataKey: "x",
                name: "Revenue vs Orders",
                extra: {
                  symbolSize: 12,
                },
              },
            ]}
            overrideOption={{
              xAxis: {
                type: "value",
                name: "Revenue ($)",
                nameLocation: "middle",
                nameGap: 30,
              },
              yAxis: {
                type: "value",
                name: "Orders",
                nameLocation: "middle",
                nameGap: 50,
              },
              tooltip: {
                formatter: (params: any) => {
                  const data = params.data;
                  const name = data[2] || "Point";
                  return `${name}<br/>Revenue: $${data[0].toLocaleString()}<br/>Orders: ${data[1]}`;
                },
              },
            }}
            colors={["#ec4899"]}
            theme={theme}
          />
        </div>

        {/* 6. Radar Chart: Performance Metrics */}
        <Chart
          title="Multi-Dimensional Performance Metrics"
          subtitle="Overall business performance across key dimensions"
          cardVariant="bordered"
          className="mb-8"
          data={dashboardData.performanceMetrics}
          nameKey="name"
          valueKey="value"
          series={[
            {
              type: "radar",
              name: "Performance",
              extra: {
                areaStyle: { opacity: 0.3 },
              },
            },
          ]}
          colors={["#10b981"]}
          theme={theme}
        />

        {/* Monthly Line Chart */}
        <Chart
          title="Revenue vs Target Trend"
          cardVariant="bordered"
          className="mb-8"
          data={dashboardData.monthlySales}
          xKey="month"
          series={[
            { type: "line", dataKey: "revenue", name: "Revenue", area: true },
            { type: "line", dataKey: "target", name: "Target" },
          ]}
          colors={["#3b82f6", "#f59e0b"]}
          exportOptions={{
            enabled: true,
            formats: ["png", "jpg", "svg", "pdf", "csv", "xlsx"],
            fileName: "revenue-vs-target-trend",
            pixelRatio: 2,
          }}
          theme={theme}
        />

        {/* PERFORMANCE METRICS */}
        <h2 className={`text-2xl font-light mb-4 ${textColor}`}>
          Performance Metrics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie: Order Status */}
          <Chart
            title="Order Status Distribution"
            cardVariant="bordered"
            data={dashboardData.ordersByStatus}
            nameKey="status"
            valueKey="count"
            series={[{ 
              type: "pie", 
              name: "Orders",
              radius: ["40%", "70%"] // Donut chart
            }]}
            colors={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]}
            exportOptions={{
              enabled: true,
              formats: ["png", "jpg", "pdf", "csv", "xlsx"],
              fileName: "order-status-distribution",
            }}
            theme={theme}
          />

          {/* Bar: Revenue Channels */}
          <Chart
            title="Revenue by Marketing Channel"
            cardVariant="bordered"
            data={dashboardData.revenueByChannel}
            xKey="channel"
            series={[{ type: "bar", dataKey: "revenue", name: "Revenue" }]}
            colors={["#8b5cf6"]}
            theme={theme}
          />
        </div>

        {/* ADDITIONAL CHARTS WITH DIFFERENT UI */}
        <h2 className={`text-2xl font-light mb-4 ${textColor}`}>
          Advanced Visualizations
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 7. Horizontal Bar Chart (Different Layout) */}
          <Chart
            title="Revenue by Channel (Horizontal)"
            subtitle="Horizontal bar chart layout"
            cardVariant="gradient"
            data={dashboardData.revenueByChannel}
            xKey="channel"
            series={[{ type: "bar", dataKey: "revenue", name: "Revenue" }]}
            overrideOption={{
              xAxis: { type: "value" },
              yAxis: { type: "category", data: dashboardData.revenueByChannel.map((d) => d.channel) },
            }}
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]}
            theme={theme}
          />

          {/* 8. Donut Pie Chart (Different Visual Style) */}
          <Chart
            title="User Distribution (Donut)"
            subtitle="Donut style pie chart with rounded corners and gaps"
            cardVariant="bordered"
            headerAlign="center"
            data={userData.usersByRegion}
            nameKey="region"
            valueKey="users"
            showLabels={false}
            showLegend={true}
            legendPosition="top-right"
            legendOrientation="vertical"
            series={[
              {
                type: "pie",
                name: "Users",
                radius: ["50%", "80%"],
                extra: {
                  label: {
                    show: true,
                    formatter: "{b}: {c} ({d}%)",
                  },
                  selectedMode: "single",
                  selectedOffset: 10,
                  itemStyle: {
                    borderRadius: 8,
                    borderColor: "#fff",
                    borderWidth: 2,
                  },
                },
              },
            ]}
            overrideOption={{
              series: [
                {
                  selectedMode: "single",
                  selectedOffset: 10,
                  itemStyle: {
                    borderRadius: 8,
                    borderColor: "#fff",
                    borderWidth: 2,
                  },
                },
              ],
            }}
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]}
            theme={theme}
          />
        </div>

        {/* 9. Area Line Chart with Gradient (Different Styling) */}
        <Chart
          title="Revenue Trend with Gradient Fill"
          subtitle="Enhanced area chart with rounded gradient styling"
          cardVariant="gradient"
          className="mb-8"
          data={dashboardData.monthlySales}
          xKey="month"
          series={[
            {
              type: "line",
              dataKey: "revenue",
              name: "Revenue",
              area: true,
              smooth: true,
              extra: {
                areaStyle: {
                  color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: "rgba(59, 130, 246, 0.8)" },
                      { offset: 1, color: "rgba(59, 130, 246, 0.1)" },
                    ],
                  },
                },
                lineStyle: {
                  width: 3,
                  color: "#3b82f6",
                },
                symbol: "circle",
                symbolSize: 8,
                itemStyle: {
                  color: "#3b82f6",
                  borderWidth: 2,
                  borderColor: "#fff",
                },
              },
            },
          ]}
          overrideOption={{
            series: [
              {
                lineStyle: {
                  width: 3,
                  shadowBlur: 5,
                  shadowColor: "rgba(59, 130, 246, 0.3)",
                },
                emphasis: {
                  focus: "series",
                  areaStyle: {
                    opacity: 0.6,
                  },
                },
              },
            ],
          }}
          colors={["#3b82f6"]}
          theme={theme}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 10. Scatter Chart with Different Markers (Different Visual) */}
          <Chart
            title="Revenue vs Orders (Enhanced Scatter)"
            subtitle="Scatter chart with rounded markers and shadows"
            cardVariant="bordered"
            data={scatterData}
            series={[
              {
                type: "scatter",
                dataKey: "x",
                name: "Revenue vs Orders",
                extra: {
                  symbolSize: (data: any) => Math.sqrt(data[0]) / 100,
                  itemStyle: {
                    color: (params: any) => {
                      const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
                      return colors[params.dataIndex % colors.length];
                    },
                    borderColor: "#fff",
                    borderWidth: 2,
                    shadowBlur: 10,
                    shadowColor: "rgba(0, 0, 0, 0.2)",
                  },
                },
              },
            ]}
            overrideOption={{
              xAxis: {
                type: "value",
                name: "Revenue ($)",
                nameLocation: "middle",
                nameGap: 30,
              },
              yAxis: {
                type: "value",
                name: "Orders",
                nameLocation: "middle",
                nameGap: 50,
              },
              tooltip: {
                formatter: (params: any) => {
                  const data = params.data;
                  const name = data[2] || "Point";
                  return `${name}<br/>Revenue: $${data[0].toLocaleString()}<br/>Orders: ${data[1]}`;
                },
              },
              series: [
                {
                  symbol: "circle",
                  itemStyle: {
                    borderRadius: "50%",
                    shadowBlur: 10,
                    shadowColor: "rgba(0, 0, 0, 0.2)",
                    shadowOffsetY: 2,
                  },
                },
              ],
            }}
            colors={["#3b82f6"]}
            theme={theme}
          />

          {/* 11. Radar Chart with Filled Area (Different Appearance) */}
          <Chart
            title="Performance Metrics (Filled Radar)"
            subtitle="Radar chart with enhanced rounded styling"
            cardVariant="bordered"
            data={dashboardData.performanceMetrics}
            nameKey="name"
            valueKey="value"
            series={[
              {
                type: "radar",
                name: "Performance",
                extra: {
                  areaStyle: {
                    color: {
                      type: "radial",
                      x: 0.5,
                      y: 0.5,
                      r: 0.5,
                      colorStops: [
                        { offset: 0, color: "rgba(16, 185, 129, 0.8)" },
                        { offset: 1, color: "rgba(16, 185, 129, 0.1)" },
                      ],
                    },
                  },
                  lineStyle: {
                    width: 3,
                    color: "#10b981",
                    type: "solid",
                  },
                  itemStyle: {
                    color: "#10b981",
                    borderWidth: 2,
                    borderColor: "#fff",
                  },
                },
              },
            ]}
            overrideOption={{
              radar: {
                shape: "polygon",
                radius: "75%",
                axisName: {
                  color: "#666",
                  fontSize: 12,
                },
                splitArea: {
                  areaStyle: {
                    color: ["rgba(16, 185, 129, 0.05)", "rgba(16, 185, 129, 0.02)"],
                  },
                },
                splitLine: {
                  lineStyle: {
                    color: "rgba(16, 185, 129, 0.2)",
                  },
                },
                axisLine: {
                  lineStyle: {
                    color: "rgba(16, 185, 129, 0.3)",
                  },
                },
              },
              series: [
                {
                  symbol: "circle",
                  symbolSize: 8,
                  itemStyle: {
                    borderRadius: "50%",
                    shadowBlur: 5,
                    shadowColor: "rgba(16, 185, 129, 0.3)",
                  },
                },
              ],
            }}
            colors={["#10b981"]}
            theme={theme}
          />
        </div>

        {/* 12. Stacked Bar Chart (Different Layout) */}
        <div className="mb-8">
          {/* Time Duration Filter Dropdown */}
          <div className="mb-4 flex items-center justify-end">
            <label
              htmlFor="time-filter"
              className={`mr-3 text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Time Duration:
            </label>
            <select
              id="time-filter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as "all" | "last3" | "last6" | "last12")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 outline-none cursor-pointer ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <option value="all">All Time</option>
              <option value="last3">Last 3 Months</option>
              <option value="last6">Last 6 Months</option>
              <option value="last12">Last Year</option>
            </select>
          </div>

          <Chart
            title="Monthly Revenue & Orders (Stacked)"
            subtitle="Stacked bar chart with rounded corners"
            cardVariant="bordered"
            data={filteredMonthlySales}
            xKey="month"
            series={[
              {
                type: "bar",
                dataKey: "revenue",
                name: "Revenue",
                stack: "sales",
              },
              {
                type: "bar",
                dataKey: "orders",
                name: "Orders",
                stack: "sales",
              },
            ]}
            overrideOption={{
              yAxis: {
                type: "value",
                name: "Amount",
              },
              series: [
                {
                  barBorderRadius: [8, 8, 0, 0],
                  barCategoryGap: "20%",
                } as any,
                {
                  barBorderRadius: [0, 0, 8, 8],
                  barCategoryGap: "20%",
                } as any,
              ],
            }}
            colors={["#3b82f6", "#8b5cf6"]}
            theme={theme}
          />
        </div>

        {/* <div className="text-center text-gray-500 text-sm mb-8">
          Dashboard powered by Apache ECharts • Data auto-updates
        </div> */}
      </div>
    </div>
  );
}
