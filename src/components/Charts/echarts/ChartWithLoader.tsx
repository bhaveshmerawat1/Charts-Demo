"use client";

import React, { useState, useEffect } from "react";
import { Chart, type ChartProps } from "./Chart";

interface ChartWithLoaderProps extends Omit<ChartProps, "data"> {
  dataFetcher: () => Promise<any[]>;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
}

export function ChartWithLoader({
  dataFetcher,
  loadingComponent,
  errorComponent,
  theme = "light",
  ...chartProps
}: ChartWithLoaderProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await dataFetcher();
        setData(fetchedData);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataFetcher]);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-gray-400" : "text-gray-500";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className={`rounded-xl p-6 border ${bgColor} ${borderColor} ${chartProps.className || ""}`}>
        <div className="flex items-center justify-center" style={{ height: chartProps.chartHeight || 350 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className={`text-sm ${textColor}`}>Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent(error)}</>;
    }
    return (
      <div className={`rounded-xl p-6 border ${bgColor} ${borderColor} ${chartProps.className || ""}`}>
        <div className="flex items-center justify-center" style={{ height: chartProps.chartHeight || 350 }}>
          <div className="text-center">
            <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"} mb-2`}>{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                dataFetcher()
                  .then(setData)
                  .catch((err) => setError(err instanceof Error ? err.message : "Failed to load data"))
                  .finally(() => setLoading(false));
              }}
              className={`px-3 py-1 text-xs rounded ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Chart {...chartProps} data={data} theme={theme} />;
}

