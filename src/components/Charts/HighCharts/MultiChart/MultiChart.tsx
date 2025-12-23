"use client";

import G from "@highcharts/grid-lite";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import GlobalHighchart from "../GlobalHighchart";
import { seriesData } from "../registryData";

export default function MultiChart() {
  const options: Highcharts.Options = {
    chart: {
      zoomType: "xy"
    } as Highcharts.ChartOptions,

    title: {
      text: "Sales of petroleum products March, India"
    },

    xAxis: {
      categories: [
        "Jet fuel",
        "Duty-free diesel",
        "Petrol",
        "Diesel",
        "Gas oil"
      ]
    },

    yAxis: {
      title: {
        text: "Million liters"
      }
    },

    tooltip: {
      shared: true
    },

    legend: {
      align: "center"
    },

    series: [
      // ===== COLUMN SERIES =====
      {
        type: "column",
        name: "2020",
        data: [55, 82, 63, 225, 178]
      },
      {
        type: "column",
        name: "2021",
        data: [23, 78, 68, 240, 165]
      },
      {
        type: "column",
        name: "2022",
        data: [56, 85, 70, 250, 170]
      },

      // ===== LINE SERIES (AVERAGE) =====
      {
        type: "line",
        name: "Average",
        data: [45, 82, 67, 238, 171],
        color: "#f97316",
        marker: {
          enabled: true,
          radius: 5
        }
      },

      // ===== PIE SERIES (TOTAL) =====
      {
        type: "pie",
        name: "Total",
        data: [
          { name: "2020", y: 603 },
          { name: "2021", y: 574 },
          { name: "2022", y: 631 }
        ],
        center: [120, 100], // position inside chart
        size: 120,
        innerSize: "60%",
        dataLabels: {
          enabled: false
        },
        showInLegend: false
      }
    ]
  };

  const seriesData = options.series as Highcharts.SeriesOptionsType[];

  return (
    <GlobalHighchart
      series={seriesData}
      title="Multi-Type Chart Example"
      height={400}
      optionsOverride={options}
    />
  );
}
