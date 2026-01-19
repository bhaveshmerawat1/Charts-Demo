"use client";

import React from 'react';
import { useStock, type ActiveStock } from '@/contexts/StockContext';

const MostActiveStocks: React.FC = () => {
  const { activeStocks, selectedStock, setSelectedStock, isLoadingActiveStocks } = useStock();

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
  };

  if (isLoadingActiveStocks) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Most Active Stocks</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Most Active Stocks</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
            Volume
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-gray-700">
                COMPANY
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-gray-700">
                VOLUME
              </th>
            </tr>
          </thead>
          <tbody>
            {activeStocks.map((stock: ActiveStock, index: number) => (
              <tr
                key={stock.symbol}
                onClick={() => handleStockClick(stock.symbol)}
                className={`
                  border-b border-gray-100 dark:border-gray-700 
                  cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 
                  transition-colors
                  ${selectedStock === stock.symbol ? 'bg-blue-100 dark:bg-gray-700' : ''}
                `}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {stock.name || stock.symbol}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {stock.volume.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MostActiveStocks;
