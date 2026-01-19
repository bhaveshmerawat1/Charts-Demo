/**
 * Customers Section Component
 * Displays all customers-related charts
 */

"use client";

import React from "react";
import { Chart } from "@/components/Charts/echarts/Chart";
import { ChartLoader } from "@/components/Charts/echarts/core/ChartLoader";
import { customersCharts } from "@/config/chartConfigs";
import type { CustomersApiResponse, Theme } from "@/types/dashboard";

interface CustomersSectionProps {
  data: CustomersApiResponse | null;
  loading: boolean;
  theme: Theme;
}

export function CustomersSection({ data, loading, theme }: CustomersSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* New vs Returning Customers */}
        {loading || !data ? (
          <ChartLoader
            title="New vs Returning Customers"
            subtitle="Customer acquisition breakdown"
            cardVariant="bordered"
            theme={theme}
          />
        ) : (
          <Chart
            {...customersCharts.newVsReturningCustomers(theme)}
            data={[
              { name: "New Customers", value: data.newVsReturningCustomers.new },
              { name: "Returning Customers", value: data.newVsReturningCustomers.returning },
            ]}
            theme={theme}
          />
        )}

        {/* Customer Growth */}
        {loading || !data ? (
          <ChartLoader
            title="Customer Growth"
            subtitle="New customer acquisition trend"
            cardVariant="bordered"
            theme={theme}
          />
        ) : (
          <Chart
            {...customersCharts.customerGrowth(theme)}
            data={data.customerGrowth}
            theme={theme}
          />
        )}
      </div>

      {/* Orders by Location */}
      {loading || !data ? (
        <ChartLoader
          title="Orders by Location"
          subtitle="Geographic distribution of orders"
          cardVariant="bordered"
          theme={theme}
        />
      ) : (
        <Chart
          {...customersCharts.ordersByLocation(theme)}
          data={data.ordersByLocation}
          theme={theme}
        />
      )}
    </>
  );
}

