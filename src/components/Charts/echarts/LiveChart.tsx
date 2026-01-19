"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chart, type ChartProps } from "./Chart";
import clsx from "clsx";
import type { EChartsOption } from "echarts";

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

export interface LiveChartProps extends Omit<ChartProps, "data"> {
  apiEndpoint?: string;
  updateInterval?: number; // in milliseconds
  maxDataPoints?: number; // maximum number of data points to keep
  showLiveIndicator?: boolean;
  onError?: (error: Error) => void;
}

export function LiveChart({
  apiEndpoint = "/api/sales/live",
  updateInterval = 1000,
  maxDataPoints = 120,
  showLiveIndicator = true,
  onError,
  theme = "light",
  ...chartProps
}: LiveChartProps) {
  const [data, setData] = useState<LiveSalesDataPoint[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const isInitialLoadRef = useRef(true);

  const fetchLiveData = useCallback(async (isInitial: boolean = false) => {
    if (!isMountedRef.current) return;

    try {
      const url = isInitial ? `${apiEndpoint}?initial=true` : apiEndpoint;
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
            // On initial load, replace with all historical data points
            return result.data;
          } else {
            // On subsequent updates, add new data points
            const updatedData = [...prevData, ...result.data];
            
            // Keep only the last maxDataPoints entries
            if (updatedData.length > maxDataPoints) {
              return updatedData.slice(-maxDataPoints);
            }
            
            return updatedData;
          }
        });

        setLastUpdate(new Date());
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
  }, [apiEndpoint, maxDataPoints, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch with historical data
    if (isInitialLoadRef.current) {
      fetchLiveData(true);
      isInitialLoadRef.current = false;
    }

    // Set up polling interval
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchLiveData(false);
      }, updateInterval);
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLive, updateInterval, fetchLiveData]);

  // Format data for Chart component - memoized to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return data.map((point) => {
      const date = new Date(point.timestamp);
      // Format as HH:MM:SS for live chart
      const timeString = date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      return {
        date: timeString,
        timestamp: point.timestamp,
        revenue: point.revenue,
        sales: point.sales,
        orders: point.orders,
      };
    });
  }, [data]);

  const isDark = theme === "dark";
  const textColor = isDark ? "text-gray-400" : "text-gray-500";
  const liveIndicatorColor = isDark ? "bg-red-500" : "bg-red-600";

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdate) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdate.toLocaleTimeString();
  };

  return (
    <div className="relative" style={{ minHeight: chartProps.chartHeight || 400 }}>
      {/* Fixed header area to prevent layout shifts */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none" style={{ height: '60px' }}>
        {showLiveIndicator && (
          <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border"
              style={{
                backgroundColor: isDark ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
                borderColor: isDark ? "rgba(75, 85, 99, 0.5)" : "rgba(229, 231, 235, 0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              {isLive && (
                <>
                  <div className="relative flex-shrink-0">
                    <div className={clsx("w-2 h-2 rounded-full", liveIndicatorColor)} />
                    <div
                      className={clsx(
                        "absolute inset-0 rounded-full animate-ping",
                        liveIndicatorColor,
                        "opacity-75"
                      )}
                      style={{ animationDuration: '2s' }}
                    />
                  </div>
                  <span className={clsx("text-xs font-semibold whitespace-nowrap", isDark ? "text-gray-200" : "text-gray-800")}>
                    LIVE
                  </span>
                </>
              )}
              {!isLive && (
                <span className={clsx("text-xs font-medium whitespace-nowrap", textColor)}>
                  PAUSED
                </span>
              )}
            </div>
            {lastUpdate && (
              <div
                className={clsx(
                  "px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg border",
                  isDark ? "bg-gray-800 text-gray-400 border-gray-700" : "bg-gray-100 text-gray-600 border-gray-200"
                )}
              >
                {formatLastUpdate()}
              </div>
            )}
            <button
              onClick={() => setIsLive(!isLive)}
              className={clsx(
                "px-2.5 py-1.5 rounded text-xs font-medium transition-all shadow-lg border flex-shrink-0",
                isLive
                  ? isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
                  : isDark
                  ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-700"
                  : "bg-blue-600 text-white hover:bg-blue-700 border-blue-700"
              )}
              title={isLive ? "Pause updates" : "Resume updates"}
            >
              {isLive ? "⏸" : "▶"}
            </button>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 pointer-events-auto">
            <div
              className={clsx(
                "px-3 py-2 rounded-lg text-sm shadow-lg border",
                isDark ? "bg-red-900 text-red-200 border-red-800" : "bg-red-100 text-red-800 border-red-200"
              )}
            >
              Error: {error}
            </div>
          </div>
        )}
      </div>

      {/* Chart area with stable dimensions */}
      <div style={{ paddingTop: showLiveIndicator ? '60px' : '0' }}>
        {isLoading && data.length === 0 ? (
          <div
            className={clsx(
              "rounded-xl p-6",
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-slate-200"
            )}
            style={{ minHeight: chartProps.chartHeight || 400 }}
          >
            <div className="flex items-center justify-center" style={{ height: chartProps.chartHeight || 400 }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className={clsx("text-sm", textColor)}>Connecting to live data...</p>
              </div>
            </div>
          </div>
        ) : (
          <Chart
            {...chartProps}
            data={chartData}
            theme={theme}
            overrideOption={{
              animation: true,
              animationDuration: 500,
              animationEasing: 'cubicOut',
              animationDelay: 0,
              // Ensure smooth transitions
              ...(chartProps.overrideOption || {}),
            } as EChartsOption}
          />
        )}
      </div>
    </div>
  );
}

