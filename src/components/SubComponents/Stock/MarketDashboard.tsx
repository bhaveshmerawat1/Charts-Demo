"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStock } from '@/contexts/StockContext';
import MarketCard from '@/components/Cards/MarketCard';
import MostActiveTable from './MostActiveTable';
import { useTheme } from '@/contexts/ThemeContext';

export default function MarketDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    topGainers,
    topLosers,
    week52High,
    week52Low,
    mostActiveByVolume,
    mostActiveByValue,
    loading,
    error,
  } = useStock();

  const [activeTab, setActiveTab] = useState<'volume' | 'value'>('value');

  const handleStockClick = (symbol: string) => {
    console.log("handleStockClick ===========", symbol)
    router.push(`/stocks/${symbol}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Market Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track stock market indices and its companies
          </p>
        </div>
      </div>

      {/* Market Movers Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Market Movers
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <MarketCard
            title="Today's Gainers"
            items={topGainers.map((g) => ({
              symbol: g.symbol,
              name: g.name,
              price: g.price,
              change: g.change,
              change_percent: g.change_percent,
            }))}
            type="gainers"
            onItemClick={handleStockClick}
          />

          {/* Top Losers */}
          <MarketCard
            title="Today's Losers"
            items={topLosers.map((l) => ({
              symbol: l.symbol,
              name: l.name,
              price: l.price,
              change: l.change,
              change_percent: l.change_percent,
            }))}
            type="losers"
            onItemClick={handleStockClick}
          />
        </div>
      </div>

      {/* 52 Week High/Low Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          52 Week High / Low
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 52 Week High */}
          <MarketCard
            title="52 Week High"
            items={week52High.map((h) => ({
              symbol: h.symbol,
              name: h.name,
              price: h.price,
              day_high: h.day_high,
              week_high_52: h.week_high_52,
            }))}
            type="high"
            onItemClick={handleStockClick}
          />

          {/* 52 Week Low */}
          <MarketCard
            title="52 Week Low"
            items={week52Low.map((l) => ({
              symbol: l.symbol,
              name: l.name,
              price: l.price,
              day_low: l.day_low,
              week_low_52: l.week_low_52,
            }))}
            type="low"
            onItemClick={handleStockClick}
          />
        </div>
      </div>

      {/* Most Active Stocks */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Most Active Stocks
        </h2>
        <MostActiveTable
          activeTab={activeTab}
          onTabChange={setActiveTab}
          volumeData={mostActiveByVolume}
          valueData={mostActiveByValue}
          onRowClick={handleStockClick}
        />
      </div>
    </div>
  );
}
