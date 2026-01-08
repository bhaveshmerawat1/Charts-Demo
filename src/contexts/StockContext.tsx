"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type StockQuote = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
};

export type MarketMover = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
};

export type MostActiveStock = {
  symbol: string;
  name: string;
  volume: number;
  value: number;
};

export type Stock52Week = {
  symbol: string;
  name: string;
  price: number;
  day_high?: number;
  day_low?: number;
  week_high_52?: number;
  week_low_52?: number;
};

export type StockContextType = {
  // Market Data
  topGainers: MarketMover[];
  topLosers: MarketMover[];
  week52High: Stock52Week[];
  week52Low: Stock52Week[];
  mostActiveByVolume: MostActiveStock[];
  mostActiveByValue: MostActiveStock[];

  // Company Data
  selectedStock: StockQuote | null;
  stockHistory: any[];
  shareholdingData: any[];

  // Loading States
  loading: boolean;
  error: string | null;

  // Actions
  fetchMarketData: () => Promise<void>;
  fetchStockQuote: (symbol: string) => Promise<void>;
  fetchStockHistory: (symbol: string, interval?: string) => Promise<void>;
  fetchShareholding: (symbol: string) => Promise<void>;
  setSelectedStock: (stock: StockQuote | null) => void;
};
// Safe default context value to avoid runtime errors if Provider not mounted yet
const StockContext = createContext<StockContextType>({
  topGainers: [],
  topLosers: [],
  week52High: [],
  week52Low: [],
  mostActiveByVolume: [],
  mostActiveByValue: [],
  selectedStock: null,
  stockHistory: [],
  shareholdingData: [],
  loading: false,
  error: null,
  fetchMarketData: async () => { },
  fetchStockQuote: async () => { },
  fetchStockHistory: async () => { },
  fetchShareholding: async () => { },
  setSelectedStock: () => { },
});

// Sample stocks for demo (replace with actual API calls)
const SAMPLE_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'SBIN'
];

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [topGainers, setTopGainers] = useState<MarketMover[]>([]);
  const [topLosers, setTopLosers] = useState<MarketMover[]>([]);
  const [week52High, setWeek52High] = useState<Stock52Week[]>([]);
  const [week52Low, setWeek52Low] = useState<Stock52Week[]>([]);
  const [mostActiveByVolume, setMostActiveByVolume] = useState<MostActiveStock[]>([]);
  const [mostActiveByValue, setMostActiveByValue] = useState<MostActiveStock[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [shareholdingData, setShareholdingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stocks/market-data');
      if (!res.ok) throw new Error('Failed to fetch market data');
      const data = await res.json();
      console.log("fetchMarketData ===============", data)
      setTopGainers(data.topGainers || []);
      setTopLosers(data.topLosers || []);
      setWeek52High(data.week52High || []);
      setWeek52Low(data.week52Low || []);
      setMostActiveByVolume(data.mostActiveByVolume || []);
      setMostActiveByValue(data.mostActiveByValue || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStockQuote = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stocks/quote?symbol=${symbol}`);
      if (!res.ok) throw new Error('Failed to fetch stock quote');
      const data = await res.json();
      setSelectedStock(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stock quote');
      setSelectedStock(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStockHistory = useCallback(async (symbol: string, interval: string = '1day') => {
    try {
      const res = await fetch(`/api/stocks/history?symbol=${symbol}&interval=${interval}`);
      console.log("res ============ fetchStockHistory ======", res)
      if (!res.ok) throw new Error('Failed to fetch stock history');
      const data = await res.json();
      console.log("data ============ fetchStockHistory ======", data)
      // setStockHistory(data.values);
    } catch (e: any) {
      console.error('Failed to load stock history:', e);
      setStockHistory([]);
    }
  }, []);

  const fetchShareholding = useCallback(async (symbol: string) => {
    try {
      const res = await fetch(`/api/stocks/shareholding?symbol=${symbol}`);
      if (!res.ok) throw new Error('Failed to fetch shareholding');
      const data = await res.json();
      setShareholdingData(data || []);
    } catch (e: any) {
      console.error('Failed to load shareholding:', e);
      setShareholdingData([]);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const value: StockContextType = {
    topGainers,
    topLosers,
    week52High,
    week52Low,
    mostActiveByVolume,
    mostActiveByValue,
    selectedStock,
    stockHistory,
    shareholdingData,
    loading,
    error,
    fetchMarketData,
    fetchStockQuote,
    fetchStockHistory,
    fetchShareholding,
    setSelectedStock,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

