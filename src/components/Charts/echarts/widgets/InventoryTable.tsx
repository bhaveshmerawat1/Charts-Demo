/**
 * Inventory Table Widget
 * Displays inventory stock status in a table format
 */

"use client";

import React from "react";
import type { ProductsApiResponse, Theme } from "@/types/dashboard";

interface InventoryTableProps {
  data: ProductsApiResponse["inventoryStockStatus"];
  theme: Theme;
  limit?: number;
}

export function InventoryTable({ data, theme, limit = 5 }: InventoryTableProps) {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const textSecondaryColor = isDark ? "text-gray-400" : "text-gray-600";
  const displayData = data.slice(0, limit);

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
      <h3 className={`text-lg font-medium mb-4 ${textColor}`}>Inventory Stock Status</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 font-semibold ${textSecondaryColor}`}>Product</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondaryColor}`}>Stock Level</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondaryColor}`}>Status</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondaryColor}`}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => {
              const statusColor = item.status === "out_of_stock" ? "bg-red-500" : item.status === "low_stock" ? "bg-yellow-500" : "bg-green-500";
              const statusText = item.status === "out_of_stock" ? "Out of Stock" : item.status === "low_stock" ? "Low Stock" : "In Stock";
              return (
                <tr key={index} className={`${index < displayData.length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}`}>
                  <td className={`py-3 px-4 ${textColor}`}>{item.product}</td>
                  <td className={`text-right py-3 px-4 font-medium ${textColor}`}>
                    {item.stockLevel} ({item.stockPercentage.toFixed(0)}%)
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === "out_of_stock" 
                        ? (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                        : item.status === "low_stock"
                        ? (isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                        : (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                    }`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full ${statusColor}`}
                          style={{
                            width: `${Math.min(100, item.stockPercentage)}%`
                          }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${textSecondaryColor} w-12 text-right`}>
                        {item.stockPercentage.toFixed(0)}%
                      </span>
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

