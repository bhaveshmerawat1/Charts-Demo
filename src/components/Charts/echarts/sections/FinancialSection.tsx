/**
 * Financial Section Component
 * Displays all financial-related charts
 */

"use client";

import React from "react";
import { Chart } from "@/components/Charts/echarts/Chart";
import { ChartLoader } from "@/components/Charts/echarts/core/ChartLoader";
import { financialCharts } from "@/config/chartConfigs";
import type { FinancialApiResponse, Theme } from "@/types/dashboard";

interface FinancialSectionProps {
  data: FinancialApiResponse | null;
  loading: boolean;
  theme: Theme;
}

export function FinancialSection({ data, loading, theme }: FinancialSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Revenue vs Profit */}
      {loading || !data ? (
        <ChartLoader
          title="Revenue vs Profit"
          subtitle="Comparison of revenue and profit over time"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...financialCharts.revenueVsProfit(theme)}
          data={data.revenueVsProfit}
          theme={theme}
        />
      )}

      {/* Discount Impact */}
      {loading || !data ? (
        <ChartLoader
          title="Discount Impact"
          subtitle="Effect of discounts on revenue"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...financialCharts.discountImpact(theme)}
          data={data.discountImpact}
          theme={theme}
        />
      )}
    </div>
  );
}

