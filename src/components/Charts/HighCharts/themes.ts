import Highcharts from "highcharts";

// Light theme configuration
export const lightTheme: Highcharts.Options = {
  chart: {
    backgroundColor: "#ffffff"
  },
  title: {
    style: { color: "#111827" }
  }
};
// Dark theme configuration
export const darkTheme: Highcharts.Options = {
  chart: {
    backgroundColor: "#111827"
  },
  title: {
    style: { color: "#ffffff" }
  },
  xAxis: {
    labels: { style: { color: "#ffffff" } }
  },
  yAxis: {
    labels: { style: { color: "#ffffff" } }
  }
};
