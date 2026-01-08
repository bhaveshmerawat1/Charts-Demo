"use client";

import { useEffect, useState } from "react";
import StockChart from "@/components/SubComponents/Stock/StockChart";
import StockHeader from "./StockHeader";
import RangeSelector from "./RangeSelector";

export default function StockDashBoard() {
  const [symbol, setSymbol] = useState("AAPL");
  const [interval, setInterval] = useState("1day");
  const [ohlc, setOhlc] = useState<any[]>([]);
  const [quote, setQuote] = useState<any>({});

  // Historical
  useEffect(() => {
    fetch(`/api/stocks/history?symbol=${symbol}&interval=${interval}`)
      .then(res => res.json())
      .then(setOhlc);
  }, [symbol, interval]);

  // Live polling
  useEffect(() => {
    const id = setInterval(() => {
      fetch(`/api/stocks/quote?symbol=${symbol}`)
        .then(res => res.json())
        .then(setQuote);
    }, 5000);

    return () => clearInterval(id);
  }, [symbol]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <StockHeader symbol={symbol} quote={quote} />

      <div className="flex justify-between mb-4">
        <select
          className="border px-3 py-2 rounded"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
        >
          <option value="AAPL">Apple</option>
          <option value="MSFT">Microsoft</option>
          <option value="GOOGL">Google</option>
          <option value="TSLA">Tesla</option>
        </select>

        <RangeSelector value={interval} onChange={setInterval} />
      </div>

      <StockChart
        series={[
          {
            type: "candlestick",
            name: symbol,
            data: ohlc
          }
        ]}
      />
    </div>
  );
}
