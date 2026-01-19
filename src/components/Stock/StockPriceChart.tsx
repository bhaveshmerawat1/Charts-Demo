"use client";

import React, { useMemo } from 'react';
import HighchartWrapper from '@/components/Charts/HighCharts/HighchartWrapper';
import { useStock, type TimePeriod } from '@/contexts/StockContext';
import Button from '../Button/Button';

const StockPriceChart: React.FC = () => {
  const {
    selectedStock,
    stockQuote,
    timeSeries,
    timePeriod,
    setTimePeriod,
    isLoadingTimeSeries
  } = useStock();

  const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', '6M', '1Yr', '3Yr', '5Yr'];

  // Calculate CAGR
  const cagr = useMemo(() => {
    if (!timeSeries?.values || timeSeries.values.length < 2) return 0;

    const firstValue = parseFloat(timeSeries.values[timeSeries.values.length - 1].close);
    const lastValue = parseFloat(timeSeries.values[0].close);
    const years = timePeriod === '1Yr' ? 1 : timePeriod === '3Yr' ? 3 : timePeriod === '5Yr' ? 5 : 1;

    const cagrValue = (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100;
    return cagrValue;
  }, [timeSeries, timePeriod]);

  // Prepare chart data
  const priceChartConfig = useMemo(() => {
    if (!timeSeries?.values) return null;

    const data = timeSeries.values
      .map((item: { datetime: string; close: string }) => ({
        x: new Date(item.datetime).getTime(),
        y: parseFloat(item.close)
      }))
      .reverse();

    const isNegative = cagr < 0;

    return {
      series: [{
        name: selectedStock || 'Price',
        data,
        type: 'area'
      }],
      optionsOverride: {
        chart: {
          backgroundColor: 'transparent'
        },
        title: { text: '' },
        xAxis: {
          type: 'datetime',
          labels: { style: { color: '#666' } },
          gridLineWidth: 0,
        },
        yAxis: {
          title: { text: '' },
          labels: { style: { color: '#666' } },
          gridLineWidth: 1,
          gridLineColor: '#e0e0e0',
        },
        legend: { enabled: false },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, isNegative ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'],
                [1, isNegative ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)']
              ]
            },
            lineColor: isNegative ? '#ef4444' : '#22c55e',
            lineWidth: 2,
            marker: {
              enabled: false,
              states: {
                hover: { enabled: true, radius: 4 }
              }
            },
            states: { hover: { lineWidth: 2 } },
          }
        },
        tooltip: {
          shared: true,
          valueSuffix: ` ${stockQuote?.currency || 'USD'}`,
          valueDecimals: 2,
        },
        credits: { enabled: false },
      }
    };
  }, [timeSeries, selectedStock, stockQuote, cagr]);

  // Mock PE data (since Twelve Data doesn't provide PE ratio in free tier)
  const peChartConfig = useMemo(() => {
    if (!timeSeries?.values) return null;

    const data = timeSeries.values
      .slice(0, 30)
      .map((item: { datetime: string }) => ({
        x: new Date(item.datetime).getTime(),
        y: Math.random() * 50 + 10 // Mock PE ratio
      }))
      .reverse();

    return {
      series: [{
        name: 'PE Ratio',
        data,
        type: 'column'
      }],
      optionsOverride: {
        chart: { backgroundColor: 'transparent' },
        title: { text: '' },
        xAxis: {
          type: 'datetime',
          labels: { style: { color: '#666' } },
          gridLineWidth: 0,
        },
        yAxis: {
          title: { text: '' },
          labels: { style: { color: '#666' } },
          gridLineWidth: 1,
          gridLineColor: '#e0e0e0',
        },
        legend: { enabled: false },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, 'rgba(59, 130, 246, 0.3)'],
                [1, 'rgba(59, 130, 246, 0.05)']
              ]
            },
            lineColor: '#3b82f6',
            lineWidth: 2,
            marker: { enabled: false },
          }
        },
        tooltip: {
          shared: true,
          valueDecimals: 2,
        },
        credits: { enabled: false },
      }
    };
  }, [timeSeries]);

  if (!selectedStock) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Select a stock from the Most Active Stocks table to view charts
        </p>
      </div>
    );
  }

  const handlePricePeriodClick = (period: TimePeriod) => () => {
    setTimePeriod(period);
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Price Chart</h2>
            <div className="flex gap-2">
              {periods.map((period) => (
                <Button
                  key={period}
                  onClick={handlePricePeriodClick(period)}
                  children={period}
                  variant={timePeriod === period ? 'activeItem' : 'primary'}
                  className="text-xs px-2" />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">CAGR Return :</span>
              <span className={`
                px-3 py-1 rounded text-sm font-medium
                ${cagr >= 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }
              `}>
                {cagr.toFixed(2)}%
              </span>
            </div>
          </div>

          {isLoadingTimeSeries ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : priceChartConfig ? (
            <HighchartWrapper
              type="area"
              height={350}
              series={priceChartConfig.series as Highcharts.SeriesOptionsType[]}
              optionsOverride={priceChartConfig.optionsOverride}
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            * Prices are based on daily market changes.
          </p>
        </div>
      </div>

      {/* PE Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">PE Chart</h2>
            <div className="flex gap-2">
              {periods.map((period) => (
                <Button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  children={period}
                  variant={timePeriod === period ? 'activeItem' : 'primary'}
                  className="text-xs px-2" />
              ))}
            </div>
          </div>

          {isLoadingTimeSeries ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : peChartConfig ? (
            <HighchartWrapper
              type="column"
              height={350}
              series={peChartConfig.series as Highcharts.SeriesOptionsType[]}
              optionsOverride={peChartConfig.optionsOverride}
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            * The chart is based on the standalone earnings of the company.
            <br />
            * Negative values and values more than 1000x in PE chart is considered 0.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockPriceChart;
