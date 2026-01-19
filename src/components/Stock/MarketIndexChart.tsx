"use client";

import React, { useMemo } from 'react';
import type Highcharts from 'highcharts';
import HighchartWrapper from '@/components/Charts/HighCharts/HighchartWrapper';
import { useStock, type TimePeriod } from '@/contexts/StockContext';
import Button from '../Button/Button';

const MarketIndexChart: React.FC = () => {
  const { marketIndex, timePeriod, setTimePeriod, isLoadingTimeSeries } = useStock();

  const periods: TimePeriod[] = ['1W', '1M', '3M', '6M', '1Yr', '3Yr', '5Yr'];

  // Calculate CAGR
  const cagr = useMemo(() => {
    if (!marketIndex?.chartData || marketIndex.chartData.length < 2) return 0;

    const firstValue = marketIndex.chartData[0].value;
    const lastValue = marketIndex.chartData[marketIndex.chartData.length - 1].value;
    const years = timePeriod === '1Yr' ? 1 : timePeriod === '3Yr' ? 3 : timePeriod === '5Yr' ? 5 : 1;

    const cagrValue = (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100;
    return cagrValue;
  }, [marketIndex, timePeriod]);

  const chartConfig = useMemo<{ series: Highcharts.SeriesOptionsType[]; optionsOverride: Highcharts.Options } | null>(() => {
    if (!marketIndex?.chartData) return null;

    const data = marketIndex.chartData.map((item: { date: string; value: number; volume?: number }) => ({
      x: new Date(item.date).getTime(),
      y: item.value
    }));

    const isPositive = cagr >= 0;

    return {
      series: [{
        type: 'area',
        name: marketIndex.name,
        data
      }],
      optionsOverride: {
        chart: {
          backgroundColor: 'transparent',
          height: 350,
        },
        title: {
          text: '',
        },
        xAxis: {
          type: 'datetime',
          labels: {
            style: {
              color: '#666'
            }
          },
          gridLineWidth: 0,
        },
        yAxis: {
          title: {
            text: '',
          },
          labels: {
            style: {
              color: '#666'
            }
          },
          gridLineWidth: 1,
          gridLineColor: '#e0e0e0',
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'],
                [1, isPositive ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)']
              ]
            },
            lineColor: isPositive ? '#22c55e' : '#ef4444',
            lineWidth: 2,
            marker: {
              enabled: false,
              states: {
                hover: {
                  enabled: true,
                  radius: 4
                }
              }
            },
          }
        },
        tooltip: {
          shared: true,
          valueDecimals: 2,
        },
        credits: {
          enabled: false,
        },
      }
    };
  }, [marketIndex, cagr]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">
            {marketIndex?.name || 'NIFTY 50'}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {marketIndex?.value.toFixed(2) || '0.00'}
            </span>
            <span className={`
              flex items-center gap-1 text-sm font-medium
              ${marketIndex && marketIndex.change >= 0
                ? 'text-green-600'
                : 'text-red-600'
              }
            `}>
              {marketIndex && marketIndex.change >= 0 ? '▼' : '▲'}
              {Math.abs(marketIndex?.change || 0).toFixed(2)} ({marketIndex?.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">CAGR Return :</span>
          <span className={`
            px-3 py-1 rounded text-sm font-medium
            ${cagr >= 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }
          `}>
            {cagr.toFixed(1)}%
          </span>
        </div>

        <div className="flex gap-2">
          {periods.map((period) => (
            <Button
              key={period}
              onClick={() => setTimePeriod(period)}
              variant={timePeriod === period ? "activeItem" : "primary"}
              className="px-3 py-1 text-xs"
              children={period}
            />
          ))}
        </div>
      </div>

      {isLoadingTimeSeries ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : chartConfig ? (
        <HighchartWrapper
          type="area"
          height={350}
          series={chartConfig.series}
          optionsOverride={chartConfig.optionsOverride}
        />
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default MarketIndexChart;
