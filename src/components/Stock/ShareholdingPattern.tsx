"use client";

import React, { useMemo } from 'react';
import HighchartWrapper from '@/components/Charts/HighCharts/HighchartWrapper';
import { useStock } from '@/contexts/StockContext';

// Mock shareholding data (would come from API in real implementation)
const generateShareholdingData = (symbol: string) => {
  return [
    { category: 'Promoters', percentage: 52.9, color: '#1e40af' },
    { category: 'Public', percentage: 16.84, color: '#3b82f6' },
    { category: 'FII', percentage: 16.1, color: '#60a5fa' },
    { category: 'DII', percentage: 14.16, color: '#93c5fd' },
    { category: 'Others', percentage: 0, color: '#dbeafe' },
  ];
};

// Mock promoter pledging data
const generatePromoterPledgingData = () => {
  return [
    { date: 'Sep 2025', promoterPercentage: 52.90, pledgePercentage: 0.00 },
    { date: 'Jun 2025', promoterPercentage: 52.90, pledgePercentage: 0.00 },
    { date: 'Mar 2025', promoterPercentage: 52.90, pledgePercentage: 0.00 },
    { date: 'Dec 2024', promoterPercentage: 52.90, pledgePercentage: 0.00 },
    { date: 'Sep 2024', promoterPercentage: 52.90, pledgePercentage: 0.00 },
  ];
};

const ShareholdingPattern: React.FC = () => {
  const { selectedStock } = useStock();

  const shareholdingData = useMemo(() => {
    if (!selectedStock) return [];
    return generateShareholdingData(selectedStock);
  }, [selectedStock]);

  const promoterData = useMemo(() => {
    return generatePromoterPledgingData();
  }, []);

  const pieChartSeries = useMemo(() => [{
    type: 'pie' as const,
    name: 'Shareholding',
    colorByPoint: true,
    data: shareholdingData.map((item) => ({
      name: item.category,
      y: item.percentage,
      color: item.color,
    })),
  }], [shareholdingData]);

  const pieOptionsOverride = useMemo(() => ({
    chart: {
      backgroundColor: 'transparent'
    },
    tooltip: {
      pointFormat: '<b>{point.percentage:.2f}%</b>',
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false,
        },
        showInLegend: false,
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    },
    credits: {
      enabled: false,
    }
  }), []);

  if (!selectedStock) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Select a stock to view shareholding pattern
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Shareholding Pattern</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div>
          <HighchartWrapper
            type="pie"
            height={400}
            title=""
            series={pieChartSeries}
            optionsOverride={pieOptionsOverride}
          />

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {shareholdingData.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.category} : {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            * Figures given above are % of equity capital
          </p>
        </div>

        {/* Promoter Pledging Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Promoter Pledging %
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50 dark:bg-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    DATE
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    PROMOTER %
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    PLEDGE %
                  </th>
                </tr>
              </thead>
              <tbody>
                {promoterData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      {item.promoterPercentage.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      {item.pledgePercentage.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Investors List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareholdingPattern;
