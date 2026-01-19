/**
 * Chart Loader Component
 * Reusable loading state component for charts
 */

"use client";

import React from "react";
import type { Theme } from "@/types/dashboard";

interface ChartLoaderProps {
  title?: string;
  subtitle?: string;
  cardVariant?: "plain" | "elevated" | "gradient" | "bordered";
  theme?: Theme;
  height?: number | string;
  className?: string;
}

export function ChartLoader({
  title,
  subtitle,
  cardVariant = "bordered",
  theme = "light",
  height = 350,
  className,
}: ChartLoaderProps) {
  const isDark = theme === "dark";
  const baseCard = "rounded-xl p-6 transition-shadow duration-200";
  const variantClass =
    cardVariant === "plain"
      ? isDark ? "bg-gray-800" : "bg-white"
      : cardVariant === "elevated"
        ? isDark ? "bg-gray-800 shadow-lg hover:shadow-xl" : "bg-white shadow-lg hover:shadow-xl"
        : cardVariant === "gradient"
          ? isDark ? "bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl" : "bg-gradient-to-br from-white to-slate-50 shadow-lg hover:shadow-xl"
          : isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-slate-200";
  const titleColorClass = isDark ? "text-gray-100" : "text-gray-800";
  const subtitleColorClass = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`${baseCard} ${variantClass} ${className || ""}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className={`text-lg font-sans font-medium ${titleColorClass}`}>{title}</h3>}
          {subtitle && <p className={`text-sm font-sans ${subtitleColorClass}`}>{subtitle}</p>}
        </div>
      )}
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading chart data...</p>
        </div>
      </div>
    </div>
  );
}

