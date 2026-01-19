"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// --- Local types (user requested removal of shared stock.ts) ---
export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Yr' | '3Yr' | '5Yr';

export interface StockQuote {
  symbol: string;
  name?: string;
  close: number | string;
  change: number | string;
  percent_change: number | string;
  volume?: number | string;
  currency?: string;
  fifty_two_week?: {
    low: number;
    high: number;
    low_change?: number;
    high_change?: number;
    low_change_percent?: number;
    high_change_percent?: number;
  };
}

export interface TimeSeriesValue {
  datetime: string;
  close: string;
  volume: string;
}

export interface TimeSeries {
  values?: TimeSeriesValue[];
}

export interface ActiveStock {
  symbol: string;
  name: string;
  volume: number;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  chartData: { date: string; value: number; volume?: number }[];
}

interface StockContextType {
  // Selected stock
  selectedStock: string | null;
  setSelectedStock: (symbol: string | null) => void;

  // Stock data
  stockQuote: StockQuote | null;
  timeSeries: TimeSeries | null;

  // Active stocks list
  activeStocks: ActiveStock[];

  // Market data
  marketIndex: MarketIndex | null;

  // Time period for charts
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;

  // Loading states
  isLoadingQuote: boolean;
  isLoadingTimeSeries: boolean;
  isLoadingActiveStocks: boolean;

  // Methods
  fetchStockData: (symbol: string) => Promise<void>;
  refreshMarketData: () => Promise<void>;
  handleExport: (exportType: string, contentRef: React.RefObject<HTMLDivElement>) => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

// Default stocks to display (popular US stocks)
const DEFAULT_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
  'NVDA', 'META', 'AMD', 'NFLX', 'DIS'
];

const MARKET_INDEX_SYMBOL = 'SPY'; // S&P 500 ETF

// Map period to API interval and output size
const getIntervalFromPeriod = (period: TimePeriod): { interval: string; outputsize: number } => {
  switch (period) {
    case '1D':
      return { interval: '5min', outputsize: 78 }; // 1 day of 5min data
    case '1W':
      return { interval: '1h', outputsize: 120 }; // 1 week of hourly data
    case '1M':
      return { interval: '1day', outputsize: 30 };
    case '3M':
      return { interval: '1day', outputsize: 90 };
    case '6M':
      return { interval: '1day', outputsize: 180 };
    case '1Yr':
      return { interval: '1day', outputsize: 365 };
    case '3Yr':
      return { interval: '1week', outputsize: 156 };
    case '5Yr':
      return { interval: '1week', outputsize: 260 };
    default:
      return { interval: '1day', outputsize: 365 };
  }
};

// Simple API helpers (client -> Next.js API routes)
const fetchQuote = async (symbol: string): Promise<StockQuote> => {
  console.log('Fetching quote for symbol =======:', symbol);
  const res = await fetch(`/api/stock/quote?symbol=${encodeURIComponent(symbol)}`);
  const data = await res.json();
  if (!res.ok || data?.error) {
    const message = data?.error || 'Failed to fetch quote';
    throw new Error(message);
  }
  return data as StockQuote;
};

