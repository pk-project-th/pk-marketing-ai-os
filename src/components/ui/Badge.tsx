"use client";

import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "gold" | "ai" | "success" | "danger" | "warning" | "stage";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
  size = "md"
}) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  const variantMap = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    gold: "bg-[#FAF6EE] text-[#A2834E] border-[#EADEC6] font-semibold",
    ai: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE] font-semibold",
    success: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] font-semibold",
    danger: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
    warning: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
    stage: "bg-[#17181A] text-white border-[#17181A] font-mono font-bold tracking-wider",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses} ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
