// Define available chart types as a constant array
export const CHART_TYPES = [
  "line",
  "area",
  "bar",
  "column",
  "pie",
  "scatter",
  "spline",
  "areaspline"
] as const;

export type ChartType = typeof CHART_TYPES[number];
// Define a type ChartType as any of the values in CHART_TYPES array