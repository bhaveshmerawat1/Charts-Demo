"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TableCardProps {
  title: string;
  tabs: Array<{ label: string; value: string }>;
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' }>;
  data: Array<Record<string, any>>;
  onRowClick?: (item: any) => void;
  defaultTab?: string;
}

export default function TableCard({ title, tabs, columns, data, onRowClick, defaultTab }: TableCardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || '');
  
  // Update activeTab when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const formatNumber = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(2)} Cr`;
    }
    if (value >= 100000) {
      return `${(value / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                // Trigger parent component update if needed
                if (onRowClick && typeof (window as any).onTabChange === 'function') {
                  (window as any).onTabChange(tab.value);
                }
              }}
              className={`text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                    col.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {col.label.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm ${
                      col.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {col.key === 'name' ? (
                      <Link
                        href={`/stocks/${row.symbol}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {row[col.key]}
                      </Link>
                    ) : col.key === 'volume' || col.key === 'value' ? (
                      <span className="text-gray-900 dark:text-gray-100">
                        {formatNumber(row[col.key])}
                      </span>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">{row[col.key]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
