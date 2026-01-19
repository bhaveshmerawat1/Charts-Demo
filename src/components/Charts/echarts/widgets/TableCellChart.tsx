/**
 * Table Cell Chart Component
 * A compact live chart component optimized for rendering in table cells
 */

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { Theme } from "@/types/dashboard";

interface LiveSalesDataPoint {
  timestamp: string;
  revenue: number;
  sales: number;
  orders: number;
}

interface LiveSalesResponse {
  data: LiveSalesDataPoint[];
  lastUpdate: string;
}

export interface TableCellChartProps {
  region: string;
  apiEndpoint?: string;
  updateInterval?: number; // in milliseconds
  maxDataPoints?: number; // maximum number of data points to keep
  theme?: Theme;
  height?: number | string;
  width?: number | string;
  color?: string;
  onError?: (error: Error) => void;
}

export function TableCellChart({
  region,
  apiEndpoint = "/api/sales/live/region",
  updateInterval = 1000,
  maxDataPoints = 60,
  theme = "light",
  height = 120,
  width = "100%",
  color = "#3b82f6",
  onError,
}: TableCellChartProps) {
  const [data, setData] = useState<LiveSalesDataPoint[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isInitialLoadRef = useRef(true);

  const fetchLiveData = useCallback(async (isInitial: boolean = false) => {
    if (!isMountedRef.current) return;

    try {
      const url = isInitial
        ? `${apiEndpoint}?initial=true&region=${region}`
        : `${apiEndpoint}?region=${region}`;
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch live data: ${response.statusText}`);
      }

      const result: LiveSalesResponse = await response.json();

      if (!isMountedRef.current) return;

      if (result.data && result.data.length > 0) {
        setData((prevData) => {
          if (isInitial) {
            return result.data;
          } else {
            const updatedData = [...prevData, ...result.data];
            if (updatedData.length > maxDataPoints) {
              return updatedData.slice(-maxDataPoints);
            }
            return updatedData;
          }
        });

        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error("Failed to fetch live data");
      setError(error.message);
      setIsLoading(false);

      if (onError) {
        onError(error);
      }

      console.error("Error fetching live data:", error);
    }
  }, [apiEndpoint, region, maxDataPoints, onError]);

  useEffect(() => {
    isMountedRef.current = true;

    if (isInitialLoadRef.current) {
      fetchLiveData(true);
      isInitialLoadRef.current = false;
    }

    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchLiveData(false);
      }, updateInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLive, updateInterval, fetchLiveData]);

  // Format data for chart - memoized to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return data.map((point) => {
      const date = new Date(point.timestamp);
      const timeString = date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return {
        date: timeString,
        timestamp: point.timestamp,
        revenue: point.revenue,
      };
    });
  }, [data]);

  const isDark = theme === "dark";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const backgroundColor = "transparent";

  // Build ECharts option
  const chartOption: EChartsOption = useMemo(() => {
    return {
      backgroundColor: backgroundColor,
      grid: {
        left: "5%",
        right: "5%",
        top: "10%",
        bottom: "10%",
        containLabel: false,
      },
      xAxis: {
        type: "category",
        data: chartData.map((d) => d.date),
        show: false, // Hide x-axis labels for compact view
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        show: false, // Hide y-axis labels for compact view
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          type: "line",
          data: chartData.map((d) => d.revenue),
          smooth: true,
          symbol: "none",
          lineStyle: {
            color: color,
            width: 2,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: color + "40", // 25% opacity
                },
                {
                  offset: 1,
                  color: color + "00", // 0% opacity
                },
              ],
            },
          },
          animation: true,
          animationDuration: 500,
          animationEasing: "cubicOut",
        },
      ],
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
        borderColor: gridColor,
        textStyle: {
          color: isDark ? "#e5e7eb" : "#111827",
        },
        formatter: (params: any) => {
          if (Array.isArray(params) && params.length > 0) {
            const param = params[0];
            return `${param.name}<br/>${param.seriesName}: $${param.value.toFixed(2)}`;
          }
          return "";
        },
      },
    };
  }, [chartData, color, isDark, gridColor]);

  if (isLoading && data.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height, width }}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center text-xs text-red-500"
        style={{ height, width }}
      >
        Error
      </div>
    );
  }

  return (
    <div style={{ height, width }}>
      <ReactECharts
        option={chartOption}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "svg", height: typeof height === "number" ? height : undefined }}
      />
    </div>
  );
}

