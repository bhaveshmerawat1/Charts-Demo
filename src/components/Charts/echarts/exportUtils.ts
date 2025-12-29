import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { SeriesOption } from "echarts";

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartDataContext {
  data: any[];
  series: Array<{
    type: string;
    name?: string;
    dataKey?: string;
    nameAccessor?: (item: any) => string;
    valueAccessor?: (item: any) => number;
    dataAccessor?: (item: any, index: number) => any;
    xAccessor?: (item: any) => any;
    yAccessor?: (item: any) => any;
  }>;
  xKey?: string;
  nameKey?: string;
  valueKey?: string;
  title?: string;
}

/**
 * Get nested value from object using dot notation
 */
function getValue(item: any, accessor?: Function, key?: string, index?: number): any {
  if (accessor) return accessor(item, index);
  if (key) {
    const keys = key.split(".");
    let value = item;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    return value;
  }
  return undefined;
}

/**
 * Transform chart data into table format based on chart type
 */
export function getChartDataAsTable(context: ChartDataContext): TableData {
  const { data, series, xKey = "name", nameKey = "name", valueKey = "value" } = context;
  
  if (!data || data.length === 0) {
    return { headers: [], rows: [] };
  }

  const firstSeries = series[0];
  const chartType = firstSeries?.type || "bar";

  switch (chartType) {
    case "pie":
    case "funnel":
    case "gauge": {
      const headers = ["Name", "Value"];
      const rows = data.map((item) => {
        const name = firstSeries.nameAccessor?.(item) || getValue(item, undefined, nameKey) || "";
        const value = firstSeries.valueAccessor?.(item) || getValue(item, undefined, valueKey) || 0;
        const total = data.reduce((sum, d) => {
          const v = firstSeries.valueAccessor?.(d) || getValue(d, undefined, valueKey) || 0;
          return sum + (typeof v === "number" ? v : 0);
        }, 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
        return [name, value, `${percentage}%`];
      });
      return { headers: ["Name", "Value", "Percentage"], rows };
    }

    case "scatter": {
      const headers = ["Name", "X Value", "Y Value"];
      const rows = data.map((item) => {
        const x = firstSeries.xAccessor?.(item) ?? item.x ?? getValue(item, undefined, "x") ?? 0;
        const y = firstSeries.yAccessor?.(item) ?? item.y ?? getValue(item, undefined, "y") ?? item.value ?? 0;
        const name = item.name || "";
        return [name, x, y];
      });
      return { headers, rows };
    }

    case "radar": {
      const headers = ["Indicator", "Value"];
      const rows = data.map((item) => {
        const name = getValue(item, undefined, nameKey) || "";
        const value = firstSeries.dataAccessor
          ? firstSeries.dataAccessor(item, 0)
          : getValue(item, undefined, valueKey) || 0;
        return [name, value];
      });
      return { headers, rows };
    }

    case "bar":
    case "line":
    default: {
      // For bar/line charts, create columns: X-axis labels, then each series
      const headers = [xKey.charAt(0).toUpperCase() + xKey.slice(1)];
      
      // Add series names as headers
      series.forEach((s) => {
        headers.push(s.name || s.dataKey || "Value");
      });

      // Build rows
      const rows = data.map((item) => {
        const row: (string | number)[] = [getValue(item, undefined, xKey) || ""];
        
        series.forEach((s) => {
          let value: any;
          if (s.dataAccessor) {
            value = s.dataAccessor(item, 0);
          } else if (s.dataKey) {
            value = getValue(item, undefined, s.dataKey);
          } else {
            value = getValue(item, undefined, valueKey) || 0;
          }
          row.push(value);
        });
        
        return row;
      });

      return { headers, rows };
    }
  }
}

/**
 * Export chart data to CSV format
 */
export function exportToCSV(
  tableData: TableData,
  fileName: string = "chart-data"
): void {
  const { headers, rows } = tableData;

  // Create CSV content
  let csvContent = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(",") + "\n";
  
  rows.forEach((row) => {
    csvContent += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n";
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export chart data to Excel format
 */
export function exportToExcel(
  tableData: TableData,
  fileName: string = "chart-data",
  sheetName: string = "Chart Data"
): void {
  const { headers, rows } = tableData;

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  const colWidths = headers.map((_, colIndex) => {
    const maxLength = Math.max(
      headers[colIndex].toString().length,
      ...rows.map((row) => String(row[colIndex] || "").length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
  });
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * Export chart to PDF with image and data table
 */
export function exportToPDF(
  chartImageUrl: string,
  tableData: TableData,
  fileName: string = "chart",
  title?: string,
  options?: {
    pageSize?: "a4" | "letter";
    orientation?: "portrait" | "landscape";
    margin?: number;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const pageSize = options?.pageSize || "a4";
    const orientation = options?.orientation || "portrait";
    const margin = options?.margin || 20;

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: pageSize,
    });

    // Add title if provided
    if (title) {
      pdf.setFontSize(18);
      pdf.text(title, margin, margin + 10);
    }

    // Load chart image
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const imgWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
        const imgHeight = (img.height * imgWidth) / img.width;
        
        // Add chart image
        const yStart = title ? margin + 20 : margin;
        pdf.addImage(chartImageUrl, "PNG", margin, yStart, imgWidth, imgHeight);

        // Calculate position for table
        let yPosition = yStart + imgHeight + 15;

        // Check if we need a new page
        if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add data table
        autoTable(pdf, {
          head: [tableData.headers],
          body: tableData.rows,
          startY: yPosition,
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        // Save PDF
        pdf.save(`${fileName}.pdf`);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load chart image"));
    };

    img.src = chartImageUrl;
  });
}

