// Stock-related TypeScript interfaces and types

export interface Stock {
  symbol: string;
  name: string;
  exchange?: string;
  currency?: string;
  type?: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previous_close: number;
  change: number;
  percent_change: number;
  average_volume: number;
  fifty_two_week?: {
    low: number;
    high: number;
    low_change: number;
    high_change: number;
    low_change_percent: number;
    high_change_percent: number;
  };
}

export interface TimeSeriesData {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface TimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    type: string;
  };
  values: TimeSeriesData[];
  status: string;
}

export interface StockStats {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
  pe?: number;
  high52Week: number;
  low52Week: number;
}

export interface ShareholdingData {
  category: string;
  percentage: number;
  color: string;
}

export interface PromoterPledging {
  date: string;
  promoterPercentage: number;
  pledgePercentage: number;
}

export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Yr' | '3Yr' | '5Yr';

export interface ChartDataPoint {
  date: string;
  value: number;
  volume?: number;
}

export interface KPICard {
  title: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  chartData: ChartDataPoint[];
}

export interface ActiveStock {
  symbol: string;
  name: string;
  volume: number;
  price: number;
  change: number;
  changePercent: number;
}
