"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { MdLightMode, MdOutlineLightMode } from 'react-icons/md';
import Button from '@/components/Button/Button';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className, showLabel = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="primary"
      className={className}
      icon={theme === "light" ? <MdLightMode /> : <MdOutlineLightMode />}
    >
      {showLabel && (theme === "light" ? "Dark" : "Light")}
    </Button>
  );
}
