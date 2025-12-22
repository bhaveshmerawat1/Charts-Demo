"use client";

import { useState } from "react";
import GlobalHighchart from "@/components/Charts/HighCharts/GlobalHighchart";
import { registryData, drilldownSeriesData } from "@/components/Charts/HighCharts/registryData";
import { CHART_TYPES, ChartType } from "@/components/Charts/HighCharts/types";
import userData from "../../utils/userData.json"
import Button from "@/components/Button/Button";

export default function HighCharts() {
  // State to manage selected chart type
  const [chartType, setChartType] = useState<ChartType>("line");

  // Get chart configuration from registry
  const config = registryData.usersByRole;

  const seriesData: Highcharts.SeriesOptionsType[] = [
    {
      type: chartType,
      name: "Users",
      data: [
        { name: "Admin", y: 150, drilldown: "Admin-details" },
        { name: "Manager", y: 300, drilldown: "Manager-details" },
        { name: "Customer", y: 600, drilldown: "Customer-details" }
      ]
    }
  ]

  return (
    <div className="container mx-auto p-2">
      <div className="w-full pt-5 pb-5">
        <h1 className="text-2xl font-bold text-center">Highcharts Example: Users by Role</h1>
      </div>
      <div className="w-full flex">
        <div className="mb-4 gap-2 w-1/2">
          {/* Chart Type Selector */}
          <select
            className="border border-blue-600 bg-white rounded-sm bg-white hover:bg-blue-600 hover:text-white text-blue-600 transition duration-200 ease-in-out cursor-pointer px-3 py-2 outline-none w-[120px] flex justify-center"
            value={chartType} // Bind selected value to state
            onChange={(e) => setChartType(e.target.value as ChartType)} // Update chart type on selection
          >
            {CHART_TYPES.map((type) => (
              <option className="text-sm cursor-pointer text-blue-600 pl-2 pr-2 bg-white hover:bg-blue-600 hover:text-white"
                key={type} // Use chart type as key
                value={type} // Set option value
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {/* Render GlobalHighchart with selected type and config */}
          <GlobalHighchart
            type={chartType} // Use selected chart type
            title={config.title} // Dynamic title from config
            categories={["Admin", "Manager", "Customer"]} // Static categories for xAxis
            yAxisTitle={config.yAxisTitle} // Dynamic yAxis title from config
            height={400} // Fixed height  
            theme="light" // Fixed theme
            series={seriesData}
            drilldownSeries={drilldownSeriesData} // Dynamic drilldown series from config
          />
        </div>
        <div className="mb-4 gap-2 w-1/2">
          <div className="mt-2 mb-2 flex items-center gap-2">
            <Button
              variant="secondary"
            >
              Clear annotations
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
