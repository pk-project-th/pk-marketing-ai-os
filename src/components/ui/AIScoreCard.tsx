"use client";

import React from "react";
import { Sparkles, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface AIScoreCardProps {
  scores?: {
    audienceFit?: number;
    brandAlignment?: number;
    conversion?: number;
    visualQuality?: number;
  };
  onImprove?: () => void;
}

export const AIScoreCard: React.FC<AIScoreCardProps> = ({
  scores = {
    audienceFit: 92,
    brandAlignment: 95,
    conversion: 84,
    visualQuality: 91
  },
  onImprove
}) => {
  const avg = Math.round(
    ((scores.audienceFit || 90) + (scores.brandAlignment || 90) + (scores.conversion || 80) + (scores.visualQuality || 90)) / 4
  );

  return (
    <div className="bg-white border border-[#E8E9EC] rounded-2xl p-4 shadow-luxury-card space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E9EC]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 text-[#8B7CF6] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#17181A]">AI Content Quality Score</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-xs border border-emerald-200">
          <TrendingUp className="w-3 h-3" />
          <span>{avg}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E8E9EC]">
          <div className="text-[10px] text-slate-500">Audience Fit</div>
          <div className="text-sm font-black text-[#17181A] mt-0.5">{scores.audienceFit}%</div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#3FA77A] h-full" style={{ width: `${scores.audienceFit}%` }} />
          </div>
        </div>

        <div className="bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E8E9EC]">
          <div className="text-[10px] text-slate-500">Brand Voice</div>
          <div className="text-sm font-black text-[#17181A] mt-0.5">{scores.brandAlignment}%</div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#C9A96E] h-full" style={{ width: `${scores.brandAlignment}%` }} />
          </div>
        </div>

        <div className="bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E8E9EC]">
          <div className="text-[10px] text-slate-500">Conversion</div>
          <div className="text-sm font-black text-[#17181A] mt-0.5">{scores.conversion}%</div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#8B7CF6] h-full" style={{ width: `${scores.conversion}%` }} />
          </div>
        </div>

        <div className="bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E8E9EC]">
          <div className="text-[10px] text-slate-500">Visual Quality</div>
          <div className="text-sm font-black text-[#17181A] mt-0.5">{scores.visualQuality}%</div>
          <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#3FA77A] h-full" style={{ width: `${scores.visualQuality}%` }} />
          </div>
        </div>
      </div>

      {onImprove && (
        <button
          type="button"
          onClick={onImprove}
          className="w-full py-1.5 rounded-xl bg-[#F7F8FA] hover:bg-slate-100 border border-[#E8E9EC] text-[11px] font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-[#C9A96E]" />
          <span>Improve with AI Recommendation</span>
        </button>
      )}
    </div>
  );
};
