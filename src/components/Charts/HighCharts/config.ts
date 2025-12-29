"use client";

import Highcharts from "highcharts";
import Exporting from "highcharts/modules/exporting";
import ExportData from "highcharts/modules/export-data";
import Drilldown from "highcharts/modules/drilldown";
import Accessibility from "highcharts/modules/accessibility";
import OfflineExporting from "highcharts/modules/offline-exporting";

// Defensive defaults applied at import time so any downstream Highcharts
// module that reads options (e.g., drilldown) won't encounter undefined
// references if modules initialize before client-side initialization runs.
try {
  // In some environments the imported Highcharts object is a wrapper and
  // `setOptions` may not be available yet — check before calling.
  if (typeof (Highcharts as any).setOptions === "function") {
    Highcharts.setOptions({
      drilldown: { activeDataLabelStyle: {} },
      plotOptions: {
        series: {
          dataLabels: {
            activeDataLabelStyle: {}
          }
        }
      }
    } as any);
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn("Could not apply defensive Highcharts defaults at import time:", err);
}

if (typeof window !== "undefined") {
  // Apply client-only defaults and module init
  try {
    Highcharts.setOptions({
      exporting: {
        // Prefer client-side offline exporting; disable fallback to server to
        // avoid network "Failed to fetch" errors when offline or blocked.
        fallbackToExportServer: false
      }
    } as any);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to set Highcharts client defaults:", err);
  }

  // Initialize modules after defensive defaults are in place.
  Exporting(Highcharts);
  ExportData(Highcharts);
  Drilldown(Highcharts);
  Accessibility(Highcharts);
  OfflineExporting(Highcharts);
}

export default Highcharts;