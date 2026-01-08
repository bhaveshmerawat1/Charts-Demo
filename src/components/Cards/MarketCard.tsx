import React from 'react';
import Link from 'next/link';

interface MarketCardProps {
  title: string;
  items: Array<{
    symbol: string;
    name: string;
    price: number;
    change?: number;
    change_percent?: number;
    day_high?: number;
    day_low?: number;
    week_high_52?: number;
    week_low_52?: number;
  }>;
  type: 'gainers' | 'losers' | 'high' | 'low';
  onItemClick?: (symbol: string) => void;
}

export default function MarketCard({ title, items, type, onItemClick }: MarketCardProps) {
  const getChangeColor = (change: number) => {
    if (type === 'gainers' || change > 0) return 'text-green-600 dark:text-green-400';
    if (type === 'losers' || change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.slice(0, 10).map((item, index) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer rounded px-2"
            onClick={() => onItemClick?.(item.symbol)}
          >
            <div className="flex-1 min-w-0">
              <Link
                href={`/stocks/${item.symbol}`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium truncate block"
              >
                {item.name}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.symbol}</p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                ₹{formatPrice(item.price)}
              </p>
              {item.change !== undefined && item.change_percent !== undefined && (
                <p className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                  {item.change > 0 ? '+' : ''}
                  {item.change_percent.toFixed(2)}%
                </p>
              )}
              {item.day_high !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  High: ₹{formatPrice(item.day_high)}
                </p>
              )}
              {item.day_low !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Low: ₹{formatPrice(item.day_low)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
