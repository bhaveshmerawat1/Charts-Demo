"use client";

import React, { useMemo } from 'react';
import { useStock } from '@/contexts/StockContext';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StockKPICards: React.FC = () => {
  const { stockQuote, activeStocks, selectedStock } = useStock();

  // Calculate top gainer and loser from active stocks
  const { topGainer, topLoser } = useMemo(() => {
    if (activeStocks.length === 0) {
      return { topGainer: null, topLoser: null };
    }

    const sortedByChange = [...activeStocks].sort((a, b) => b.changePercent - a.changePercent);
    return {
      topGainer: sortedByChange[0],
      topLoser: sortedByChange[sortedByChange.length - 1]
    };
  }, [activeStocks]);

  const cards = [
    ...(selectedStock ? [
      {
        title: '52 Week High',
        value: stockQuote?.fifty_two_week?.high
          ? `$${Number(stockQuote.fifty_two_week.high).toFixed(2)}`
          : 'Select Stock',
        icon: <FiTrendingUp className="w-6 h-6" />,
        trend: 'up' as const,
      },
      {
        title: '52 Week Low',
        value: stockQuote?.fifty_two_week?.low
          ? `$${Number(stockQuote.fifty_two_week.low).toFixed(2)}`
          : 'Select Stock',
        icon: <FiTrendingDown className="w-6 h-6" />,
        trend: 'down' as const,
      },
    ] : []),
    {
      title: 'Top Gainer',
      value: topGainer
        ? `${topGainer.symbol} +${topGainer.changePercent.toFixed(2)}%`
        : 'Loading...',
      icon: <FiTrendingUp className="w-6 h-6" />,
      trend: 'up' as const,
    },
    {
      title: 'Top Loser',
      value: topLoser
        ? `${topLoser.symbol} ${topLoser.changePercent.toFixed(2)}%`
        : 'Loading...',
      icon: <FiTrendingDown className="w-6 h-6" />,
      trend: 'down' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{card.title}</span>
            <div className={`
              ${card.trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'}
            `}>
              {card.icon}
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockKPICards;
