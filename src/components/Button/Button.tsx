"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary"
  type?: "button" | "submit" | "reset";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  arialabel?: string;
  isTestID?: string
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
  isTestID
}) => {
  const baseStyles =
    "flex items-center justify-center gap-0 px-3 py-2 group transition-all duration-400 ease-in-out w-full max-w-max relative cursor-pointer";

  const variantStyles: Record<string, string> = {
    primary:
      "border border-blue-600 rounded-sm text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "border border-red-600 text-red-600 rounded-sm hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      {children}
    </button>
  );
};

export default Button;