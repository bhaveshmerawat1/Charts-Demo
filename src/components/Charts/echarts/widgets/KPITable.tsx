/**
 * KPI Table Widget
 * Displays key performance indicators in a table format
 */

"use client";

import React from "react";
import type { DashboardApiResponse, Theme } from "@/types/dashboard";

interface KPITableProps {
  data: DashboardApiResponse["kpiWidgets"];
  theme: Theme;
}

export function KPITable({ data, theme }: KPITableProps) {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const textSecondaryColor = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
      <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Key Performance Indicators</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 font-semibold ${textSecondaryColor}`}>Metric</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondaryColor}`}>Current</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondaryColor}`}>Target</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondaryColor}`}>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <td className={`py-3 px-4 ${textColor}`}>Conversion Rate</td>
              <td className={`text-right py-3 px-4 font-medium ${textColor}`}>
                {data.conversionRate.value.toFixed(1)}%
              </td>
              <td className={`text-right py-3 px-4 ${textSecondaryColor}`}>
                {data.conversionRate.target.toFixed(1)}%
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(100, (data.conversionRate.value / data.conversionRate.target) * 100)}%`
                      }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${textSecondaryColor} w-12 text-right`}>
                    {Math.round((data.conversionRate.value / data.conversionRate.target) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <td className={`py-3 px-4 ${textColor}`}>Order Success Rate</td>
              <td className={`text-right py-3 px-4 font-medium ${textColor}`}>
                {data.orderSuccessRate.value.toFixed(1)}%
              </td>
              <td className={`text-right py-3 px-4 ${textSecondaryColor}`}>
                {data.orderSuccessRate.target.toFixed(1)}%
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{
                        width: `${Math.min(100, (data.orderSuccessRate.value / data.orderSuccessRate.target) * 100)}%`
                      }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${textSecondaryColor} w-12 text-right`}>
                    {Math.round((data.orderSuccessRate.value / data.orderSuccessRate.target) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td className={`py-3 px-4 ${textColor}`}>Daily Target</td>
              <td className={`text-right py-3 px-4 font-medium ${textColor}`}>
                ${(data.dailyTarget.value / 1000).toFixed(0)}K
              </td>
              <td className={`text-right py-3 px-4 ${textSecondaryColor}`}>
                ${(data.dailyTarget.target / 1000).toFixed(0)}K
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{
                        width: `${Math.min(100, (data.dailyTarget.value / data.dailyTarget.target) * 100)}%`
                      }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${textSecondaryColor} w-12 text-right`}>
                    {Math.round((data.dailyTarget.value / data.dailyTarget.target) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

