"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "activeItem";
  type?: "button" | "submit" | "reset";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  arialabel?: string;
  isTestID?: string
  icon?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
  type = "button",
  arialabel,
  onMouseEnter,
  onMouseLeave,
  isTestID,
  icon
}) => {
  const baseStyles =
    "flex items-center justify-center gap-0 px-4 py-2 group transition-all duration-400 ease-in-out relative cursor-pointer text-md";

  const variantStyles: Record<string, string> = {
    primary:
      "border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 bg-white hover:bg-gray-600 hover:text-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
    secondary:
      "border border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 rounded-sm hover:bg-red-600 hover:text-white hover:border-red-600 dark:hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
    activeItem:
      "border border-gray-300 text-white bg-gray-600 rounded-sm hover:bg-white hover:text-gray-600",
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      type={type}
      aria-label={arialabel}
      className={clsx(baseStyles, variantStyles[variant], className)}
      data-testid={isTestID}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;