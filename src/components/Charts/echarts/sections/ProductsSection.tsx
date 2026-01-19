/**
 * Products Section Component
 * Displays all products-related charts
 */

"use client";

import React from "react";
import { Chart } from "@/components/Charts/echarts/Chart";
import { ChartLoader } from "@/components/Charts/echarts/core/ChartLoader";
import { productsCharts } from "@/config/chartConfigs";
import type { ProductsApiResponse, Theme } from "@/types/dashboard";

interface ProductsSectionProps {
  data: ProductsApiResponse | null;
  loading: boolean;
  theme: Theme;
}

export function ProductsSection({ data, loading, theme }: ProductsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Top Selling Products */}
      {loading || !data ? (
        <ChartLoader
          title="Top Selling Products"
          subtitle="Best performing products by revenue"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...productsCharts.topSellingProducts(theme, data.topSellingProducts)}
          data={data.topSellingProducts}
          theme={theme}
        />
      )}

      {/* Category-wise Sales */}
      {loading || !data ? (
        <ChartLoader
          title="Category-wise Sales"
          subtitle="Revenue breakdown by product category"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...productsCharts.categoryWiseSales(theme)}
          data={data.categoryWiseSales}
          theme={theme}
        />
      )}
    </div>
  );
}

