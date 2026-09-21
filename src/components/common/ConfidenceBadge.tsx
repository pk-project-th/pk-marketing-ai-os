import React from "react";
import { ConfidenceLevel } from "@/types";

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel | string;
  score?: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, score }) => {
  const getStyle = () => {
    switch (confidence) {
      case "HIGH":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-700/50";
      case "MEDIUM":
        return "bg-amber-950/60 text-amber-300 border-amber-700/50";
      case "LOW":
        return "bg-rose-950/60 text-rose-300 border-rose-700/50";
      default:
        return "bg-slate-900 text-slate-400 border-slate-800";
    }
  };

  const getLabel = () => {
    switch (confidence) {
      case "HIGH": return "มั่นใจสูง (High)";
      case "MEDIUM": return "ปานกลาง (Med)";
      case "LOW": return "ไม่แน่นอน (Low)";
      default: return confidence;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      <span>{getLabel()}</span>
      {score !== undefined && <span className="opacity-75 font-mono">({Math.round(score * 100)}%)</span>}
    </span>
  );
};
