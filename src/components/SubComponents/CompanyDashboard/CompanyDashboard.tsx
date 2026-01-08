"use client";

import React, { useEffect, useState } from 'react'
import Button from "@/components/Button/Button";
import HighchartWrapper from "@/components/Charts/HighCharts/HighchartWrapper";
import { MdLightMode, MdOutlineLightMode } from 'react-icons/md';
import SummaryCard from '@/components/Cards/SummaryCard';
import { useCompanyDashboard } from './CompanyDashboardContext';
import { FaUserTie } from 'react-icons/fa';
import type Highcharts from 'highcharts';
import { useTheme } from '@/contexts/ThemeContext';
import { streamPieSeries } from '../Dashboard/data';

function CompanyDashboard() {
  const { companyData, filteredBranches, loading } = useCompanyDashboard();
  const { theme, toggleTheme } = useTheme();
  const [showChartLoader, setShowChartLoader] = useState(true);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Ensure loader shows for minimum 1 second
  useEffect(() => {
    if (loading) {
      // Track when loading starts
      if (loadingStartTime === null) {
        setLoadingStartTime(Date.now());
      }
      setShowChartLoader(true);
      return;
    }

    // If data is loaded, calculate remaining time to ensure minimum 1 second
    if (loadingStartTime !== null) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      const timer = setTimeout(() => {
        setShowChartLoader(false);
        setLoadingStartTime(null);
      }, remainingTime);

      return () => clearTimeout(timer);
    } else {
      // If loading finished but we never tracked start time, show loader for 1 second
      const timer = setTimeout(() => {
        setShowChartLoader(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, loadingStartTime]);

  // Transform branches data for pie chart - group by country
  const seriesData: Highcharts.SeriesOptionsType[] = [
    {
      type: "pie",
      name: "Branches",
      color: theme === "light" ? "#000" : "#fff",
      data: (() => {
        if (!filteredBranches || filteredBranches.length === 0) return [];

        // Group branches by country and count them
        const countryCounts = filteredBranches.reduce((acc, branch) => {
          const country = branch.country || "Unknown";
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Convert to Highcharts format: { name: country, y: count }
        return Object.entries(countryCounts).map(([country, count]) => ({
          name: country,
          y: count,
          drilldown: "country",
        }));
      })(),
      colorByPoint: true,
    } as Highcharts.SeriesPieOptions,
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Company Dashboard</h1>
        <div className="flex gap-4">
          <Button
            children={theme === "light" ? "Dark" : "Light"}
            onClick={() => toggleTheme()}
            icon={theme === "light" ? <MdLightMode /> : <MdOutlineLightMode />}
            variant="primary"
          />
          <Button
            children={"Export"}
            onClick={() => { }}
            variant="primary"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <SummaryCard
          icon={<div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 w-10 h-10 flex items-center justify-center"><FaUserTie className="text-gray-700 dark:text-gray-200" /></div>}
          title="Total Employees"
          value={loading ? "Loading..." : `${companyData?.companyInfo?.totalEmployees ?? '—'}`}
        />
        <SummaryCard
          icon={<div className="bg-green-500 dark:bg-green-600 rounded-full p-2 w-10 h-10 flex items-center justify-center text-white">B</div>}
          title="Branches"
          value={loading ? "Loading..." : `${filteredBranches.length}`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* 1st pie chart with dreeldown */}
        <div className="relative">
          {showChartLoader ? (
            <div className="flex items-center justify-center h-[350px] bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading chart data...</p>
              </div>
            </div>
          ) : (
            <HighchartWrapper
              type={"pie"}
              series={seriesData}
              title="Branches by Country"
              theme={theme}
              optionsOverride={{
                exporting: {
                  enabled: false
                }
              }}
            />
          )}
        </div>
        {/* 2nd colume chart with dreeldown */}
        {/* <HighchartWrapper
          type={"column"}
          series={streamPieSeries as Highcharts.SeriesOptionsType[]}
          title="Branches by Country"
          subTitle='branches description test'
          theme={theme}
          optionsOverride={{
            exporting: {
              enabled: false
            }
          }}
        /> */}
      </div>
    </>
  );
}

export default CompanyDashboard