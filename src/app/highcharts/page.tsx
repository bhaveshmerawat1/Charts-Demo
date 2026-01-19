"use client";

import StockDashboard from "../stock-dashboard/page";

export default function HighCharts() {
  return (
    <div className="w-full dark:bg-gray-900 min-h-screen transition-colors">
      <div className="container mx-auto p-2">
        <StockDashboard />
      </div>
    </div >
  );
}
