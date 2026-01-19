"use client";

import React, { useRef } from 'react';
import { StockProvider, useStock } from '@/contexts/StockContext';
import MarketIndexChart from '@/components/Stock/MarketIndexChart';
import MostActiveStocks from '@/components/Stock/MostActiveStocks';
import StockKPICards from '@/components/Stock/StockKPICards';
import StockPriceChart from '@/components/Stock/StockPriceChart';
import ShareholdingPattern from '@/components/Stock/ShareholdingPattern';
import SelectDropdown from '@/components/SelectDropdown/SelectDropdown';


const StockDashboard = () => {
  return (
    <StockProvider>
      <StockDashboardContent />
    </StockProvider>
  );
};

const StockDashboardContent = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { handleExport, selectedStock } = useStock();

  const exportOptions = ['pdf', 'excel', 'png', 'csv'];

  const onExport = (exportType: string) => {
    handleExport(exportType, contentRef as React.RefObject<HTMLDivElement>);
  };

  return (
    <div ref={contentRef} className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center">
        <div className="mb-6 w-[90%]">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <a href="/" className="text-blue-600 hover:underline">Ticker</a>
            <span>&gt;</span>
            <span>Market</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Market Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track stock market indices and its companies.
          </p>
        </div>
        <SelectDropdown className="ml-auto h-10 self-center w-70 uppercase"
          label={'Export'}
          value={exportOptions[0]}
          options={exportOptions}
          onChange={onExport} />
      </div>

      {/* KPI Cards */}
      <StockKPICards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Market Index */}
        {
          selectedStock ? (
            <div className="lg:col-span-2">
              <MarketIndexChart />
            </div>
          ) : null
        }

        {/* Right Column - Most Active Stocks */}
        <div className="lg:col-span-1">
          <MostActiveStocks />
        </div>
      </div>

      {/* Stock Details Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Price Charts */}
        <StockPriceChart />

        {/* Shareholding Pattern */}
        <ShareholdingPattern />
      </div>
    </div>
  );
};

export default StockDashboard;
