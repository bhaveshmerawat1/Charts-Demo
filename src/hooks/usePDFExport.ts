/**
 * Custom hook for PDF export functionality
 */

import { useState, useRef } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import type { Theme } from "@/types/dashboard";

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async (theme: Theme) => {
    if (!pageRef.current || isExporting) return;

    try {
      setIsExporting(true);

      // Capture the page content
      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: theme === "dark" ? "#111827" : "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save("analytics-dashboard.pdf");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    pageRef,
    isExporting,
    handleExportPDF,
  };
}

