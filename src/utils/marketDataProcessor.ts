/**
 * Utility functions to process market data and calculate various metrics
 * These will be used when price/volume data becomes available
 */

export interface StockWithPrice {
  symbol: string;
  name: string;
  price: number;
  previous_close?: number;
  change?: number;
  change_percent?: number;
  volume?: number;
  value?: number;
  day_high?: number;
  day_low?: number;
  week_high_52?: number;
  week_low_52?: number;
}

/**
 * Calculate top gainers from a list of stocks
 */
export function calculateTopGainers(
  stocks: StockWithPrice[],
  limit: number = 10
): Array<{
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}> {
  return stocks
    .filter((stock) => stock.change_percent && stock.change_percent > 0)
    .sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))
    .slice(0, limit)
    .map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change || 0,
      change_percent: stock.change_percent || 0,
    }));
}

/**
 * Calculate top losers from a list of stocks
 */
export function calculateTopLosers(
  stocks: StockWithPrice[],
  limit: number = 10
): Array<{
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}> {
  return stocks
    .filter((stock) => stock.change_percent && stock.change_percent < 0)
    .sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))
    .slice(0, limit)
    .map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change || 0,
      change_percent: stock.change_percent || 0,
    }));
}

/**
 * Calculate stocks at 52-week high
 */
export function calculate52WeekHigh(
  stocks: StockWithPrice[],
  limit: number = 10
): Array<{
  symbol: string;
  name: string;
  price: number;
  day_high?: number;
  week_high_52?: number;
}> {
  return stocks
    .filter((stock) => stock.week_high_52 && stock.price >= stock.week_high_52 * 0.99)
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, limit)
    .map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      day_high: stock.day_high,
      week_high_52: stock.week_high_52,
    }));
}

/**
 * Calculate stocks at 52-week low
 */
export function calculate52WeekLow(
  stocks: StockWithPrice[],
  limit: number = 10
): Array<{
  symbol: string;
  name: string;
  price: number;
  day_low?: number;
  week_low_52?: number;
}> {
  return stocks
    .filter((stock) => stock.week_low_52 && stock.price <= stock.week_low_52 * 1.01)
    .sort((a, b) => (a.price || 0) - (b.price || 0))
    .slice(0, limit)
    .map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      day_low: stock.day_low,
      week_low_52: stock.week_low_52,
    }));
}

/**
 * Calculate most active stocks by volume
 */
export function calculateMostActiveByVolume(
  stocks: StockWithPrice[],
  limit: number = 10
): Array<{
  symbol: string;
  name: string;
  volume: number;
  value: number;
}> {
  return stocks
    .filter((stock) => stock.volume && stock.volume > 0)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, limit)
    .map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      volume: stock.volume || 0,
      value: stock.value || stock.price * (stock.volume || 0),
    }));
}

/**
 * Calculate most active stocks by value
 */
export function calculateMostActiveByValue(
  stocks: StockWithPrice[],
  limit: number = 10
): Array<{
  symbol: string;
  name: string;
  volume: number;
  value: number;
}> {
  return stocks
    .map((stock) => ({
      ...stock,
      value: stock.value || stock.price * (stock.volume || 0),
    }))
    .filter((stock) => stock.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      volume: stock.volume || 0,
      value: stock.value,
    }));
}

/**
 * Process raw market data to extract all metrics
 */
export function processMarketData(stocks: StockWithPrice[]) {
  return {
    topGainers: calculateTopGainers(stocks),
    topLosers: calculateTopLosers(stocks),
    week52High: calculate52WeekHigh(stocks),
    week52Low: calculate52WeekLow(stocks),
    mostActiveByVolume: calculateMostActiveByVolume(stocks),
    mostActiveByValue: calculateMostActiveByValue(stocks),
  };
}
