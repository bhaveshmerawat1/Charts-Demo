"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export type Branch = { city: string; country?: string;[key: string]: any };
export type YearlyData = { year: number; employees: { total: number; newJoins?: number; left?: number }; projectsCompleted?: number };

export type CompanyData = {
  companyInfo: {
    companyName?: string;
    industry?: string;
    totalCompanies?: number;
    totalEmployees?: number;
    branchesCount?: number;
    [key: string]: any;
  };
  branches: Branch[];
  yearlyData: YearlyData[];
};

export type Filters = { branchSearch?: string; country?: string; year?: number };

export type CompanyDashboardContextType = {
  companyData: CompanyData | null;
  filteredBranches: Branch[];
  filteredYearlyData: YearlyData[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  refresh: () => Promise<void>;
};

const CompanyDashboardContext = createContext<CompanyDashboardContextType | undefined>(undefined);

export function CompanyDashboardProvider({ children }: { children: React.ReactNode }) {
  // const { theme, toggleTheme } = useTheme();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>({});

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/company');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      // API returns { success: boolean, data: ... }  
      const payload = body?.data ?? body;
      // Ensure we set null when payload is not object
      if (payload && typeof payload === 'object') {
        setCompanyData(payload as CompanyData);
      } else {
        setCompanyData(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load company data');
      setCompanyData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const setFilters = useCallback((partial: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const filteredBranches = useMemo(() => {
    const branchSearch = filters.branchSearch?.toLowerCase() ?? '';
    const country = filters.country;
    if (!companyData?.branches) return [];
    return companyData.branches.filter(b => {
      if (branchSearch && !(`${b.city || ''}`.toLowerCase().includes(branchSearch) || `${b.country || ''}`.toLowerCase().includes(branchSearch))) return false;
      if (country && b.country !== country) return false;
      return true;
    });
  }, [companyData, filters]);

  const filteredYearlyData = useMemo(() => {
    if (!companyData?.yearlyData) return [];
    if (!filters.year) return companyData.yearlyData;
    return companyData.yearlyData.filter(y => y.year === filters.year);
  }, [companyData, filters]);

  const value: CompanyDashboardContextType = {
    companyData,
    filteredBranches,
    filteredYearlyData,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchCompanies,
  };

  return <CompanyDashboardContext.Provider value={value}>{children}</CompanyDashboardContext.Provider>;
}

export const useCompanyDashboard = () => {
  const ctx = useContext(CompanyDashboardContext);
  if (!ctx) throw new Error('useCompanyDashboard must be used within CompanyDashboardProvider');
  return ctx;
};