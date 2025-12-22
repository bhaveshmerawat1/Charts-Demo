"use client";

import Highcharts from "highcharts";
import Exporting from "highcharts/modules/exporting";
import ExportData from "highcharts/modules/export-data";
import Drilldown from "highcharts/modules/drilldown";
import Accessibility from "highcharts/modules/accessibility";

if (typeof window !== "undefined") {
  Exporting(Highcharts);
  ExportData(Highcharts);
  Drilldown(Highcharts);
  Accessibility(Highcharts);
}

export default Highcharts;