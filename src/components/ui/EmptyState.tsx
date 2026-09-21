"use client";

import React from "react";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  icon?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "You're all caught up ✨",
  description = "ยังไม่มีเนื้อหาในรายการนี้ ให้ AI ช่วยเริ่มต้นคิดและสร้างคอนเทนต์สำหรับคุณได้ทันที",
  actionLabel = "+ Create Content",
  onAction,
  secondaryLabel = "Generate with AI",
  onSecondaryAction,
  icon: Icon = Sparkles
}) => {
  return (
    <div className="bg-white border border-[#E8E9EC] rounded-2xl p-8 md:p-12 text-center max-w-lg mx-auto my-6 shadow-luxury-card">
      <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] border border-[#EADEC6] text-[#C9A96E] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-[#17181A]">{title}</h3>
      <p className="text-xs md:text-sm text-[#6B7280] mt-1.5 leading-relaxed max-w-md mx-auto">
        {description}
      </p>

      {(onAction || onSecondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {onSecondaryAction && (
            <Button variant="gold" size="sm" onClick={onSecondaryAction} icon={Sparkles}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
