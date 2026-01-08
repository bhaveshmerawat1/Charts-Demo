"use client";

import MarketDashboard from "@/components/SubComponents/Stock/MarketDashboard";
import StockDashBoard from "@/components/SubComponents/Stock/StockDashBoard";
import { useState } from "react";

export default function HighCharts() {
  const [symbol, setSymbol] = useState("AAPL");
  return (
    <div className="w-full dark:bg-gray-900 min-h-screen transition-colors">
      <div className="container mx-auto p-2">
        {/* <StockDashBoard /> */}
        <MarketDashboard />
      </div>
    </div >
  );
}
