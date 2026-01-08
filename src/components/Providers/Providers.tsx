"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { CompanyDashboardProvider } from "@/components/SubComponents/CompanyDashboard/CompanyDashboardContext";
import { StockProvider } from "@/contexts/StockContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StockProvider>
        <CompanyDashboardProvider>
          {children}
        </CompanyDashboardProvider>
      </StockProvider>
    </ThemeProvider>
  );
}
