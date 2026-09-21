"use client";
import React from 'react';

export const MaskedHeading = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`masked-gradient-text font-extrabold tracking-tight ${className}`}>
      {children}
    </div>
  );
};
