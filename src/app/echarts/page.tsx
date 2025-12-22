"use client";

import React from "react";
import userData from "@/utils/echarts/userData.json";
import dashboardData from "@/utils/echarts/dashboardData.json";
import { KPICard } from "@/components/echarts/KPICard";
import { Chart } from "@/components/echarts/Chart";
import type { DrillDownData } from "@/components/echarts/Chart";
import { transformScatterData } from "@/utils/echarts/dataTransformers";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export default function DashboardPage() {
  /* ---------------- KPI Cards ---------------- */
  const kpiCards: KPICardProps[] = [
    {
      label: "Total Revenue",
      value: `$${(dashboardData.totalRevenue / 1000000).toFixed(2)}M`,
      change: `+${dashboardData.revenueGrowth}%`,
      trend: "up",
    },
    {
      label: "Total Orders",
      value: dashboardData.totalOrders.toLocaleString(),
      change: "+12.5%",
      trend: "up",
    },
    {
      label: "Active Users",
      value: userData.activeUsers.toLocaleString(),
      change: `+${userData.userGrowthRate}%`,
      trend: "up",
    },
    {
      label: "Conversion Rate",
      value: `${dashboardData.conversionRate}%`,
      change: "+0.8%",
      trend: "up",
    },
  ];

  /* ---------------- Drill-down Data Preparation ---------------- */
  const drillDownData: Record<string, DrillDownData> = {};
  dashboardData.salesByCategory.forEach((category) => {
    drillDownData[category.category] = {
      name: category.category,
      data: category.products,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-light text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive business intelligence and performance metrics
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>

        {/* USER ANALYTICS */}
        <h2 className="text-2xl font-light mb-4 text-gray-800">User Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 1. Bar Chart: Users by Role */}
          <Chart
            title="User Distribution by Role"
            subtitle="Breakdown of users across roles"
            cardVariant="elevated"
            data={userData.usersByRole}
            xKey="role"
            series={[{ type: "bar", dataKey: "count", name: "Users" }]}
            chartHeight={400}
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]}
          />

          {/* 2. Pie Chart: Users by Region */}
          <Chart
            title="Global User Distribution"
            cardVariant="elevated"
            headerAlign="center"
            data={userData.usersByRegion}
            nameKey="region"
            valueKey="users"
            series={[{ type: "pie", name: "Users" }]}
            chartHeight={400}
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]}
          />
        </div>

        {/* 3. Line Chart: User Activity */}
        <Chart
          title="User Activity Throughout the Day"
          cardVariant="elevated"
          className="mb-8"
          data={userData.userActivityByHour}
          xKey="hour"
          series={[
            { type: "line", dataKey: "active", name: "Active Users", area: true },
          ]}
          chartHeight={350}
          colors={["#3b82f6"]}
        />

        {/* SALES SECTION */}
        <h2 className="text-2xl font-light mb-4 text-gray-800">
          Sales & Revenue Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 4. Bar Chart with Drill-down: Revenue by Category */}
          <Chart
            title="Revenue by Category"
            subtitle="Click any category to drill down"
            cardVariant="elevated"
            data={dashboardData.salesByCategory}
            xKey="category"
            series={[{ type: "bar", dataKey: "revenue", name: "Revenue" }]}
            chartHeight={400}
            enableDrillDown={true}
            drillDownData={drillDownData}
            colors={["#8b5cf6"]}
          />

          {/* 5. Scatter Chart: Revenue vs Orders */}
          <Chart
            title="Revenue vs Orders Correlation"
            subtitle="Relationship between revenue and order volume"
            cardVariant="elevated"
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
            chartHeight={400}
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
          />
        </div>

        {/* 6. Radar Chart: Performance Metrics */}
        <Chart
          title="Multi-Dimensional Performance Metrics"
          subtitle="Overall business performance across key dimensions"
          cardVariant="elevated"
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
          chartHeight={400}
          colors={["#10b981"]}
        />

        {/* Monthly Line Chart */}
        <Chart
          title="Revenue vs Target Trend"
          cardVariant="elevated"
          className="mb-8"
          data={dashboardData.monthlySales}
          xKey="month"
          series={[
            { type: "line", dataKey: "revenue", name: "Revenue", area: true },
            { type: "line", dataKey: "target", name: "Target" },
          ]}
          chartHeight={400}
          colors={["#3b82f6", "#f59e0b"]}
        />

        {/* PERFORMANCE METRICS */}
        <h2 className="text-2xl font-light mb-4 text-gray-800">
          Performance Metrics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie: Order Status */}
          <Chart
            title="Order Status Distribution"
            cardVariant="elevated"
            data={dashboardData.ordersByStatus}
            nameKey="status"
            valueKey="count"
            series={[{ type: "pie", name: "Orders" }]}
            chartHeight={400}
            colors={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]}
          />

          {/* Bar: Revenue Channels */}
          <Chart
            title="Revenue by Marketing Channel"
            cardVariant="elevated"
            data={dashboardData.revenueByChannel}
            xKey="channel"
            series={[{ type: "bar", dataKey: "revenue", name: "Revenue" }]}
            chartHeight={400}
            colors={["#8b5cf6"]}
          />
        </div>

        {/* ADDITIONAL CHARTS WITH DIFFERENT UI */}
        <h2 className="text-2xl font-light mb-4 text-gray-800">
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
            chartHeight={400}
            overrideOption={{
              xAxis: { type: "value" },
              yAxis: { type: "category", data: dashboardData.revenueByChannel.map((d) => d.channel) },
            }}
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]}
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
            chartHeight={400}
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
            colors={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]}
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
          chartHeight={400}
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
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 10. Scatter Chart with Different Markers (Different Visual) */}
          <Chart
            title="Revenue vs Orders (Enhanced Scatter)"
            subtitle="Scatter chart with rounded markers and shadows"
            cardVariant="elevated"
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
            chartHeight={400}
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
            chartHeight={400}
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
          />
        </div>

        {/* 12. Stacked Bar Chart (Different Layout) */}
        <Chart
          title="Monthly Revenue & Orders (Stacked)"
          subtitle="Stacked bar chart with rounded corners"
          cardVariant="elevated"
          className="mb-8"
          data={dashboardData.monthlySales}
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
          chartHeight={400}
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
        />

        <div className="text-center text-gray-500 text-sm mb-8">
          Dashboard powered by Apache ECharts • Data auto-updates
        </div>
      </div>
    </div>
  );
}
