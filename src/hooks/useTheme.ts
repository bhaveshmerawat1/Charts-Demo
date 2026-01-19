/**
 * Custom hook for theme management
 * Persists theme preference to localStorage
 */

import { useState, useEffect } from "react";
import type { Theme } from "@/types/dashboard";

const THEME_STORAGE_KEY = "dashboard-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from localStorage or default to "light"
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    }
    return "light";
  });

  useEffect(() => {
    // Persist theme to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}

