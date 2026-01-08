"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStock } from '@/contexts/StockContext';
import { useTheme } from '@/contexts/ThemeContext';
import HighchartWrapper from '@/components/Charts/HighCharts/HighchartWrapper';
import SummaryCard from '@/components/Cards/SummaryCard';
import Button from '@/components/Button/Button';
import { FaArrowLeft, FaChartLine, FaUsers } from 'react-icons/fa';
import type Highcharts from 'highcharts';

export default function CompanyStock() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol as string || 'RELIANCE';
  const { theme } = useTheme();
  const {
    selectedStock,
    stockHistory,
    shareholdingData,
    loading,
    fetchStockQuote,
    fetchStockHistory,
    fetchShareholding,
  } = useStock();

  const [selectedRange, setSelectedRange] = useState('1Yr');

  useEffect(() => {
    if (symbol) {
      console.log("get value from param =============", symbol)
      fetchStockQuote(symbol);
      fetchStockHistory(symbol, '1day');
      fetchShareholding(symbol);
    }
  }, [symbol, fetchStockQuote, fetchStockHistory, fetchShareholding]);

  // Transform shareholding data for pie chart
  const shareholdingSeries: Highcharts.SeriesOptionsType[] = [
    {
      type: 'pie',
      name: 'Shareholding',
      data: shareholdingData.map((item: any) => ({
        name: item.category,
        y: item.percentage,
      })),
      colorByPoint: true,
    } as Highcharts.SeriesPieOptions,
  ];

  // Transform stock history for line chart
  const priceSeries: Highcharts.SeriesOptionsType[] = [
    {
      type: 'line',
      name: 'Price',
      data: stockHistory.map((item: any) => [
        new Date(item.datetime).getTime(),
        parseFloat(item.close),
      ]),
    },
  ];

  if (loading && !selectedStock) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">Stock not found</p>
          <Button
            onClick={() => router.push('/market')}
            variant="primary"
            className="mt-4"
          >
            Back to Market
          </Button>
        </div>
      </div>
    );
  }

  const change = parseFloat(selectedStock.change || '0');
  const changePercent = parseFloat(selectedStock.percent_change || '0');
  const isPositive = change >= 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.push('/market')}
          variant="primary"
          icon={<FaArrowLeft />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {selectedStock.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedStock.symbol} • {selectedStock.exchange}
          </p>
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ₹{parseFloat(selectedStock.close).toFixed(2)}
          </p>
          <p className={`text-lg font-semibold mt-2 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </p>
        </div>

        <SummaryCard
          icon={<div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 w-10 h-10 flex items-center justify-center"><FaChartLine className="text-blue-600 dark:text-blue-400" /></div>}
          title="Today's High"
          value={`₹${parseFloat(selectedStock.high).toFixed(2)}`}
        />

        <SummaryCard
          icon={<div className="bg-red-100 dark:bg-red-900 rounded-full p-2 w-10 h-10 flex items-center justify-center"><FaChartLine className="text-red-600 dark:text-red-400" /></div>}
          title="Today's Low"
          value={`₹${parseFloat(selectedStock.low).toFixed(2)}`}
        />

        <SummaryCard
          icon={<div className="bg-green-100 dark:bg-green-900 rounded-full p-2 w-10 h-10 flex items-center justify-center"><FaChartLine className="text-green-600 dark:text-green-400" /></div>}
          title="Volume"
          value={parseInt(selectedStock.volume).toLocaleString()}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Price Chart</h3>
            <div className="flex gap-2">
              {['1w', '1m', '3m', '6m', '1Yr', '3Yr', '5Yr'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1 text-sm rounded ${selectedRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <HighchartWrapper
            type="line"
            series={priceSeries}
            title=""
            theme={theme}
            height={400}
            optionsOverride={{
              chart: {
                type: 'line',
              },
              xAxis: {
                type: 'datetime',
              },
              exporting: {
                enabled: false,
              },
            }}
          />
        </div>

        {/* Shareholding Pattern Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUsers className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Shareholding Pattern
            </h3>
          </div>
          <HighchartWrapper
            type="pie"
            series={shareholdingSeries}
            title=""
            theme={theme}
            height={400}
            optionsOverride={{
              exporting: {
                enabled: false,
              },
              plotOptions: {
                pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Stock Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₹{parseFloat(selectedStock.open).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Previous Close</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ₹{parseFloat(selectedStock.previous_close).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Currency</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedStock.currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {new Date(selectedStock.datetime).toLocaleString()}
            </p>
          </div>
        </div>
      </div>


      <div className='group'>
        <p className='hover:none'>hover not show</p>
        <p className='hover:block'>hover show</p>
      </div>
    </div>
  );
}