const fetchTimeSeries = async (symbol: string, interval: string, outputsize: number): Promise<TimeSeries> => {
  const url = `/api/stock/time-series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data?.error) {
    const message = data?.error || 'Failed to fetch time series';
    throw new Error(message);
  }
  return data as TimeSeries;
};

const fetchBatchQuotes = async (symbols: string[]): Promise<Record<string, StockQuote>> => {
  const res = await fetch('/api/stock/batch-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols }),
  });
  const data = await res.json();
  console.log('Batch quotes data ================:', data);
  if (!res.ok || data?.error) {
    const message = data?.error || 'Failed to fetch batch quotes';
    throw new Error(message);
  }
  return data as Record<string, StockQuote>;
};

export function StockProvider({ children }: { children: ReactNode }) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeries | null>(null);
  const [activeStocks, setActiveStocks] = useState<ActiveStock[]>([]);
  const [marketIndex, setMarketIndex] = useState<MarketIndex | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1Yr');

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isLoadingTimeSeries, setIsLoadingTimeSeries] = useState(false);
  const [isLoadingActiveStocks, setIsLoadingActiveStocks] = useState(false);

  // Fetch individual stock data
  const fetchStockData = useCallback(async (symbol: string) => {
    try {
      // Fetch quote
      setIsLoadingQuote(true);
      const quote = await fetchQuote(symbol);
      setStockQuote(quote);
      setIsLoadingQuote(false);

      // Fetch time series based on selected period
      setIsLoadingTimeSeries(true);
      const { interval, outputsize } = getIntervalFromPeriod(timePeriod);
      const series = await fetchTimeSeries(symbol, interval, outputsize);
      setTimeSeries(series);
      setIsLoadingTimeSeries(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setIsLoadingQuote(false);
      setIsLoadingTimeSeries(false);
    }
  }, [timePeriod]);

  // Fetch active stocks data
  const fetchActiveStocks = useCallback(async () => {
    try {
      setIsLoadingActiveStocks(true);

      // Fetch quotes for default stocks
      const quotes = await fetchBatchQuotes(DEFAULT_STOCKS);

      const stocks: ActiveStock[] = Object.entries(quotes).map(([symbol, data]: [string, any]) => ({
        symbol: data.symbol || symbol,
        name: data.name || symbol,
        volume: parseFloat(data.volume) || 0,
        price: parseFloat(data.close) || 0,
        change: parseFloat(data.change) || 0,
        changePercent: parseFloat(data.percent_change) || 0,
      }));

      // Sort by volume to get most active
      const sortedByVolume = [...stocks].sort((a, b) => b.volume - a.volume);
      setActiveStocks(sortedByVolume);

      setIsLoadingActiveStocks(false);
    } catch (error) {
      console.error('Error fetching active stocks:', error);
      setIsLoadingActiveStocks(false);
      // Set empty array on error to prevent UI issues
      setActiveStocks([]);
    }
  }, []);

  // Fetch market index data
  const fetchMarketIndex = useCallback(async () => {
    try {
      console.log('Fetching market index data for period =======:', MARKET_INDEX_SYMBOL, timePeriod);
      const quote = await fetchQuote(MARKET_INDEX_SYMBOL);
      const { interval, outputsize } = getIntervalFromPeriod(timePeriod);
      const series = await fetchTimeSeries(MARKET_INDEX_SYMBOL, interval, outputsize);

      const chartData = series.values?.map(item => ({
        date: item.datetime,
        value: parseFloat(item.close),
        volume: parseFloat(item.volume)
      })) || [];

      setMarketIndex({
        symbol: MARKET_INDEX_SYMBOL,
        name: 'S&P 500',
        value: typeof quote.close === 'string' ? parseFloat(quote.close) : quote.close,
        change: typeof quote.change === 'string' ? parseFloat(quote.change) : quote.change,
        changePercent: typeof quote.percent_change === 'string' ? parseFloat(quote.percent_change) : quote.percent_change,
        chartData: chartData.reverse()
      });
    } catch (error) {
      console.error('Error fetching market index:', error);
    }
  }, [timePeriod]);

  // Refresh all market data
  const refreshMarketData = useCallback(async () => {
    await Promise.all([
      fetchActiveStocks(),
      fetchMarketIndex()
    ]);
  }, [fetchActiveStocks, fetchMarketIndex]);

  // Export functionality
  const handleExport = useCallback(async (exportType: string, contentRef: React.RefObject<HTMLDivElement>) => {
    if (exportType === 'csv') {
      // CSV export logic with actual data
      const csvContent = generateCSVContent();
      downloadCSV(csvContent);
    } else if (exportType === 'png') {
      // PNG export logic using html2canvas
      if (contentRef.current) {
        try {
          const canvas = await html2canvas(contentRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
          });
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `stock-dashboard-${new Date().getTime()}.png`;
          link.click();
        } catch (error) {
          console.error('Error exporting PNG:', error);
        }
      }
    } else if (exportType === 'pdf') {
      // PDF export logic
      if (contentRef.current) {
        try {
          const canvas = await html2canvas(contentRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
          });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
          });
          const imgWidth = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 210;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 210;
          }

          pdf.save(`stock-dashboard-${new Date().getTime()}.pdf`);
        } catch (error) {
          console.error('Error exporting PDF:', error);
        }
      }
    } else if (exportType === 'excel') {
      // Excel export logic with actual data
      try {
        const excelContent = generateExcelContent();
        const worksheet = XLSX.utils.json_to_sheet(excelContent);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Data');
        XLSX.writeFile(workbook, `stock-data-${new Date().getTime()}.xlsx`);
      } catch (error) {
        console.error('Error exporting Excel:', error);
      }
    }
  }, [activeStocks, stockQuote, timeSeries]);

  const generateCSVContent = () => {
    const headers = ['Symbol', 'Name', 'Price', 'Change', 'Change %', 'Volume'];
    const rows = activeStocks.map(stock => [
      stock.symbol,
      stock.name,
      stock.price.toFixed(2),
      stock.change.toFixed(2),
      stock.changePercent.toFixed(2),
      stock.volume.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadCSV = (csvContent: string) => {
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `stock-data-${new Date().getTime()}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateExcelContent = () => {
    // Generate Excel data based on actual stock data
    const excelData = activeStocks.map(stock => ({
      Symbol: stock.symbol,
      Name: stock.name,
      Price: stock.price,
      Change: stock.change,
      'Change %': stock.changePercent,
      Volume: stock.volume,
    }));

    // If a stock is selected, add its details in a separate section
    if (stockQuote) {
      excelData.push({
        Symbol: '',
        Name: '',
        Price: 0,
        Change: 0,
        'Change %': 0,
        Volume: 0,
      });
      excelData.push({
        Symbol: 'Selected Stock Details',
        Name: '',
        Price: 0,
        Change: 0,
        'Change %': 0,
        Volume: 0,
      });
      excelData.push({
        Symbol: stockQuote.symbol,
        Name: stockQuote.name || '',
        Price: typeof stockQuote.close === 'string' ? parseFloat(stockQuote.close) : stockQuote.close,
        Change: typeof stockQuote.change === 'string' ? parseFloat(stockQuote.change) : stockQuote.change,
        'Change %': typeof stockQuote.percent_change === 'string' ? parseFloat(stockQuote.percent_change) : stockQuote.percent_change,
        Volume: stockQuote.volume ? (typeof stockQuote.volume === 'string' ? parseFloat(stockQuote.volume) : stockQuote.volume) : 0,
      });

      if (stockQuote.fifty_two_week) {
        excelData.push({
          Symbol: '52 Week High',
          Name: stockQuote.fifty_two_week.high.toString(),
          Price: 0,
          Change: 0,
          'Change %': 0,
          Volume: 0,
        });
        excelData.push({
          Symbol: '52 Week Low',
          Name: stockQuote.fifty_two_week.low.toString(),
          Price: 0,
          Change: 0,
          'Change %': 0,
          Volume: 0,
        });
      }
    }

    return excelData;
  };

  // Initial data load
  useEffect(() => {
    refreshMarketData();
  }, [refreshMarketData]);

  // Refetch time series when period changes
  useEffect(() => {
    if (selectedStock) {
      const { interval, outputsize } = getIntervalFromPeriod(timePeriod);
      setIsLoadingTimeSeries(true);
      fetchTimeSeries(selectedStock, interval, outputsize)
        .then(series => {
          setTimeSeries(series);
          setIsLoadingTimeSeries(false);
        })
        .catch(error => {
          console.error('Error fetching time series:', error);
          setIsLoadingTimeSeries(false);
        });

      // Only update market index chart when timePeriod changes (not on selectedStock change)
      fetchMarketIndex();
    }
  }, [timePeriod, fetchMarketIndex]);

  // Fetch data when stock is selected
  useEffect(() => {
    if (selectedStock) {
      console.log('Selected stock changed, fetching data for =======:', selectedStock);
      fetchStockData(selectedStock);

    }
  }, [selectedStock, fetchStockData]);

  const value: StockContextType = {
    selectedStock,
    setSelectedStock,
    stockQuote,
    timeSeries,
    activeStocks,
    marketIndex,
    timePeriod,
    setTimePeriod,
    isLoadingQuote,
    isLoadingTimeSeries,
    isLoadingActiveStocks,
    fetchStockData,
    refreshMarketData,
    handleExport,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
