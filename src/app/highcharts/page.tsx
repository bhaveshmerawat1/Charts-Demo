"use client";

import { useState } from "react";
import GlobalHighchart from "@/components/Charts/HighCharts/GlobalHighchart";
import { registryData, drilldownSeriesData } from "@/components/Charts/HighCharts/registryData";
import { CHART_TYPES } from "@/components/Charts/HighCharts/types";
import Dashboard from "@/components/SubComponents/Dashboard/Dashboard";
import SelectDropdown from "@/components/SelectDropdown/SelectDropdown";

export default function HighCharts() {
  // State to manage selected chart type
  const [chartType, setChartType] = useState("area");

  // Get chart configuration from registry
  const config = registryData.usersByRole;

  const seriesData: Highcharts.SeriesOptionsType[] = [
    {
      type: chartType as any,
      name: "Users",
      data: [
        { name: "Admin", y: 150, drilldown: "Admin-details" },
        { name: "Manager", y: 300, drilldown: "Manager-details" },
        { name: "Customer", y: 600, drilldown: "Customer-details" }
      ]
    }
  ];


  return (
    <div className="w-full bg-gray-100">
      <div className="container mx-auto p-2">
        <div className="w-full pt-5 pb-5">
          <Dashboard />
        </div>
        <div className="w-full bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Chart Type Selector */}
            <SelectDropdown label="Chart Type" value={chartType} onChange={setChartType} options={CHART_TYPES} />
          </div>
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
            optionsOverride={{
              xAxis: {
                type: "category",
                labels: {
                  useHTML: true,
                  formatter() {
                    const map: Record<string, string> = {
                      Admin: "#dc2626",
                      Manager: "#2563eb",
                      Customer: "#16a34a"
                    };

                    return `<span style="color:${map[this.value] || "#e60009"}">
                    ${this.value}
                    </span>`;
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div >
  );
}
