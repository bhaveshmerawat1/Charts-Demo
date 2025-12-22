"use client";

import Highcharts from "./config";
import HighchartsReact from "highcharts-react-official";
import { useMemo } from "react";
import { ChartType } from "./types";
import { lightTheme, darkTheme } from "./themes";

// Props for GlobalHighchart component
interface GlobalHighchartProps {
  type?: ChartType; // Chart type
  title?: string; // Chart properties
  categories?: string[]; // Categories for xAxis
  series: Highcharts.SeriesOptionsType[]; // Data series
  yAxisTitle?: string; // yAxis title
  height?: number; // Chart height
  theme?: "light" | "dark"; // Theme selection
  drilldownSeries?: Highcharts.SeriesOptionsType[]; // Drilldown series data
  optionsOverride?: Highcharts.Options; // Options to override defaults
}

// GlobalHighchart component definition
export default function GlobalHighchart({
  type = "line", // Default chart type
  title, // Chart title
  categories, // Categories for xAxis
  series, // Data series
  yAxisTitle, // yAxis title
  height = 350, // Default height
  theme = "light", // Default theme
  drilldownSeries, // Drilldown series data
  optionsOverride // Options to override defaults
}: GlobalHighchartProps) {

  // Select theme configuration
  const themeConfig = theme === "dark" ? darkTheme : lightTheme; // Choose theme based on prop

  // Memoized Highcharts options
  const options = useMemo<Highcharts.Options>(() => ({
    ...themeConfig,

    chart: {
      type, // Chart type
      height // Chart height
    },

    title: {
      text: title, // Chart title
    },

    xAxis: categories ? { categories } : undefined, // xAxis categories

    yAxis: {
      title: { text: yAxisTitle }, // yAxis title
    },

    series, // Data series

    drilldown: drilldownSeries  // Include drilldown configuration
      ? { series: drilldownSeries }
      : undefined, // Drilldown series if provided

    accessibility: { // Accessibility settings
      enabled: true,
      description: title
    },

    exporting: {
      enabled: true // Set this to true to enable export features, such as showing the hamburger menu list on the right side.
    },

    credits: { enabled: false }, // Disable Highcharts credits like "Highcharts.com" text

    ...optionsOverride
  }), [
    type,
    height,
    title,
    categories,
    series,
    yAxisTitle,
    drilldownSeries,
    themeConfig,
    optionsOverride
  ]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      allowChartUpdate
    />
  );
}
