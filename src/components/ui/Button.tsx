"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "ai" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: any;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-4 py-2.5 text-xs md:text-sm rounded-xl font-semibold",
    lg: "px-6 py-3 text-sm font-bold rounded-2xl",
  }[size];

  const variantClasses = {
    primary: "bg-[#17181A] text-white hover:bg-[#27282D] shadow-luxury-sm",
    secondary: "bg-[#F1F2F5] text-[#17181A] hover:bg-[#E8E9EC] border border-[#E8E9EC]",
    gold: "bg-[#C9A96E] hover:bg-[#B89658] text-white font-bold shadow-luxury-sm",
    ai: "bg-[#8B7CF6] hover:bg-[#7C3AED] text-white font-bold shadow-luxury-sm",
    outline: "bg-white border border-[#E8E9EC] text-[#17181A] hover:bg-[#F7F8FA]",
    ghost: "bg-transparent text-slate-600 hover:text-[#17181A] hover:bg-slate-100",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
