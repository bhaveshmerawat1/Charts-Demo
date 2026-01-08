"use client";

import Highcharts from "./config";
import HighchartsReact from "highcharts-react-official";
import { useMemo } from "react";
import { CHART_TYPES } from "./types";
import { lightTheme, darkTheme } from "./themes";

// Props for GlobalHighchart component
interface HighchartWrapperProps {
  type?: (typeof CHART_TYPES)[number]; // Chart type
  title?: string; // Chart properties
  subTitle?: string // Sub title
  categories?: string[]; // Categories for xAxis
  series: Highcharts.SeriesOptionsType[]; // Data series
  yAxisTitle?: string; // yAxis title
  height?: number; // Chart height
  theme?: "light" | "dark"; // Theme selection
  drilldownSeries?: Highcharts.SeriesOptionsType[]; // Drilldown series data
  optionsOverride?: Highcharts.Options; // Options to override defaults
  styledMode?:boolean
}

// GlobalHighchart component definition
export default function HighchartWrapper({
  type = "line", // Default chart type
  title, // Chart title
  subTitle, // Sub title
  categories, // Categories for xAxis
  series, // Data series
  yAxisTitle, // yAxis title
  height = 350, // Default height
  theme = "light", // Default theme
  drilldownSeries, // Drilldown series data
  optionsOverride, // Options to override defaults
  styledMode
}: HighchartWrapperProps) {

  // Select theme configuration
  const themeConfig = theme === "dark" ? darkTheme : lightTheme; // Choose theme based on prop

  // Memoized Highcharts options
  const options = useMemo<Highcharts.Options>(() => ({
    ...themeConfig,

    chart: {
      ...themeConfig.chart,
      type, // Chart type
      height, // Chart height
      styledMode
    },

    title: {
      text: title, // Chart title
      style: {
        color: themeConfig.title?.style?.color
      }
    },
    subtitle: {
      text: subTitle,
      style: {
        color: themeConfig.subtitle?.style?.color
      }
    },

    xAxis: categories ? {
      categories,
      labels: {
        style: {
          color: themeConfig.title?.style?.color
        }
      }
    } : undefined, // xAxis categories

    yAxis: {
      title: {
        text: yAxisTitle,
        style: {
          color: themeConfig.title?.style?.color
        }
      }, // yAxis title
      labels: {
        style: {
          color: themeConfig.title?.style?.color
        }
      }
    },

    series, // Data series

    drilldown: { series: drilldownSeries }, // Ensure drilldown object exists even if series is undefined

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
    <div className={""}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate
        key={theme}
      />
    </div>

  );
}
