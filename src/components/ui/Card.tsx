"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-white border border-[#E8E9EC] rounded-[16px] p-5 shadow-luxury-card transition-all duration-200 ${
        hoverable ? "hover:border-[#D1D5DB] hover:shadow-luxury-hover hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
