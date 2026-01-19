/**
 * Live Chart Table Component
 * Displays a table with sales regions/categories and embedded live charts
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TableCellChart } from "./TableCellChart";
import type { Theme } from "@/types/dashboard";

interface RegionData {
  id: string;
  name: string;
  color: string;
}

interface RegionStats {
  currentValue: number;
  previousValue: number;
  trend: "up" | "down" | "neutral";
  trendPercentage: number;
}

const REGIONS: RegionData[] = [
  { id: "north-america", name: "North America", color: "#3b82f6" },
  { id: "europe", name: "Europe", color: "#10b981" },
  { id: "asia", name: "Asia", color: "#f59e0b" },
  { id: "online", name: "Online", color: "#8b5cf6" },
  { id: "retail", name: "Retail", color: "#ef4444" },
  { id: "wholesale", name: "Wholesale", color: "#06b6d4" },
];

export interface LiveChartTableProps {
  theme?: Theme;
  updateInterval?: number;
  maxDataPoints?: number;
}

export function LiveChartTable({
  theme = "light",
  updateInterval = 1000,
  maxDataPoints = 60,
}: LiveChartTableProps) {
  const [regionStats, setRegionStats] = useState<Record<string, RegionStats>>({});

  // Initialize stats for all regions
  useEffect(() => {
    const initialStats: Record<string, RegionStats> = {};
    REGIONS.forEach((region) => {
      initialStats[region.id] = {
        currentValue: 0,
        previousValue: 0,
        trend: "neutral",
        trendPercentage: 0,
      };
    });
    setRegionStats(initialStats);
  }, []);

  // Fetch current value for a region to calculate trend
  const updateRegionStats = useCallback(async (regionId: string) => {
    try {
      const response = await fetch(
        `/api/sales/live/region?region=${regionId}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const latestPoint = result.data[result.data.length - 1];
          const currentValue = latestPoint.revenue;

          setRegionStats((prev) => {
            const prevStats = prev[regionId] || {
              currentValue: 0,
              previousValue: 0,
              trend: "neutral" as const,
              trendPercentage: 0,
            };

            const previousValue = prevStats.currentValue || currentValue;
            const trendPercentage =
              previousValue > 0
                ? ((currentValue - previousValue) / previousValue) * 100
                : 0;
            const trend =
              trendPercentage > 0.1
                ? "up"
                : trendPercentage < -0.1
                ? "down"
                : "neutral";

            return {
              ...prev,
              [regionId]: {
                currentValue,
                previousValue,
                trend,
                trendPercentage: Math.abs(trendPercentage),
              },
            };
          });
        }
      }
    } catch (error) {
      console.error(`Error updating stats for region ${regionId}:`, error);
    }
  }, []);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      REGIONS.forEach((region) => {
        updateRegionStats(region.id);
      });
    }, updateInterval);

    // Initial update
    REGIONS.forEach((region) => {
      updateRegionStats(region.id);
    });

    return () => clearInterval(interval);
  }, [updateInterval, updateRegionStats]);

  const isDark = theme === "dark";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const textSecondaryColor = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const bgColor = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200";

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className={`rounded-xl p-6 ${bgColor} border`}>
      <h3 className={`text-lg font-medium mb-4 ${textColor}`}>
        Live Sales by Region
      </h3>
      <div className="">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${borderColor}`}>
              <th
                className={`text-left py-3 px-4 font-medium ${textSecondaryColor}`}
              >
                Region
              </th>
              <th
                className={`text-right min-w-40 py-3 px-4 font-medium ${textSecondaryColor}`}
              >
                Current Value
              </th>
              <th
                className={`text-right py-3 px-4 font-medium ${textSecondaryColor}`}
              >
                Trend
              </th>
              <th
                className={`text-left py-3 px-4 font-medium ${textSecondaryColor}`}
                style={{ minWidth: "300px" }}
              >
                Live Chart
              </th>
            </tr>
          </thead>
          <tbody>
            {REGIONS.map((region, index) => {
              const stats = regionStats[region.id] || {
                currentValue: 0,
                previousValue: 0,
                trend: "neutral" as const,
                trendPercentage: 0,
              };

              return (
                <tr
                  key={region.id}
                  className={
                    index < REGIONS.length - 1
                      ? `border-b ${borderColor}`
                      : ""
                  }
                >
                  <td className={`py-3 px-4 ${textColor} min-w-36 text-sm`}>
                    {region.name}
                  </td>
                  <td className={`text-right py-3 px-4 font-medium text-sm ${textColor}`}>
                    {formatCurrency(stats.currentValue)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {stats.trend === "up" && (
                        <>
                          <span className="text-green-600 dark:text-green-400">
                            ↑
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            +{stats.trendPercentage.toFixed(1)}%
                          </span>
                        </>
                      )}
                      {stats.trend === "down" && (
                        <>
                          <span className="text-red-600 dark:text-red-400">
                            ↓
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            -{stats.trendPercentage.toFixed(1)}%
                          </span>
                        </>
                      )}
                      {stats.trend === "neutral" && (
                        <span className={`text-sm font-medium ${textSecondaryColor}`}>
                          —
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div style={{ width: "100%", minWidth: "200px" }}>
                      <TableCellChart
                        region={region.id}
                        theme={theme}
                        height={60}
                        width="100%"
                        color={region.color}
                        updateInterval={updateInterval}
                        maxDataPoints={maxDataPoints}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

