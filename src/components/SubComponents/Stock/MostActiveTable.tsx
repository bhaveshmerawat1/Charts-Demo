"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MostActiveTableProps {
  activeTab: 'volume' | 'value';
  onTabChange: (tab: 'volume' | 'value') => void;
  volumeData: Array<{ symbol: string; name: string; volume: number; value: number }>;
  valueData: Array<{ symbol: string; name: string; volume: number; value: number }>;
  onRowClick: (symbol: string) => void;
}

export default function MostActiveTable({
  activeTab,
  onTabChange,
  volumeData,
  valueData,
  onRowClick,
}: MostActiveTableProps) {
  const [currentTab, setCurrentTab] = useState<'volume' | 'value'>(activeTab);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

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

  const currentData = currentTab === 'volume' ? volumeData : valueData;
  const columnKey = currentTab === 'volume' ? 'volume' : 'value';
  const columnLabel = currentTab === 'volume' ? 'Volume' : 'Value Cr.';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Most Active Stocks</h3>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setCurrentTab('volume');
              onTabChange('volume');
            }}
            className={`text-sm font-medium transition-colors ${
              currentTab === 'volume'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => {
              setCurrentTab('value');
              onTabChange('value');
            }}
            className={`text-sm font-medium transition-colors ${
              currentTab === 'value'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Value
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                COMPANY
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                {columnLabel.toUpperCase()}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => onRowClick(row.symbol)}
              >
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/stocks/${row.symbol}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                  {formatNumber(row[columnKey])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

