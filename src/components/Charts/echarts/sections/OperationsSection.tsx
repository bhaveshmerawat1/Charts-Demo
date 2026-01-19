/**
 * Operations Section Component
 * Displays all operations-related charts
 */

"use client";

import React from "react";
import { Chart } from "@/components/Charts/echarts/Chart";
import { ChartLoader } from "@/components/Charts/echarts/core/ChartLoader";
import { operationsCharts } from "@/config/chartConfigs";
import type { OperationsApiResponse, Theme } from "@/types/dashboard";

interface OperationsSectionProps {
  data: OperationsApiResponse | null;
  loading: boolean;
  theme: Theme;
}

export function OperationsSection({ data, loading, theme }: OperationsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Delivery Time Analysis */}
      {loading || !data ? (
        <ChartLoader
          title="Delivery Time Analysis"
          subtitle="Average delivery time by period"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...operationsCharts.deliveryTimeAnalysis(theme)}
          data={data.deliveryTimeAnalysis}
          theme={theme}
        />
      )}

      {/* Returns & Refund Rate */}
      {loading || !data ? (
        <ChartLoader
          title="Returns & Refund Rate"
          subtitle="Return and refund trends over time"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...operationsCharts.returnsAndRefundRate(theme)}
          data={data.returnsAndRefundRate}
          theme={theme}
        />
      )}
    </div>
  );
}

